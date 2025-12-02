import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { POPULAR_PLACES, CATEGORY_INFO } from '../data/categories';
import { useGame } from '../contexts/GameContext';
import GoogleMapView from '../components/GoogleMapView.web';

const { width, height } = Dimensions.get('window');
const USE_GOOGLE_MAPS = !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapScreen({ navigation }) {
  const { performCheckin, hasVisited, getVisitCount } = useGame();
  const [location, setLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState(POPULAR_PLACES);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      Alert.alert('위치 정보 미지원', '브라우저에서 위치 정보를 지원하지 않습니다.');
      setDefaultLocation();
      return;
    }

    // 위치 권한 요청
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setLocationPermission('granted');
        findNearbyPlaces(newLocation);

        // 위치 변경 감지
        navigator.geolocation.watchPosition(
          (position) => {
            const updatedLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(updatedLocation);
            findNearbyPlaces(updatedLocation);
          },
          (error) => console.log('위치 업데이트 오류:', error),
          { enableHighAccuracy: true, maximumAge: 30000 }
        );
      },
      (error) => {
        console.log('위치 권한 오류:', error);
        setLocationPermission('denied');
        Alert.alert(
          '위치 권한 필요',
          '이 앱은 주변 여행지를 찾기 위해 위치 정보가 필요합니다. 브라우저 설정에서 위치 권한을 허용해주세요.',
          [
            { text: '기본 위치 사용', onPress: setDefaultLocation },
            { text: '닫기', style: 'cancel' }
          ]
        );
        setDefaultLocation();
      },
      { enableHighAccuracy: true }
    );
  };

  const setDefaultLocation = () => {
    const defaultLoc = { latitude: 37.5665, longitude: 126.9780 };
    setLocation(defaultLoc);
    findNearbyPlaces(defaultLoc);
  };

  const findNearbyPlaces = (userLocation) => {
    const nearby = POPULAR_PLACES.map(place => {
      const distance = getDistance(
        userLocation.latitude,
        userLocation.longitude,
        place.lat,
        place.lng
      );
      return { ...place, distance };
    }).sort((a, b) => a.distance - b.distance);

    setNearbyPlaces(nearby);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
    setModalVisible(true);
  };

  const handleCheckin = async () => {
    if (!selectedPlace || !location) return;

    if (selectedPlace.distance > 500) {
      Alert.alert(
        '체크인 불가',
        '장소에서 500m 이내에 있어야 체크인할 수 있습니다.'
      );
      return;
    }

    const result = await performCheckin({
      placeId: selectedPlace.name,
      name: selectedPlace.name,
      category: selectedPlace.category,
      region: selectedPlace.region || 'unknown',
      latitude: selectedPlace.lat,
      longitude: selectedPlace.lng,
      address: selectedPlace.name,
      isFirstDiscovery: !hasVisited(selectedPlace.name),
    });

    if (result.success) {
      setModalVisible(false);

      if (result.newAchievements && result.newAchievements.length > 0) {
        const achievementText = result.newAchievements
          .map(a => `${a.icon} ${a.title}`)
          .join('\n');

        Alert.alert(
          '🎉 새로운 업적 달성!',
          achievementText,
          [
            { text: '확인', onPress: () => navigation.navigate('Achievements') },
            { text: '닫기', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('체크인 완료!', '방문 기록이 저장되었습니다.');
      }
    } else {
      Alert.alert('오류', result.error || '체크인에 실패했습니다.');
    }
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>위치 정보를 가져오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Google Maps 또는 플레이스홀더 */}
      {USE_GOOGLE_MAPS ? (
        <GoogleMapView
          location={location}
          places={nearbyPlaces}
          onMarkerClick={handleMarkerPress}
          selectedPlace={selectedPlace}
          recenterTrigger={recenterTrigger}
        />
      ) : (
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapTitle}>🗺️ 여행지 탐험</Text>
          <Text style={styles.webMapSubtitle}>
            {locationPermission === 'granted'
              ? '실시간 위치 추적 중'
              : 'Google Maps API 키를 추가하면 실제 지도를 볼 수 있습니다'}
          </Text>
          <Text style={styles.locationInfo}>
            현재 위치: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => Alert.alert(
              '위치 정보',
              `위도: ${location.latitude}\n경도: ${location.longitude}\n\n권한 상태: ${locationPermission || '확인 중'}`
            )}
          >
            <Text style={styles.demoButtonText}>📍 위치 정보 보기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 내 위치로 이동 버튼 */}
      {location && (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={() => setRecenterTrigger(prev => prev + 1)}
        >
          <Text style={styles.myLocationIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* 근처 장소 목록 */}
      <View style={styles.nearbyContainer}>
        <Text style={styles.nearbyTitle}>
          전국 주요 여행지 ({nearbyPlaces.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyPlaces.slice(0, 20).map((place, index) => {
            const categoryInfo = CATEGORY_INFO[place.category];
            const visited = hasVisited(place.name);
            const visitCount = getVisitCount(place.name);

            return (
              <TouchableOpacity
                key={index}
                style={[styles.placeCard, visited && styles.visitedCard]}
                onPress={() => handleMarkerPress(place)}
              >
                <Text style={styles.placeIcon}>{categoryInfo.icon}</Text>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.placeDistance}>
                  {place.distance < 1000
                    ? `${Math.round(place.distance)}m`
                    : `${(place.distance / 1000).toFixed(1)}km`}
                </Text>
                {visited && (
                  <View style={styles.visitBadge}>
                    <Text style={styles.visitBadgeText}>✓ {visitCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 장소 상세 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlace && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>
                    {CATEGORY_INFO[selectedPlace.category].icon}
                  </Text>
                  <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>카테고리</Text>
                  <Text style={styles.modalInfoText}>
                    {CATEGORY_INFO[selectedPlace.category].name}
                  </Text>
                </View>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>거리</Text>
                  <Text style={styles.modalInfoText}>
                    {selectedPlace.distance < 1000
                      ? `${Math.round(selectedPlace.distance)}m`
                      : `${(selectedPlace.distance / 1000).toFixed(1)}km`}
                  </Text>
                </View>

                {hasVisited(selectedPlace.name) && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoLabel}>방문 기록</Text>
                    <Text style={styles.modalInfoText}>
                      {getVisitCount(selectedPlace.name)}회 방문
                    </Text>
                  </View>
                )}

                <Text style={styles.demoNote}>
                  ⚠️ 데모 버전: 실제 위치와 관계없이 체크인 가능
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.checkinButton]}
                    onPress={handleCheckin}
                  >
                    <Text style={styles.checkinButtonText}>
                      {hasVisited(selectedPlace.name) ? '재방문 체크인' : '체크인'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 20,
  },
  webMapTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E7D32',
  },
  webMapSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    maxWidth: 500,
  },
  locationInfo: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  demoButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nearbyContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  placeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 5,
    width: 120,
    alignItems: 'center',
  },
  visitedCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  placeIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  placeName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
    textAlign: 'center',
  },
  placeDistance: {
    fontSize: 11,
    color: '#666',
  },
  visitBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  visitBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  demoNote: {
    fontSize: 12,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 15,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  checkinButton: {
    backgroundColor: '#4CAF50',
  },
  checkinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  myLocationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  myLocationIcon: {
    fontSize: 24,
  },
});
