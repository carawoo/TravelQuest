import StorageService from './StorageService';

const LOCATION_HISTORY_KEY = '@travelquest_location_history';
const CURRENT_ROUTE_KEY = '@travelquest_current_route';
const MIN_DISTANCE_METERS = 10; // 10m 이상 이동시에만 기록
const TRACKING_INTERVAL_MS = 5000; // 5초마다 위치 확인

class LocationTrackingService {
  constructor() {
    this.watchId = null;
    this.currentRoute = [];
    this.isTracking = false;
    this.lastPosition = null;
  }

  // 위치 추적 시작
  async startTracking() {
    if (this.isTracking) return;

    this.isTracking = true;

    // 기존 경로 불러오기
    const savedRoute = await this.getCurrentRoute();
    if (savedRoute && savedRoute.length > 0) {
      this.currentRoute = savedRoute;
      this.lastPosition = savedRoute[savedRoute.length - 1];
    }

    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => console.error('위치 추적 오류:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
          distanceFilter: MIN_DISTANCE_METERS,
        }
      );
    }

    console.log('위치 추적 시작');
  }

  // 위치 추적 중지
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('위치 추적 중지');
  }

  // 위치 업데이트 처리
  async handlePositionUpdate(position) {
    const newPoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now(),
      accuracy: position.coords.accuracy,
      speed: position.coords.speed,
    };

    // 이전 위치와의 거리 계산
    if (this.lastPosition) {
      const distance = this.calculateDistance(
        this.lastPosition.latitude,
        this.lastPosition.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      // 최소 거리 이상 이동했을 때만 기록
      if (distance < MIN_DISTANCE_METERS) {
        return;
      }
    }

    this.currentRoute.push(newPoint);
    this.lastPosition = newPoint;

    // 경로 저장 (최대 1000개 포인트)
    if (this.currentRoute.length > 1000) {
      await this.saveRouteToHistory();
      this.currentRoute = [newPoint];
    } else {
      await this.saveCurrentRoute();
    }
  }

  // 현재 경로 저장
  async saveCurrentRoute() {
    try {
      await StorageService.setItem(
        CURRENT_ROUTE_KEY,
        JSON.stringify(this.currentRoute)
      );
    } catch (error) {
      console.error('경로 저장 오류:', error);
    }
  }

  // 현재 경로 불러오기
  async getCurrentRoute() {
    try {
      const data = await StorageService.getItem(CURRENT_ROUTE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('경로 불러오기 오류:', error);
      return [];
    }
  }

  // 경로를 히스토리에 저장
  async saveRouteToHistory() {
    if (this.currentRoute.length === 0) return;

    try {
      const history = await this.getLocationHistory();

      const routeData = {
        id: Date.now().toString(),
        startTime: this.currentRoute[0].timestamp,
        endTime: this.currentRoute[this.currentRoute.length - 1].timestamp,
        points: this.currentRoute,
        totalDistance: this.calculateTotalDistance(this.currentRoute),
        duration: this.currentRoute[this.currentRoute.length - 1].timestamp - this.currentRoute[0].timestamp,
      };

      history.push(routeData);

      // 최대 30일치 데이터만 보관
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const filtered = history.filter(route => route.endTime > thirtyDaysAgo);

      await StorageService.setItem(
        LOCATION_HISTORY_KEY,
        JSON.stringify(filtered)
      );

      // 현재 경로 초기화
      this.currentRoute = [];
      await StorageService.setItem(CURRENT_ROUTE_KEY, JSON.stringify([]));

      console.log('경로 히스토리 저장 완료');
    } catch (error) {
      console.error('히스토리 저장 오류:', error);
    }
  }

  // 위치 히스토리 불러오기
  async getLocationHistory() {
    try {
      const data = await StorageService.getItem(LOCATION_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('히스토리 불러오기 오류:', error);
      return [];
    }
  }

  // 오늘의 총 이동 거리
  async getTodayDistance() {
    const today = new Date().setHours(0, 0, 0, 0);
    const history = await this.getLocationHistory();
    const currentRoute = await this.getCurrentRoute();

    let totalDistance = 0;

    // 히스토리에서 오늘 데이터
    history.forEach(route => {
      if (route.startTime >= today) {
        totalDistance += route.totalDistance;
      }
    });

    // 현재 진행 중인 경로
    if (currentRoute.length > 1) {
      totalDistance += this.calculateTotalDistance(currentRoute);
    }

    return totalDistance;
  }

  // 거리 계산 (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // 경로의 총 거리 계산
  calculateTotalDistance(route) {
    if (route.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < route.length; i++) {
      totalDistance += this.calculateDistance(
        route[i - 1].latitude,
        route[i - 1].longitude,
        route[i].latitude,
        route[i].longitude
      );
    }

    return totalDistance;
  }

  // 현재 추적 상태
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      pointsRecorded: this.currentRoute.length,
      lastPosition: this.lastPosition,
    };
  }
}

export default new LocationTrackingService();
