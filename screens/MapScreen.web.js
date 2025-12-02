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

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const { performCheckin, hasVisited, getVisitCount } = useGame();
  const [location, setLocation] = useState({ latitude: 37.5665, longitude: 126.9780 }); // 서울 기본 위치
  const [nearbyPlaces, setNearbyPlaces] = useState(POPULAR_PLACES);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // 웹에서는 geolocation API 사용
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          findNearbyPlaces(newLocation);
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
          // 기본 위치로 근처 장소 찾기
          findNearbyPlaces(location);
        }
      );
    } else {
      findNearbyPlaces(location);
    }
  }, []);

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

  return (
    <View style={styles.container}>
      {/* 웹용 지도 플레이스홀더 */}
      <View style={styles.webMapPlaceholder}>
        <Text style={styles.webMapTitle}>🗺️ 여행지 탐험</Text>
        <Text style={styles.webMapSubtitle}>
          데모 버전입니다. 모바일 앱에서 실제 지도 기능을 이용하실 수 있습니다.
        </Text>
        <Text style={styles.locationInfo}>
          현재 위치: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => Alert.alert('데모 모드', '실제 앱에서는 GPS를 통해 자동으로 위치를 추적합니다.')}
        >
          <Text style={styles.demoButtonText}>📍 위치 정보 보기</Text>
        </TouchableOpacity>
      </View>

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
});
