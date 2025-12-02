import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AchievementService from '../services/AchievementService';
import { ACHIEVEMENT_CATEGORIES } from '../data/achievements';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const data = await AchievementService.getAchievementProgress();
    setAchievements(data);
  };

  const categories = [
    { id: 'all', name: '전체', icon: '🏆' },
    { id: ACHIEVEMENT_CATEGORIES.EXPLORER, name: '탐험가', icon: '🗺️' },
    { id: ACHIEVEMENT_CATEGORIES.COLLECTOR, name: '수집가', icon: '📦' },
    { id: ACHIEVEMENT_CATEGORIES.SOCIAL, name: '소셜', icon: '👥' },
    { id: ACHIEVEMENT_CATEGORIES.SPECIAL, name: '특별', icon: '⭐' },
  ];

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <View style={styles.container}>
      {/* 헤더 통계 */}
      <View style={styles.header}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {unlockedCount} / {achievements.length}
          </Text>
          <Text style={styles.statLabel}>달성한 업적</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalPoints}</Text>
          <Text style={styles.statLabel}>총 포인트</Text>
        </View>
      </View>

      {/* 카테고리 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 업적 목록 */}
      <ScrollView style={styles.achievementsList}>
        {filteredAchievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.lockedCard,
            ]}
          >
            <View style={styles.achievementIcon}>
              <Text
                style={[
                  styles.achievementIconText,
                  !achievement.unlocked && styles.lockedIcon,
                ]}
              >
                {achievement.icon}
              </Text>
            </View>

            <View style={styles.achievementContent}>
              <Text
                style={[
                  styles.achievementTitle,
                  !achievement.unlocked && styles.lockedText,
                ]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[
                  styles.achievementDescription,
                  !achievement.unlocked && styles.lockedText,
                ]}
              >
                {achievement.description}
              </Text>

              {!achievement.unlocked && achievement.progress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(achievement.progress, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(achievement.progress)}%
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.achievementPoints}>
              <Text
                style={[
                  styles.pointsText,
                  achievement.unlocked && styles.pointsTextUnlocked,
                ]}
              >
                +{achievement.points}
              </Text>
              {achievement.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedBadgeText}>✓</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>업적이 없습니다.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
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
  categoryContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  achievementsList: {
    flex: 1,
    padding: 15,
  },
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedCard: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementIconText: {
    fontSize: 32,
  },
  lockedIcon: {
    opacity: 0.3,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
  },
  lockedText: {
    color: '#999',
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    width: 35,
  },
  achievementPoints: {
    alignItems: 'center',
    marginLeft: 10,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  pointsTextUnlocked: {
    color: '#4CAF50',
  },
  unlockedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  unlockedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});
