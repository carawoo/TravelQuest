// 배지 & 업적 데이터
export const ACHIEVEMENT_CATEGORIES = {
  EXPLORER: 'explorer',
  COLLECTOR: 'collector',
  SOCIAL: 'social',
  SPECIAL: 'special',
};

export const ACHIEVEMENTS = [
  // 탐험가 배지
  {
    id: 'first_checkin',
    category: ACHIEVEMENT_CATEGORIES.EXPLORER,
    title: '첫 발걸음',
    description: '첫 번째 장소 체크인',
    icon: '🎯',
    points: 10,
    condition: (stats) => stats.totalCheckins >= 1,
  },
  {
    id: 'explorer_10',
    category: ACHIEVEMENT_CATEGORIES.EXPLORER,
    title: '초보 탐험가',
    description: '10개 장소 방문',
    icon: '🗺️',
    points: 50,
    condition: (stats) => stats.totalCheckins >= 10,
  },
  {
    id: 'explorer_50',
    category: ACHIEVEMENT_CATEGORIES.EXPLORER,
    title: '베테랑 탐험가',
    description: '50개 장소 방문',
    icon: '🧭',
    points: 200,
    condition: (stats) => stats.totalCheckins >= 50,
  },
  {
    id: 'explorer_100',
    category: ACHIEVEMENT_CATEGORIES.EXPLORER,
    title: '전설의 탐험가',
    description: '100개 장소 방문',
    icon: '🏆',
    points: 500,
    condition: (stats) => stats.totalCheckins >= 100,
  },

  // 수집가 배지
  {
    id: 'first_region',
    category: ACHIEVEMENT_CATEGORIES.COLLECTOR,
    title: '지역 정복자',
    description: '첫 번째 지역 완전 정복',
    icon: '🏰',
    points: 100,
    condition: (stats) => stats.completedRegions >= 1,
  },
  {
    id: 'mountain_lover',
    category: ACHIEVEMENT_CATEGORIES.COLLECTOR,
    title: '산악인',
    description: '5개 이상의 산 방문',
    icon: '⛰️',
    points: 100,
    condition: (stats) => stats.categoryVisits?.mountain >= 5,
  },
  {
    id: 'beach_lover',
    category: ACHIEVEMENT_CATEGORIES.COLLECTOR,
    title: '바다 애호가',
    description: '5개 이상의 해변 방문',
    icon: '🏖️',
    points: 100,
    condition: (stats) => stats.categoryVisits?.beach >= 5,
  },
  {
    id: 'pension_hunter',
    category: ACHIEVEMENT_CATEGORIES.COLLECTOR,
    title: '펜션 헌터',
    description: '10개 이상의 펜션 방문',
    icon: '🏡',
    points: 150,
    condition: (stats) => stats.categoryVisits?.pension >= 10,
  },

  // 소셜 배지
  {
    id: 'first_review',
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    title: '리뷰어',
    description: '첫 번째 리뷰 작성',
    icon: '✍️',
    points: 20,
    condition: (stats) => stats.totalReviews >= 1,
  },
  {
    id: 'active_reviewer',
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    title: '활발한 리뷰어',
    description: '20개 이상 리뷰 작성',
    icon: '📝',
    points: 100,
    condition: (stats) => stats.totalReviews >= 20,
  },
  {
    id: 'photo_master',
    category: ACHIEVEMENT_CATEGORIES.SOCIAL,
    title: '사진작가',
    description: '50개 이상 사진 업로드',
    icon: '📸',
    points: 150,
    condition: (stats) => stats.totalPhotos >= 50,
  },

  // 특별 배지
  {
    id: 'hidden_gem',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    title: '숨은 보석 발견자',
    description: '아직 아무도 방문하지 않은 장소 발견',
    icon: '💎',
    points: 200,
    condition: (stats) => stats.firstDiscoveries >= 1,
  },
  {
    id: 'weekend_warrior',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    title: '주말 전사',
    description: '10번의 주말 여행',
    icon: '🗓️',
    points: 100,
    condition: (stats) => stats.weekendTrips >= 10,
  },
  {
    id: 'night_owl',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    title: '밤의 탐험가',
    description: '밤 10시 이후 5번 체크인',
    icon: '🌙',
    points: 50,
    condition: (stats) => stats.nightCheckins >= 5,
  },
  {
    id: 'streak_7',
    category: ACHIEVEMENT_CATEGORIES.SPECIAL,
    title: '일주일 연속',
    description: '7일 연속 체크인',
    icon: '🔥',
    points: 150,
    condition: (stats) => stats.maxStreak >= 7,
  },
];

// 레벨 시스템
export const LEVELS = [
  { level: 1, minPoints: 0, title: '여행 초보', icon: '🌱' },
  { level: 2, minPoints: 100, title: '여행 견습생', icon: '🌿' },
  { level: 3, minPoints: 300, title: '여행자', icon: '🌳' },
  { level: 4, minPoints: 600, title: '숙련된 여행자', icon: '🎒' },
  { level: 5, minPoints: 1000, title: '여행 마스터', icon: '🗺️' },
  { level: 6, minPoints: 1500, title: '탐험가', icon: '🧭' },
  { level: 7, minPoints: 2200, title: '세계 탐험가', icon: '🌏' },
  { level: 8, minPoints: 3000, title: '여행 전문가', icon: '✈️' },
  { level: 9, minPoints: 4000, title: '여행 대가', icon: '👑' },
  { level: 10, minPoints: 5500, title: '전설의 여행가', icon: '⭐' },
];

export const getLevelFromPoints = (points) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getProgressToNextLevel = (points) => {
  const currentLevel = getLevelFromPoints(points);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return { current: points, max: points, percentage: 100 };
  }

  const current = points - currentLevel.minPoints;
  const max = nextLevel.minPoints - currentLevel.minPoints;
  const percentage = Math.floor((current / max) * 100);

  return { current, max, percentage, nextLevel };
};
