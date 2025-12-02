import { ACHIEVEMENTS } from '../data/achievements';
import StorageService from './StorageService';

class AchievementService {
  // 새로 달성한 업적 확인
  async checkNewAchievements(stats) {
    const unlockedAchievements = await StorageService.getUnlockedAchievements();
    const newAchievements = [];

    for (const achievement of ACHIEVEMENTS) {
      // 이미 달성한 업적은 건너뛰기
      if (unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      // 조건 확인
      if (achievement.condition(stats)) {
        const success = await StorageService.unlockAchievement(achievement.id);
        if (success) {
          newAchievements.push(achievement);
        }
      }
    }

    return newAchievements;
  }

  // 통계 업데이트 및 업적 확인
  async updateStatsAndCheckAchievements(updates) {
    const currentStats = await StorageService.getUserStats();
    const newStats = { ...currentStats, ...updates };

    await StorageService.saveUserStats(newStats);
    const newAchievements = await this.checkNewAchievements(newStats);

    // 새로운 업적으로 인한 포인트 추가
    if (newAchievements.length > 0) {
      const additionalPoints = newAchievements.reduce(
        (sum, achievement) => sum + achievement.points,
        0
      );
      newStats.totalPoints += additionalPoints;
      await StorageService.saveUserStats(newStats);
    }

    return {
      stats: newStats,
      newAchievements,
    };
  }

  // 체크인 시 통계 업데이트
  async processCheckin(checkinData) {
    const currentStats = await StorageService.getUserStats();
    const { category, region, timestamp } = checkinData;

    // 기본 통계 업데이트
    const updates = {
      totalCheckins: currentStats.totalCheckins + 1,
      categoryVisits: {
        ...currentStats.categoryVisits,
        [category]: (currentStats.categoryVisits[category] || 0) + 1,
      },
      regionVisits: {
        ...currentStats.regionVisits,
        [region]: (currentStats.regionVisits[region] || 0) + 1,
      },
    };

    // 연속 방문 계산
    const lastCheckin = currentStats.lastCheckinDate;
    if (lastCheckin) {
      const lastDate = new Date(lastCheckin).setHours(0, 0, 0, 0);
      const currentDate = new Date(timestamp).setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // 연속 방문
        updates.currentStreak = currentStats.currentStreak + 1;
        updates.maxStreak = Math.max(
          currentStats.maxStreak,
          updates.currentStreak
        );
      } else if (daysDiff > 1) {
        // 연속 끊김
        updates.currentStreak = 1;
      }
    } else {
      updates.currentStreak = 1;
      updates.maxStreak = 1;
    }

    updates.lastCheckinDate = timestamp;

    // 특별 조건 확인
    const checkinDate = new Date(timestamp);
    const hour = checkinDate.getHours();
    const day = checkinDate.getDay();

    // 밤 체크인 (22시 ~ 04시)
    if (hour >= 22 || hour <= 4) {
      updates.nightCheckins = (currentStats.nightCheckins || 0) + 1;
    }

    // 주말 여행 (토요일, 일요일)
    if (day === 0 || day === 6) {
      updates.weekendTrips = (currentStats.weekendTrips || 0) + 1;
    }

    // 첫 발견 확인 (실제로는 서버에서 확인해야 함)
    // 여기서는 간단히 처리
    if (checkinData.isFirstDiscovery) {
      updates.firstDiscoveries = (currentStats.firstDiscoveries || 0) + 1;
    }

    return await this.updateStatsAndCheckAchievements(updates);
  }

  // 리뷰 작성 시 통계 업데이트
  async processReview() {
    const currentStats = await StorageService.getUserStats();
    return await this.updateStatsAndCheckAchievements({
      totalReviews: currentStats.totalReviews + 1,
    });
  }

  // 사진 업로드 시 통계 업데이트
  async processPhotoUpload(count = 1) {
    const currentStats = await StorageService.getUserStats();
    return await this.updateStatsAndCheckAchievements({
      totalPhotos: currentStats.totalPhotos + count,
    });
  }

  // 지역 완전 정복 시
  async processRegionCompletion() {
    const currentStats = await StorageService.getUserStats();
    return await this.updateStatsAndCheckAchievements({
      completedRegions: currentStats.completedRegions + 1,
    });
  }

  // 달성한 업적 목록 가져오기
  async getAchievementProgress() {
    const stats = await StorageService.getUserStats();
    const unlockedAchievements = await StorageService.getUnlockedAchievements();

    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id),
      progress: this.calculateProgress(achievement, stats),
    }));
  }

  // 업적 진행도 계산
  calculateProgress(achievement, stats) {
    // 간단한 진행도 계산 (실제로는 각 업적별로 다르게 처리)
    if (achievement.id.includes('checkin')) {
      const target = parseInt(achievement.id.split('_')[1]) || 1;
      return Math.min(100, (stats.totalCheckins / target) * 100);
    }
    return achievement.condition(stats) ? 100 : 0;
  }
}

export default new AchievementService();
