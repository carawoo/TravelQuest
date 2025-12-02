import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

// 두 좌표 사이의 거리 계산 (미터 단위)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // 지구 반경 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위
}

class LocationService {
  constructor() {
    this.watchSubscription = null;
    this.lastNotificationTime = 0;
    this.notificationCooldown = 300000; // 5분 (밀리초)
  }

  // 위치 권한 요청
  async requestPermissions() {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return { success: false, message: '위치 권한이 필요합니다.' };
      }

      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        console.warn('알림 권한이 거부되었습니다.');
      }

      return { success: true };
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return { success: false, message: '권한 요청 중 오류가 발생했습니다.' };
    }
  }

  // 현재 위치 가져오기
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  // 주소 정보 가져오기 (역 지오코딩)
  async getAddressFromCoords(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        return {
          city: address.city || address.region,
          district: address.district || address.subregion,
          street: address.street,
          fullAddress: [address.city, address.district, address.street]
            .filter(Boolean)
            .join(' '),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }

  // 근처 장소 찾기
  findNearbyPlaces(userLocation, places, radiusMeters = 500) {
    return places
      .map(place => {
        const distance = getDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.lat,
          place.lng
        );
        return { ...place, distance };
      })
      .filter(place => place.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  // 위치 모니터링 시작 (하이브리드 방식)
  async startLocationMonitoring(onNearbyPlaceFound) {
    if (this.watchSubscription) {
      return;
    }

    try {
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000, // 30초마다
          distanceInterval: 50, // 50미터 이동시
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          if (onNearbyPlaceFound) {
            onNearbyPlaceFound({ latitude, longitude });
          }
        }
      );
    } catch (error) {
      console.error('Error starting location monitoring:', error);
    }
  }

  // 위치 모니터링 중지
  stopLocationMonitoring() {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  // 근처 장소 알림 보내기
  async sendNearbyPlaceNotification(place) {
    const now = Date.now();
    if (now - this.lastNotificationTime < this.notificationCooldown) {
      return; // 쿨다운 중
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🗺️ 새로운 장소 발견!',
          body: `${place.name}이(가) 근처에 있습니다. 체크인하시겠어요?`,
          data: { placeId: place.id, place },
        },
        trigger: null, // 즉시 알림
      });
      this.lastNotificationTime = now;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // 지역 코드 추출 (주소 기반)
  getRegionCode(address) {
    if (!address || !address.city) return null;

    const regionMap = {
      서울: 'seoul',
      부산: 'busan',
      대구: 'daegu',
      인천: 'incheon',
      광주: 'gwangju',
      대전: 'daejeon',
      울산: 'ulsan',
      세종: 'sejong',
      경기: 'gyeonggi',
      강원: 'gangwon',
      충북: 'chungbuk',
      충남: 'chungnam',
      전북: 'jeonbuk',
      전남: 'jeonnam',
      경북: 'gyeongbuk',
      경남: 'gyeongnam',
      제주: 'jeju',
    };

    for (const [key, value] of Object.entries(regionMap)) {
      if (address.city && address.city.includes(key)) {
        return value;
      }
    }

    return null;
  }
}

export default new LocationService();
