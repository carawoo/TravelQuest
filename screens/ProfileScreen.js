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
    backgroundColor: '#F5EFE6',
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#F5EFE6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EFE6',
  },
  levelCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 4,
    borderColor: '#D4AF37',
  },
  levelIcon: {
    fontSize: 90,
    marginBottom: 10,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  levelTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
    textShadowColor: 'rgba(139, 105, 20, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelNumber: {
    fontSize: 22,
    color: '#3E2723',
    fontWeight: '700',
  },
  levelSubtitle: {
    fontSize: 15,
    color: '#6B4423',
    marginTop: 5,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D4A574',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#8B6914',
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#D4AF37',
    textShadowColor: 'rgba(139, 105, 20, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B4423',
    marginTop: 5,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D4A574',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    width: 80,
    fontSize: 15,
    color: '#3E2723',
    fontWeight: '600',
  },
  categoryBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E8DCC4',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#D4AF37',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  categoryCount: {
    width: 30,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#D4AF37',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D4A574',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B4423',
    paddingVertical: 20,
    fontSize: 14,
  },
  checkinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC4',
  },
  checkinInfo: {
    flex: 1,
  },
  checkinName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
    color: '#3E2723',
  },
  checkinDate: {
    fontSize: 13,
    color: '#6B4423',
  },
  firstBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B6914',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  firstBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#C1666B',
  },
  resetButtonText: {
    color: '#C1666B',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    height: 30,
  },
});
