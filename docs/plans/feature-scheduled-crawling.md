# 주기적 크롤링 (Scheduled Crawling) 구현 계획

## 1. 개요 (Overview)
- **목표**: 기존 사용자 접속 시 수행하던 온디맨드(On-demand) 크롤링에서 백그라운드 스케줄링(주기적 크롤링) 방식으로 전환하여 프론트엔드 응답 속도를 개선합니다. 크롤링된 데이터는 Supabase DB에 저장됩니다.
- **상태**: 진행중
- **예상 소요 시간**: 4 hours
- **시작일 (Start Date)**: 2026-02-24

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: Clean Architecture
- **기술 스택**: Node.js, Cheerio, Vitest (TDD), Supabase (Database), Github Actions (Scheduler)
- **디렉터리/폴더 구조**: 
  - `src/domain/deal/...` (엔티티, 저장소 인터페이스)
  - `src/application/crawling/...` (크롤링 유스케이스)
  - `src/infrastructure/scraper/...` (크롤러 구현)
  - `src/infrastructure/repository/SupabaseDealRepository.js` (Supabase 저장소 구현)
  - `src/presentation/cli/...` (Cron 진입점, Github Actions 스크립트)

## 3. 구현 단계 (Implementation Phases)

### Phase 1: 저장소 연동 (Supabase Deal Repository)
- [x] **RED**: Supabase client가 `saveAll` 호출 시 적절한 인자(upsert)로 쿼리하는지 검증하는 실패하는 테스트 작성
- [x] **GREEN**: `@supabase/supabase-js` 기반의 `SupabaseDealRepository` 구현 (upsert 로직 완성)
- [x] **REFACTOR**: DB 연동 부분 에러 핸들링 및 의존성 주입 개선
- [x] **Check**: 단위 테스트 통과 (Green Status)

### Phase 2: Application UseCase (Scheduled Crawl)
- [x] **RED**: 스케줄러가 여러 Scraper의 결과를 모아 `DealRepository.saveAll()`에 전달하는지 테스트 작성
- [x] **GREEN**: 기존 크롤링 결과를 그대로 리턴하던 구조에서, Repository를 통해 저장(Save) 후 결과를(혹은 개수만) 리턴하는 구조로 확장
- [x] **REFACTOR**: 병렬 실행 실패 및 성공 케이스 분리 (Promise.allSettled 활용 최적화 등)
- [x] **Check**: 유스케이스 테스트 유효성 검증

### Phase 3: Infrastructure (Github Actions & CLI)
- [x] CLI 환경 진입점을 구현 (예: `npm run start:crawler`)
- [x] 환경 변수 주입 방식 점검 및 `.github/workflows/crawler-cron.yml` 작성
- [x] 실제 크롤링 시나리오와 Supabase 저장 간 연동 통합 테스트 (Manual / Scripted)

## 4. Quality Gates (품질 검증)
- [ ] 모든 단위/통합 테스트 완벽 통과 (Green Status)
- [ ] Supabase 'deals' 테이블에 중복 데이터 없이 온전히 Insert/Upsert 되는지 검증
- [ ] 린트(Lint) 및 정적 분석 에러/경고 없음
- [ ] 빌드 파이프라인 성공 후 원격 저장소(`git push`) 반영 완료
