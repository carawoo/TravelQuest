// 장소 카테고리 정의
export const PLACE_CATEGORIES = {
  MOUNTAIN: 'mountain',
  BEACH: 'beach',
  PENSION: 'pension',
  CAFE: 'cafe',
  RESTAURANT: 'restaurant',
  PARK: 'park',
  MUSEUM: 'museum',
  TEMPLE: 'temple',
  LANDMARK: 'landmark',
  CAMPSITE: 'campsite',
  HOTEL: 'hotel',
  OTHER: 'other',
};

export const CATEGORY_INFO = {
  [PLACE_CATEGORIES.MOUNTAIN]: {
    name: '산/등산로',
    icon: '⛰️',
    color: '#8B7355',
  },
  [PLACE_CATEGORIES.BEACH]: {
    name: '해변/바다',
    icon: '🏖️',
    color: '#4A90E2',
  },
  [PLACE_CATEGORIES.PENSION]: {
    name: '펜션/숙소',
    icon: '🏡',
    color: '#E85D75',
  },
  [PLACE_CATEGORIES.CAFE]: {
    name: '카페',
    icon: '☕',
    color: '#D4A574',
  },
  [PLACE_CATEGORIES.RESTAURANT]: {
    name: '식당/맛집',
    icon: '🍽️',
    color: '#FF6B35',
  },
  [PLACE_CATEGORIES.PARK]: {
    name: '공원/자연',
    icon: '🌳',
    color: '#50C878',
  },
  [PLACE_CATEGORIES.MUSEUM]: {
    name: '박물관/미술관',
    icon: '🏛️',
    color: '#9B59B6',
  },
  [PLACE_CATEGORIES.TEMPLE]: {
    name: '사찰/문화재',
    icon: '⛩️',
    color: '#E67E22',
  },
  [PLACE_CATEGORIES.LANDMARK]: {
    name: '랜드마크',
    icon: '🗿',
    color: '#34495E',
  },
  [PLACE_CATEGORIES.CAMPSITE]: {
    name: '캠핑장',
    icon: '⛺',
    color: '#27AE60',
  },
  [PLACE_CATEGORIES.HOTEL]: {
    name: '호텔/리조트',
    icon: '🏨',
    color: '#3498DB',
  },
  [PLACE_CATEGORIES.OTHER]: {
    name: '기타',
    icon: '📍',
    color: '#95A5A6',
  },
};

// 한국 주요 지역 데이터
export const REGIONS = {
  SEOUL: { id: 'seoul', name: '서울', code: '11' },
  BUSAN: { id: 'busan', name: '부산', code: '26' },
  DAEGU: { id: 'daegu', name: '대구', code: '27' },
  INCHEON: { id: 'incheon', name: '인천', code: '28' },
  GWANGJU: { id: 'gwangju', name: '광주', code: '29' },
  DAEJEON: { id: 'daejeon', name: '대전', code: '30' },
  ULSAN: { id: 'ulsan', name: '울산', code: '31' },
  SEJONG: { id: 'sejong', name: '세종', code: '36' },
  GYEONGGI: { id: 'gyeonggi', name: '경기', code: '41' },
  GANGWON: { id: 'gangwon', name: '강원', code: '42' },
  CHUNGBUK: { id: 'chungbuk', name: '충북', code: '43' },
  CHUNGNAM: { id: 'chungnam', name: '충남', code: '44' },
  JEONBUK: { id: 'jeonbuk', name: '전북', code: '45' },
  JEONNAM: { id: 'jeonnam', name: '전남', code: '46' },
  GYEONGBUK: { id: 'gyeongbuk', name: '경북', code: '47' },
  GYEONGNAM: { id: 'gyeongnam', name: '경남', code: '48' },
  JEJU: { id: 'jeju', name: '제주', code: '50' },
};

// 지역별 인기 명소 (예시 데이터)
export const POPULAR_PLACES = [
  // 강원도
  { region: 'gangwon', name: '남이섬', category: PLACE_CATEGORIES.LANDMARK, lat: 37.7915, lng: 127.5245 },
  { region: 'gangwon', name: '속초 해수욕장', category: PLACE_CATEGORIES.BEACH, lat: 38.2070, lng: 128.5918 },
  { region: 'gangwon', name: '설악산', category: PLACE_CATEGORIES.MOUNTAIN, lat: 38.1197, lng: 128.4655 },

  // 제주
  { region: 'jeju', name: '성산일출봉', category: PLACE_CATEGORIES.LANDMARK, lat: 33.4599, lng: 126.9426 },
  { region: 'jeju', name: '한라산', category: PLACE_CATEGORIES.MOUNTAIN, lat: 33.3616, lng: 126.5292 },
  { region: 'jeju', name: '협재 해수욕장', category: PLACE_CATEGORIES.BEACH, lat: 33.3941, lng: 126.2397 },

  // 부산
  { region: 'busan', name: '해운대 해수욕장', category: PLACE_CATEGORIES.BEACH, lat: 35.1585, lng: 129.1603 },
  { region: 'busan', name: '광안리 해수욕장', category: PLACE_CATEGORIES.BEACH, lat: 35.1532, lng: 129.1186 },
  { region: 'busan', name: '감천문화마을', category: PLACE_CATEGORIES.LANDMARK, lat: 35.0976, lng: 129.0103 },
];
