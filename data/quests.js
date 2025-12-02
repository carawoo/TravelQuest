// 퀘스트 시스템
export const QUEST_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  ACHIEVEMENT: 'achievement',
};

export const DAILY_QUESTS = [
  {
    id: 'daily_checkin_1',
    title: '일일 탐험',
    description: '오늘 1곳 체크인하기',
    target: 1,
    reward: 50,
    icon: '📍',
  },
  {
    id: 'daily_checkin_3',
    title: '열심히 탐험',
    description: '오늘 3곳 체크인하기',
    target: 3,
    reward: 150,
    icon: '🗺️',
  },
  {
    id: 'daily_new_place',
    title: '새로운 발견',
    description: '처음 가보는 장소 1곳 방문',
    target: 1,
    reward: 100,
    icon: '✨',
  },
  {
    id: 'daily_review',
    title: '리뷰어',
    description: '리뷰 1개 작성하기',
    target: 1,
    reward: 80,
    icon: '✍️',
  },
];

export const WEEKLY_QUESTS = [
  {
    id: 'weekly_checkin_10',
    title: '주간 탐험가',
    description: '이번 주 10곳 체크인',
    target: 10,
    reward: 500,
    icon: '🎯',
  },
  {
    id: 'weekly_categories',
    title: '다양한 경험',
    description: '5가지 다른 카테고리 방문',
    target: 5,
    reward: 400,
    icon: '🌈',
  },
  {
    id: 'weekly_regions',
    title: '지역 탐험',
    description: '3개 이상의 다른 지역 방문',
    target: 3,
    reward: 600,
    icon: '🗾',
  },
  {
    id: 'weekly_weekend',
    title: '주말 여행가',
    description: '주말에 5곳 이상 방문',
    target: 5,
    reward: 350,
    icon: '🎉',
  },
];

// 퀘스트 진행도 계산
export function calculateQuestProgress(quest, stats, period = 'today') {
  const questId = quest.id;

  if (questId.includes('checkin')) {
    const count = period === 'today'
      ? stats.todayCheckins || 0
      : stats.weeklyCheckins || 0;
    return Math.min(count, quest.target);
  }

  if (questId.includes('new_place')) {
    return Math.min(stats.todayNewPlaces || 0, quest.target);
  }

  if (questId.includes('review')) {
    return Math.min(stats.todayReviews || 0, quest.target);
  }

  if (questId.includes('categories')) {
    const categories = stats.weeklyCategories || [];
    return Math.min(categories.length, quest.target);
  }

  if (questId.includes('regions')) {
    const regions = stats.weeklyRegions || [];
    return Math.min(regions.length, quest.target);
  }

  if (questId.includes('weekend')) {
    return Math.min(stats.weekendCheckins || 0, quest.target);
  }

  return 0;
}

// 완료된 퀘스트 확인
export function getCompletedQuests(quests, stats, period = 'today') {
  return quests.filter(quest => {
    const progress = calculateQuestProgress(quest, stats, period);
    return progress >= quest.target;
  });
}

// 진행 중인 퀘스트
export function getActiveQuests(quests, stats, period = 'today') {
  return quests.map(quest => ({
    ...quest,
    progress: calculateQuestProgress(quest, stats, period),
    isComplete: calculateQuestProgress(quest, stats, period) >= quest.target,
  }));
}
