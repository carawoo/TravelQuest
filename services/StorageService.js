import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_STATS: '@travelquest_user_stats',
  CHECKINS: '@travelquest_checkins',
  ACHIEVEMENTS: '@travelquest_achievements',
  VISITED_PLACES: '@travelquest_visited_places',
};

class StorageService {
  // 사용자 통계 저장/불러오기
  async getUserStats() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_STATS);
      if (data) {
        return JSON.parse(data);
      }
      // 초기 통계 데이터
      return {
        totalPoints: 0,
        totalCheckins: 0,
        totalReviews: 0,
        totalPhotos: 0,
        completedRegions: 0,
        firstDiscoveries: 0,
        weekendTrips: 0,
        nightCheckins: 0,
        maxStreak: 0,
        currentStreak: 0,
        lastCheckinDate: null,
        categoryVisits: {},
        regionVisits: {},
      };
    } catch (error) {
      console.error('Error loading user stats:', error);
      return null;
    }
  }

  async saveUserStats(stats) {
    try {
      await AsyncStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
      return true;
    } catch (error) {
      console.error('Error saving user stats:', error);
      return false;
    }
  }

  // 체크인 기록 저장/불러오기
  async getCheckins() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CHECKINS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading checkins:', error);
      return [];
    }
  }

  async addCheckin(checkin) {
    try {
      const checkins = await this.getCheckins();
      const newCheckin = {
        ...checkin,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      checkins.push(newCheckin);
      await AsyncStorage.setItem(KEYS.CHECKINS, JSON.stringify(checkins));
      return newCheckin;
    } catch (error) {
      console.error('Error adding checkin:', error);
      return null;
    }
  }

  // 달성한 업적 저장/불러오기
  async getUnlockedAchievements() {
    try {
      const data = await AsyncStorage.getItem(KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading achievements:', error);
      return [];
    }
  }

  async unlockAchievement(achievementId) {
    try {
      const achievements = await this.getUnlockedAchievements();
      if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        await AsyncStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }

  // 방문한 장소 저장/불러오기
  async getVisitedPlaces() {
    try {
      const data = await AsyncStorage.getItem(KEYS.VISITED_PLACES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading visited places:', error);
      return {};
    }
  }

  async markPlaceVisited(placeId, placeData) {
    try {
      const places = await this.getVisitedPlaces();
      if (!places[placeId]) {
        places[placeId] = {
          ...placeData,
          firstVisit: Date.now(),
          visitCount: 1,
          lastVisit: Date.now(),
        };
      } else {
        places[placeId].visitCount += 1;
        places[placeId].lastVisit = Date.now();
      }
      await AsyncStorage.setItem(KEYS.VISITED_PLACES, JSON.stringify(places));
      return places[placeId];
    } catch (error) {
      console.error('Error marking place visited:', error);
      return null;
    }
  }

  // 모든 데이터 초기화 (테스트용)
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}

export default new StorageService();
