# feature-crawler-timestamps 구현 계획

## 1. 개요 (Overview)
- **목표**: 핫딜 크롤링 시 현재 크롤링 실행 시간(`now()`)이 아닌 실제 게시글이 작성된 시간(`posted_at`)을 추출하여 DB에 저장 및 UI에 표시 (정확한 핫딜 타임라인 제공)
- **상태**: 진행중
- **예상 소요 시간**: 1 에스팀 포인트
- **시작일 (Start Date)**: 2026-02-27

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: Clean Architecture (Domain -> Infra -> UI)
- **기술 스택**: Node.js, cheerio, Supabase
- **디렉터리/폴더 구조**:
  - `src/domain/deal/Deal.js` (Domain Model)
  - `src/infrastructure/scraper/*Scraper.js` (Infrastructure)
  - `src/infrastructure/repository/SupabaseDealRepository.js` (Infrastructure)

## 3. 구현 단계 (Implementation Phases)

### Phase 1: Domain Model 확장 (`Deal.js`)
- [x] **RED**: `Deal` 객체 생성 시 `posted_at` 속성을 받을 수 있도록 테스트 케이스 추가 
- [x] **GREEN**: `Deal.js` 생성자에 `posted_at = null` 매개변수 및 속성 할당 추가
- [x] **REFACTOR**: 불필요한 코드 제거
- [x] **Check**: 테스트 통과 여부 확인

### Phase 2: PpomppuScraper 시간 추출 로직 구현
- [x] **RED**: Ppomppu 크롤링 테스트 시 `posted_at`이 정상적으로 추출 및 변환(ISO)되는지 테스트 로직 갱신 (`PpomppuScraper.test.js`)
- [x] **GREEN**: `td.eng.list_vspace`의 `title` 속성("YY.MM.DD HH:mm:ss")에서 날짜를 읽어 Date 변환 로직 적용
- [x] **Check**: 단위 테스트 통과

### Phase 3: QuasarzoneScraper 시간 추출 로직 구현
- [x] **RED**: Quasarzone 상대 시간("X분 전", "X시간 전") 및 절대 날짜("MM-DD") 패턴 파싱 테스트 지정 (`QuasarzoneScraper.test.js`)
- [x] **GREEN**: `.date` 요소에서 날짜 텍스트를 파싱하여 정확한 Date 또는 ISO 문자열을 구하는 헬퍼 도입
- [x] **Check**: 단위 테스트 통과

### Phase 4: FmkoreaScraper 시간 추출 로직 구현
- [ ] **RED**: Fmkorea 개별 게시물 HTML에서 작성 시간 추출 검증 테스트 작성 (`FmkoreaScraper.test.js`)
- [ ] **GREEN**: 상세 페이지(`articleHtml`)에서 `.date.m_no` 또는 `.date` 태그를 읽어와 "YYYY.MM.DD HH:mm" 형태를 ISO로 파싱
- [ ] **Check**: 단위 테스트 통과

### Phase 5: Repository 반영 (`SupabaseDealRepository.js`)
- [x] **GREEN**: `saveAll` 시 DB의 `created_at` 컬럼에 `d.posted_at`가 있으면 해당 값으로 덮어쓰도록 매핑 추가
- [x] **Check**: 통합 테스트/수동 스크립트를 통한 실제 DB 반영 확인

### Phase 6: Bugfix (NULL timestamps)
- [x] **RED**: UI에서 일부 핫딜의 작성 시간이 "Unknown"으로 표시되는 이슈 파악
- [x] **GREEN**: DB 내 `created_at`이 NULL인 11개의 핫딜(뽐뿌 광고 영역 등) 삭제
- [x] **GREEN**: UI `supabase.js` 쿼리에 `.not('created_at', 'is', null)` 추가하여 필터링
- [x] **GREEN**: 모든 크롤러(`Fmkorea`, `Ppomppu`, `Quasarzone`)가 파싱 실패 또는 시간 태그가 없는 항목을 무시(`continue`)하도록 수정

## 4. Quality Gates (품질 검증)
- [x] 모든 단위/통합 테스트 완벽 통과 (Green Status)
- [x] 린트(Lint) 에러/경고 없음
- [x] 크롤러 수동 실행 시 DB에 실제 게시글 작성 시간이 `created_at`으로 잘 들어가는지 확인
- [x] 빌드 파이프라인 성공 후 원격 저장소(`git push`) 반영 완료
