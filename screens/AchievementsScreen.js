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
      <View style={styles.categoryContainer}>
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
      </View>

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
    backgroundColor: '#F5EFE6',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF5',
    padding: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#D4A574',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#D4AF37',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  statValue: {
    fontSize: 32,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFBF5',
    borderBottomWidth: 2,
    borderBottomColor: '#D4A574',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#FFF8F0',
    borderWidth: 2,
    borderColor: '#D4A574',
    height: 50,
  },
  categoryButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#8B6914',
    borderWidth: 3,
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    color: '#6B4423',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFBF5',
    fontWeight: 'bold',
  },
  achievementsList: {
    flex: 1,
    padding: 15,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#D4A574',
  },
  lockedCard: {
    opacity: 0.6,
    borderColor: '#E8DCC4',
    backgroundColor: '#FFF8F0',
  },
  achievementIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  achievementIconText: {
    fontSize: 38,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lockedIcon: {
    opacity: 0.4,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#3E2723',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6B4423',
  },
  lockedText: {
    color: '#8B7355',
  },
  progressContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E8DCC4',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D4A574',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6B4423',
    width: 38,
    fontWeight: '600',
  },
  achievementPoints: {
    alignItems: 'center',
    marginLeft: 10,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B7355',
  },
  pointsTextUnlocked: {
    color: '#D4AF37',
    textShadowColor: 'rgba(139, 105, 20, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unlockedBadge: {
    backgroundColor: '#D4AF37',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    borderWidth: 2,
    borderColor: '#8B6914',
    shadowColor: '#8B6914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  unlockedBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B4423',
    fontSize: 15,
  },
});
