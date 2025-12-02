import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useGame } from '../contexts/GameContext';
import StorageService from '../services/StorageService';
import { ExperienceBar } from '../components/GameUI';

export default function ProfileScreen({ navigation }) {
  const { userStats, checkins, getLevelInfo, getRecentCheckins } = useGame();

  if (!userStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  const levelInfo = getLevelInfo();
  const recentCheckins = getRecentCheckins(5);
  const totalVisitedPlaces = Object.keys(userStats.categoryVisits || {}).reduce(
    (sum, key) => sum + userStats.categoryVisits[key],
    0
  );

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 게임 데이터가 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllData();
            Alert.alert('완료', '데이터가 초기화되었습니다. 앱을 재시작해주세요.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 게임 UI - 경험치 바 */}
      <ExperienceBar
        current={levelInfo.progress.current}
        max={levelInfo.progress.max}
        level={levelInfo.level.level}
      />

      <ScrollView style={styles.scrollContent}>
        {/* 레벨 카드 */}
        <View style={styles.levelCard}>
          <Text style={styles.levelIcon}>{levelInfo.level.icon}</Text>
          <Text style={styles.levelTitle}>{levelInfo.level.title}</Text>
          <Text style={styles.levelNumber}>Level {levelInfo.level.level}</Text>
          <Text style={styles.levelSubtitle}>
            다음 레벨까지 {levelInfo.progress.max - levelInfo.progress.current} XP
          </Text>
        </View>

      {/* 통계 카드 */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>통계</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.totalPoints}</Text>
            <Text style={styles.statLabel}>총 포인트</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.totalCheckins}</Text>
            <Text style={styles.statLabel}>총 체크인</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.currentStreak}</Text>
            <Text style={styles.statLabel}>연속 방문</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Object.keys(userStats.regionVisits || {}).length}
            </Text>
            <Text style={styles.statLabel}>방문 지역</Text>
          </View>
        </View>
      </View>

      {/* 카테고리별 방문 */}
      <View style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>카테고리별 방문</Text>
        {Object.entries(userStats.categoryVisits || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category, count]) => (
            <View key={category} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{category}</Text>
              <View style={styles.categoryBarContainer}>
                <View
                  style={[
                    styles.categoryBar,
                    {
                      width: `${
                        (count / Math.max(...Object.values(userStats.categoryVisits))) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{count}</Text>
            </View>
          ))}
      </View>

      {/* 최근 체크인 */}
      <View style={styles.recentCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 체크인</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.seeAllText}>더보기</Text>
          </TouchableOpacity>
        </View>

        {recentCheckins.length === 0 ? (
          <Text style={styles.emptyText}>아직 체크인 기록이 없습니다.</Text>
        ) : (
          recentCheckins.map((checkin) => (
            <View key={checkin.id} style={styles.checkinItem}>
              <View style={styles.checkinInfo}>
                <Text style={styles.checkinName}>{checkin.name}</Text>
                <Text style={styles.checkinDate}>
                  {new Date(checkin.timestamp).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              {checkin.isFirstDiscovery && (
                <View style={styles.firstBadge}>
                  <Text style={styles.firstBadgeText}>첫 발견</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* 설정 버튼 */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
        <Text style={styles.resetButtonText}>⚠️ 데이터 초기화</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    margin: 15,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  levelIcon: {
    fontSize: 80,
    marginBottom: 10,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  levelNumber: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  levelSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  categoryCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    width: 80,
    fontSize: 14,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  categoryCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  recentCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  checkinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkinInfo: {
    flex: 1,
  },
  checkinName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  checkinDate: {
    fontSize: 12,
    color: '#666',
  },
  firstBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  firstBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f44336',
  },
  resetButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    height: 30,
  },
});
