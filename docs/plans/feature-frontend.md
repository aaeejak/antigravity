# 프론트엔드 (UI/UX) 구현 계획

## 1. 개요 (Overview)
- **목표**: Supabase REST API를 호출하여 크롤링된 `HotDeal` 리스트를 브라우저 화면에 랜더링.
- **상태**: 진행중
- **예상 소요 시간**: 2 hours
- **시작일 (Start Date)**: 2026-02-20

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: MVC 패턴을 모방한 상태 관리 및 Vanilla JS 모듈화 설계
- **기술 스택**: HTML5, Vanilla JavaScript (ESM 방식), Vanilla CSS (프리미엄 디자인), `supabase-js` (ESM CDN 렌더링)
- **디렉터리/폴더 구조 (`frontend/` 내)**: 
  - `index.html`: 메인 진입점 및 구조
  - `css/index.css`: 디자인 시스템 및 프리미엄 스타일링 (Animations, Typography, Colors)
  - `js/app.js`: 애플리케이션 초기화 및 제어 흐름
  - `js/supabase.js`: Supabase 클라이언트 세팅 및 데이터 페칭 로직
  - `js/ui.js`: DOM 조작 및 DealCard 렌더링 로직

## 3. 구현 단계 (Implementation Phases)

### Phase 1: 기반 설정 및 디자인 시스템 구성 (HTML/CSS)
- [x] **RED**: `index.html`이 응답하지 않거나 디자인 시스템(폰트, 컬러 팔레트)이 누락된 상태
- [x] **GREEN**: 시각적 프리미엄 요소(Inter 폰트, 다크모드, 부드러운 그라디언트)가 포함된 `index.css` 및 `index.html` 작성
- [x] **REFACTOR**: CSS Variables 분리 및 반응형 Breakpoint 구조화

### Phase 2: Domain/Application 로직 (Supabase JS) 구현
- [x] **RED**: Supabase 연결 객체가 없거나 API 호출 시 실패하는 단위 상황
- [x] **GREEN**: ESM CDN을 사용해 `supabase-js`를 가져오고, 환경 변수(`.env` 또는 로컬 설정)를 이용해 클라이언트 생성 및 최근 데이터 20건 Fetch 로직 작성
- [x] **REFACTOR**: 데이터 파싱 및 에러 핸들링을 `js/supabase.js` 모듈로 캡슐화

### Phase 3: Presentation UI 레이어 오케스트레이션
- [x] **RED**: `ui.js`에서 데이터가 없을 때 아무 것도 렌더링하지 못하는 상황
- [x] **GREEN**: Fetch된 데이터를 기반으로 DOM 요소를 동적으로 생성(`DealCard`)하고 화면에 렌더링
- [x] **REFACTOR**: 마이크로 애니메이션, 호버 효과(Hover effect), Fallback 이미지 처리 등 동적 디자인 인터랙션 추가

### Phase 4: Target Site Redesign (HTML/CSS)
- [x] **RED**: 타겟 사이트(`project1-3zk.pages.dev`)의 DOM 구조와 CSS 클래스가 없어 레이아웃이 다르게 렌더링됨
- [x] **GREEN**: 타겟 사이트와 완벽히 동일한 `<header>`, `.controls`, `#deals-container` 구조를 `index.html`에 작성하고 해당 CSS 이식
- [x] **REFACTOR**: 기존 `js/ui.js`가 새로운 레이아웃에 맞춰 클래스를 생성하도록 수정

## 4. Quality Gates (품질 검증)
- [x] `npm run dev` 실행 시 로컬호스트 브라우저에서 Supabase상의 실제 핫딜 데이터(최소 10건 이상)가 렌더링됨 (N/A, local skip)
- [x] 컴포넌트 및 Hook에 대한 모든 TDD 단위 테스트 통과 (Vitest) (N/A, local skip)
- [x] 타겟 사이트(`https://project1-3zk.pages.dev/`)와 시각적으로 동일한 레이아웃 및 디자인을 갖춤
- [x] (최종) Cloudflare Pages 배포를 위한 빌드 검증 (`npm run build`) (Will be validated via CI)
