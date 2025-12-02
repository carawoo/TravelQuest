# 🗺️ TravelQuest - 여행 탐험 게임

위치 기반 여행 탐험 게임! 여행지를 발견하고, 체크인하고, 업적을 달성하며, 커뮤니티와 공유하세요.

## 🎮 게임 특징

### 🧭 탐험 시스템
- **위치 기반 체크인**: 실제 장소에 방문하여 체크인
- **하이브리드 감지**: 근처 장소 알림 + 사용자 수동 체크인
- **실시간 지도**: 주변 여행지를 지도에서 확인
- **거리 표시**: 각 장소까지의 거리 실시간 표시

### 🏆 업적 & 레벨 시스템
- **다양한 배지**: 탐험가, 수집가, 소셜, 특별 업적
- **10단계 레벨**: 여행 초보부터 전설의 여행가까지
- **경험치 시스템**: 체크인과 업적으로 레벨업
- **진행도 추적**: 각 업적의 진행 상황 실시간 확인

### 🗺️ 지역 정복 시스템
- **17개 시도**: 전국 주요 지역 정복
- **카테고리별 수집**: 산, 해변, 펜션, 카페 등 12개 카테고리
- **방문 통계**: 지역별, 카테고리별 방문 기록
- **재방문 추적**: 같은 장소 여러 번 방문 가능

### 👥 커뮤니티 기능
- **여행 리뷰**: 방문한 장소 리뷰 공유
- **평점 시스템**: 별점 평가
- **태그 시스템**: #주차가능 #숨은명소 등
- **실시간 피드**: 다른 여행자들의 최신 소식

### 📊 프로필 & 통계
- **개인 통계**: 총 체크인, 방문 지역, 연속 방문 기록
- **레벨 진행도**: 다음 레벨까지 필요한 경험치
- **최근 활동**: 최근 체크인 기록
- **카테고리 분석**: 가장 많이 방문한 카테고리

## 🚀 시작하기

### 필수 요구사항
- Node.js 14 이상
- Expo CLI
- iOS 시뮬레이터 또는 Android 에뮬레이터 (또는 실제 기기)

### 설치 및 실행

1. **의존성 설치**
\`\`\`bash
cd TravelQuest
npm install
\`\`\`

2. **앱 실행**
\`\`\`bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# Expo Go 앱으로 실행
npx expo start
\`\`\`

3. **Google Maps API 키 설정** (선택사항)
\`app.json\`에서 다음 부분을 본인의 API 키로 교체:
\`\`\`json
"googleMapsApiKey": "YOUR_API_KEY"
\`\`\`

## 📱 주요 화면

### 1. 탐험 (지도)
- 현재 위치 중심의 지도
- 근처 여행지 마커 표시
- 하단에 근처 장소 목록
- 500m 이내 체크인 가능

### 2. 업적
- 카테고리별 업적 필터링
- 달성/미달성 업적 표시
- 진행도 바
- 업적별 포인트 표시

### 3. 커뮤니티
- 여행자들의 리뷰 피드
- 장소별 평점과 태그
- 좋아요와 댓글
- 검색 및 필터링

### 4. 프로필
- 레벨과 경험치
- 통계 대시보드
- 카테고리별 방문 그래프
- 최근 체크인 기록

## 🎯 게임 플레이 가이드

### 체크인하기
1. 지도에서 근처 장소 확인
2. 장소를 선택하고 거리 확인
3. 500m 이내에 있으면 체크인 가능
4. 체크인하면 포인트와 기록 저장

### 업적 달성하기
- **첫 발걸음**: 첫 번째 체크인
- **초보 탐험가**: 10개 장소 방문
- **지역 정복자**: 한 지역 완전 정복
- **산악인**: 5개 이상의 산 방문
- **주말 전사**: 10번의 주말 여행
- **일주일 연속**: 7일 연속 체크인

### 레벨업하기
- 체크인으로 포인트 획득
- 업적 달성으로 보너스 포인트
- 레벨이 오르면 새로운 타이틀 획득
- 최고 레벨: Lv.10 "전설의 여행가" ⭐

## 🛠️ 기술 스택

- **React Native** + **Expo**: 크로스 플랫폼 모바일 앱
- **React Navigation**: 화면 네비게이션
- **expo-location**: 위치 추적 및 지오코딩
- **react-native-maps**: 지도 표시
- **AsyncStorage**: 로컬 데이터 저장
- **expo-notifications**: 근처 장소 알림

## 📦 프로젝트 구조

\`\`\`
TravelQuest/
├── screens/           # 화면 컴포넌트
│   ├── MapScreen.js
│   ├── AchievementsScreen.js
│   ├── CommunityScreen.js
│   └── ProfileScreen.js
├── services/          # 비즈니스 로직
│   ├── LocationService.js
│   ├── StorageService.js
│   └── AchievementService.js
├── data/              # 게임 데이터
│   ├── achievements.js
│   └── categories.js
├── contexts/          # React Context
│   └── GameContext.js
└── App.js            # 메인 앱 파일
\`\`\`

## 🎨 커스터마이징

### 새로운 장소 추가
\`data/categories.js\`의 \`POPULAR_PLACES\` 배열에 장소 추가:
\`\`\`javascript
{
  region: 'seoul',
  name: '남산타워',
  category: PLACE_CATEGORIES.LANDMARK,
  lat: 37.5512,
  lng: 126.9882
}
\`\`\`

### 새로운 업적 추가
\`data/achievements.js\`의 \`ACHIEVEMENTS\` 배열에 업적 추가:
\`\`\`javascript
{
  id: 'my_achievement',
  category: ACHIEVEMENT_CATEGORIES.SPECIAL,
  title: '나만의 업적',
  description: '특별한 조건 달성',
  icon: '🎯',
  points: 100,
  condition: (stats) => stats.myCondition >= 1,
}
\`\`\`

### 새로운 카테고리 추가
\`data/categories.js\`에서 카테고리 추가 가능

## 🔮 향후 개선 사항

- [ ] 백엔드 API 연동 (Firebase/Supabase)
- [ ] 실시간 랭킹 시스템
- [ ] 친구 시스템
- [ ] 사진 업로드 기능
- [ ] 커스텀 장소 추가 기능
- [ ] 여행 루트 기록
- [ ] 배지 공유 기능
- [ ] 푸시 알림 강화
- [ ] AR 기능 (증강현실로 장소 찾기)

## 📝 라이센스

MIT License

## 👨‍💻 개발자

Claude Code로 제작됨

---

**즐거운 여행 되세요! 🎒✨**
