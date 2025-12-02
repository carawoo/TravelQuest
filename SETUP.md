# TravelQuest 설정 가이드

## 🌐 웹 버전 실행 방법

### 1. 기본 설정 (위치 추적만)

웹에서 브라우저의 Geolocation API를 사용하여 위치를 추적합니다.

```bash
npm run web
```

브라우저에서 위치 권한을 허용하면 실시간으로 위치가 추적됩니다!

### 2. Google Maps 추가 (선택사항)

실제 지도를 보려면 Google Maps API 키가 필요합니다.

#### 2.1. Google Cloud Console에서 API 키 발급

1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성
3. "API 및 서비스" > "라이브러리" 이동
4. "Maps JavaScript API" 검색 및 활성화
5. "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키" 선택
6. API 키 복사

**💰 비용**: 월 $200 무료 크레딧 제공 (일반 사용자에게는 충분합니다)

#### 2.2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### 2.3. 앱 재시작

```bash
npm run web
```

이제 실제 Google Maps가 표시됩니다!

## 📱 모바일 앱 실행 방법

### iOS

```bash
npm run ios
```

### Android

```bash
npm run android
```

## 🚀 Vercel 배포

### 환경 변수 설정

Vercel 대시보드에서:
1. Project Settings > Environment Variables
2. 추가: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` = `your_api_key`
3. Production, Preview, Development 모두 체크

### 배포 명령어

```bash
vercel --prod
```

## 🎮 주요 기능

### 웹 버전
- ✅ 실시간 위치 추적 (브라우저 Geolocation)
- ✅ 위치 권한 요청
- ✅ 근처 여행지 자동 탐색
- ✅ 체크인 시스템
- ✅ 업적 & 레벨 시스템
- ✅ 커뮤니티 기능
- ✅ 프로필 & 통계
- 📍 Google Maps (API 키 필요)

### 모바일 버전
- ✅ 모든 웹 기능
- ✅ 네이티브 지도 (react-native-maps)
- ✅ 백그라운드 위치 추적
- ✅ 푸시 알림

## 🔒 위치 권한

### 브라우저 (웹)
- 브라우저 주소창에서 위치 권한 허용 필요
- HTTPS 또는 localhost에서만 작동
- Chrome, Firefox, Safari 모두 지원

### 모바일
- 앱 첫 실행 시 위치 권한 요청
- "앱 사용 중에만" 또는 "항상" 선택 가능

## ⚙️ 문제 해결

### 위치 정보를 가져올 수 없어요
- 브라우저 설정에서 위치 권한 확인
- HTTPS 또는 localhost 사용 확인
- 개인정보 보호 모드 해제

### Google Maps가 표시되지 않아요
- API 키가 올바른지 확인
- Maps JavaScript API가 활성화되어 있는지 확인
- 환경 변수 이름 확인: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### 배포 후 지도가 안 나와요
- Vercel 환경 변수 설정 확인
- 재배포 필요 (`vercel --prod`)

## 📝 라이센스

MIT License
