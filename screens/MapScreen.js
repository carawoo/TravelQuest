import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import LocationService from '../services/LocationService';
import { POPULAR_PLACES, CATEGORY_INFO } from '../data/categories';
import { useGame } from '../contexts/GameContext';

// 웹에서는 react-native-maps를 사용하지 않음
let MapView, Marker, Circle;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Circle = maps.Circle;
}

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const { performCheckin, hasVisited, getVisitCount } = useGame();
  const [location, setLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    const permissionResult = await LocationService.requestPermissions();
    if (!permissionResult.success) {
      Alert.alert('권한 필요', permissionResult.message);
      return;
    }

    const currentLocation = await LocationService.getCurrentLocation();
    if (currentLocation) {
      setLocation(currentLocation);
      findNearbyPlaces(currentLocation);

      // 위치 모니터링 시작
      LocationService.startLocationMonitoring((newLocation) => {
        setLocation(newLocation);
        findNearbyPlaces(newLocation);
      });
    }
  };

  const findNearbyPlaces = (userLocation) => {
    const nearby = LocationService.findNearbyPlaces(
      userLocation,
      POPULAR_PLACES,
      5000 // 5km 반경
    );
    setNearbyPlaces(nearby);

    // 매우 가까운 장소 알림 (500m 이내)
    const veryNearby = nearby.filter(place => place.distance <= 500);
    if (veryNearby.length > 0 && !modalVisible) {
      const place = veryNearby[0];
      if (!hasVisited(place.name)) {
        LocationService.sendNearbyPlaceNotification(place);
      }
    }
  };

  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
    setModalVisible(true);
  };

  const handleCheckin = async () => {
    if (!selectedPlace || !location) return;

    // 거리 확인 (500m 이내만 체크인 가능)
    if (selectedPlace.distance > 500) {
      Alert.alert(
        '체크인 불가',
        '장소에서 500m 이내에 있어야 체크인할 수 있습니다.'
      );
      return;
    }

    const address = await LocationService.getAddressFromCoords(
      selectedPlace.lat,
      selectedPlace.lng
    );
    const region = LocationService.getRegionCode(address);

    const result = await performCheckin({
      placeId: selectedPlace.name,
      name: selectedPlace.name,
      category: selectedPlace.category,
      region: region || 'unknown',
      latitude: selectedPlace.lat,
      longitude: selectedPlace.lng,
      address: address?.fullAddress || '',
      isFirstDiscovery: !hasVisited(selectedPlace.name),
    });

    if (result.success) {
      setModalVisible(false);

      // 새 업적 알림
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

  const moveToMyLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
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
      {/* 웹에서는 지도 대신 장소 목록만 표시 */}
      {Platform.OS === 'web' ? (
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapTitle}>🗺️ 여행지 탐험</Text>
          <Text style={styles.webMapSubtitle}>
            모바일 앱에서 지도 기능을 이용하실 수 있습니다
          </Text>
          <Text style={styles.locationInfo}>
            현재 위치: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {nearbyPlaces.map((place, index) => {
              const categoryInfo = CATEGORY_INFO[place.category];
              const visited = hasVisited(place.name);

              return (
                <Marker
                  key={index}
                  coordinate={{ latitude: place.lat, longitude: place.lng }}
                  onPress={() => handleMarkerPress(place)}
                  pinColor={visited ? '#4CAF50' : categoryInfo.color}
                >
                  <View style={[styles.markerContainer, visited && styles.visitedMarker]}>
                    <Text style={styles.markerIcon}>{categoryInfo.icon}</Text>
                  </View>
                </Marker>
              );
            })}

            {/* 체크인 가능 범위 표시 (선택된 장소) */}
            {selectedPlace && (
              <Circle
                center={{ latitude: selectedPlace.lat, longitude: selectedPlace.lng }}
                radius={500}
                fillColor="rgba(76, 175, 80, 0.1)"
                strokeColor="rgba(76, 175, 80, 0.5)"
                strokeWidth={2}
              />
            )}
          </MapView>

          {/* 내 위치로 이동 버튼 */}
          <TouchableOpacity style={styles.myLocationButton} onPress={moveToMyLocation}>
            <Text style={styles.buttonIcon}>📍</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 근처 장소 목록 */}
      <View style={styles.nearbyContainer}>
        <Text style={styles.nearbyTitle}>
          근처 장소 ({nearbyPlaces.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {nearbyPlaces.slice(0, 10).map((place, index) => {
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

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.checkinButton,
                      selectedPlace.distance > 500 && styles.disabledButton,
                    ]}
                    onPress={handleCheckin}
                    disabled={selectedPlace.distance > 500}
                  >
                    <Text style={styles.checkinButtonText}>
                      {selectedPlace.distance > 500
                        ? '너무 멀어요'
                        : hasVisited(selectedPlace.name)
                        ? '재방문 체크인'
                        : '체크인'}
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
  },
  map: {
    flex: 1,
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
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  visitedMarker: {
    borderColor: '#2E7D32',
    opacity: 0.8,
  },
  markerIcon: {
    fontSize: 24,
  },
  myLocationButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    fontSize: 28,
  },
  nearbyContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 20,
  },
  webMapTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2E7D32',
  },
  webMapSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  locationInfo: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
