import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageService from '../services/StorageService';
import AchievementService from '../services/AchievementService';
import { getLevelFromPoints, getProgressToNextLevel } from '../data/achievements';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [userStats, setUserStats] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [visitedPlaces, setVisitedPlaces] = useState({});
  const [loading, setLoading] = useState(true);

  // 초기 데이터 로드
  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const [stats, checkinsData, placesData] = await Promise.all([
        StorageService.getUserStats(),
        StorageService.getCheckins(),
        StorageService.getVisitedPlaces(),
      ]);

      setUserStats(stats);
      setCheckins(checkinsData);
      setVisitedPlaces(placesData);
    } catch (error) {
      console.error('Error loading game data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 체크인 처리
  const performCheckin = async (placeData) => {
    try {
      // 체크인 저장
      const newCheckin = await StorageService.addCheckin(placeData);
      if (!newCheckin) {
        return { success: false, error: '체크인 저장 실패' };
      }

      // 장소 방문 기록
      const visitedPlace = await StorageService.markPlaceVisited(
        placeData.placeId,
        placeData
      );

      // 통계 업데이트 및 업적 확인
      const result = await AchievementService.processCheckin({
        ...placeData,
        timestamp: newCheckin.timestamp,
      });

      // 상태 업데이트
      setCheckins(prev => [...prev, newCheckin]);
      setVisitedPlaces(prev => ({
        ...prev,
        [placeData.placeId]: visitedPlace,
      }));
      setUserStats(result.stats);

      return {
        success: true,
        checkin: newCheckin,
        newAchievements: result.newAchievements,
        stats: result.stats,
      };
    } catch (error) {
      console.error('Error performing checkin:', error);
      return { success: false, error: '체크인 중 오류 발생' };
    }
  };

  // 레벨 정보 가져오기
  const getLevelInfo = () => {
    if (!userStats) return null;
    const level = getLevelFromPoints(userStats.totalPoints);
    const progress = getProgressToNextLevel(userStats.totalPoints);
    return { level, progress };
  };

  // 방문 횟수 가져오기
  const getVisitCount = (placeId) => {
    return visitedPlaces[placeId]?.visitCount || 0;
  };

  // 장소 방문 여부 확인
  const hasVisited = (placeId) => {
    return !!visitedPlaces[placeId];
  };

  // 최근 체크인 가져오기
  const getRecentCheckins = (limit = 10) => {
    return [...checkins]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  // 데이터 리프레시
  const refreshData = async () => {
    await loadGameData();
  };

  const value = {
    userStats,
    checkins,
    visitedPlaces,
    loading,
    performCheckin,
    getLevelInfo,
    getVisitCount,
    hasVisited,
    getRecentCheckins,
    refreshData,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
