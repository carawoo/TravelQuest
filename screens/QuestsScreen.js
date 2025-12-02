import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useGame } from '../contexts/GameContext';
import { DAILY_QUESTS, WEEKLY_QUESTS, getActiveQuests } from '../data/quests';
import { QuestProgress } from '../components/GameUI';

export default function QuestsScreen() {
  const { userStats } = useGame();
  const [selectedTab, setSelectedTab] = useState('daily');

  if (!userStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  const dailyQuests = getActiveQuests(DAILY_QUESTS, userStats, 'today');
  const weeklyQuests = getActiveQuests(WEEKLY_QUESTS, userStats, 'week');

  const completedDaily = dailyQuests.filter(q => q.isComplete).length;
  const completedWeekly = weeklyQuests.filter(q => q.isComplete).length;

  const totalDailyReward = DAILY_QUESTS.reduce((sum, q) => sum + q.reward, 0);
  const totalWeeklyReward = WEEKLY_QUESTS.reduce((sum, q) => sum + q.reward, 0);

  const earnedDailyReward = dailyQuests
    .filter(q => q.isComplete)
    .reduce((sum, q) => sum + q.reward, 0);
  const earnedWeeklyReward = weeklyQuests
    .filter(q => q.isComplete)
    .reduce((sum, q) => sum + q.reward, 0);

  return (
    <View style={styles.container}>
      {/* 상단 요약 */}
      <View style={styles.header}>
        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>📅</Text>
          <Text style={styles.headerTitle}>일일 퀘스트</Text>
          <Text style={styles.headerProgress}>
            {completedDaily} / {DAILY_QUESTS.length}
          </Text>
          <Text style={styles.headerReward}>
            {earnedDailyReward} / {totalDailyReward} XP
          </Text>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>🗓️</Text>
          <Text style={styles.headerTitle}>주간 퀘스트</Text>
          <Text style={styles.headerProgress}>
            {completedWeekly} / {WEEKLY_QUESTS.length}
          </Text>
          <Text style={styles.headerReward}>
            {earnedWeeklyReward} / {totalWeeklyReward} XP
          </Text>
        </View>
      </View>

      {/* 탭 */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'daily' && styles.tabActive]}
          onPress={() => setSelectedTab('daily')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'daily' && styles.tabTextActive,
            ]}
          >
            일일 ({completedDaily}/{DAILY_QUESTS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'weekly' && styles.tabActive]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'weekly' && styles.tabTextActive,
            ]}
          >
            주간 ({completedWeekly}/{WEEKLY_QUESTS.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 퀘스트 목록 */}
      <ScrollView style={styles.questsList}>
        {selectedTab === 'daily' ? (
          <>
            <Text style={styles.sectionTitle}>
              매일 자정에 초기화됩니다 🌙
            </Text>
            {dailyQuests.map((quest) => (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Text style={styles.questIcon}>{quest.icon}</Text>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questDescription}>
                      {quest.description}
                    </Text>
                  </View>
                  {quest.isComplete && (
                    <View style={styles.completeBadge}>
                      <Text style={styles.completeText}>✓</Text>
                    </View>
                  )}
                </View>

                <QuestProgress
                  title=""
                  current={quest.progress}
                  max={quest.target}
                  reward={quest.reward}
                />
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              매주 월요일에 초기화됩니다 📆
            </Text>
            {weeklyQuests.map((quest) => (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Text style={styles.questIcon}>{quest.icon}</Text>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.questDescription}>
                      {quest.description}
                    </Text>
                  </View>
                  {quest.isComplete && (
                    <View style={styles.completeBadge}>
                      <Text style={styles.completeText}>✓</Text>
                    </View>
                  )}
                </View>

                <QuestProgress
                  title=""
                  current={quest.progress}
                  max={quest.target}
                  reward={quest.reward}
                />
              </View>
            ))}
          </>
        )}

        <View style={styles.footer} />
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  headerCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  headerProgress: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  headerReward: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  questsList: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
    textAlign: 'center',
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 12,
    color: '#666',
  },
  completeBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});
