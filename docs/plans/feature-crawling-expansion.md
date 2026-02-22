# 크롤링 확장 (Quasarzone, Ppomppu) 구현 계획

## 1. 개요 (Overview)
- **목표**: 퀘이사존 및 뽐뿌 커뮤니티의 핫딜 데이터를 수집하여 추가하는 크롤링 파이프라인 확장
- **상태**: 진행중
- **예상 소요 시간**: 3 hours
- **시작일 (Start Date)**: 2026-02-23

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: Clean Architecture
- **기술 스택**: Node.js, Cheerio, Vitest (TDD)
- **디렉터리/폴더 구조**:
  - `crawler/src/domain/deal/`: 엔티티(Deal) 및 인터페이스(Scraper, Repository)
  - `crawler/src/application/crawling/`: 크롤링 유스케이스
  - `crawler/src/infrastructure/scraper/`: 각 사이트별 스크래퍼(Fmkorea, Quasarzone, Ppomppu)
  - `crawler/src/infrastructure/repository/`: Supabase 저장소 구현체
  - `crawler/src/presentation/cli/`: 크론 작업이나 커맨드 라인 실행을 위한 진입점
  - `crawler/tests/`: TDD를 위한 테스트 코드

## 3. 구현 단계 (Implementation Phases)

### Phase 1: Domain Model 및 Interface 재정비 (Node.js)
- [x] **RED**: `Deal` 엔티티 생성 시 필수 속성 검증 실패 테스트 작성
- [x] **GREEN**: `Deal` 클래스 및 Scraper/Repository 인터페이스 (TypeScript/JSDoc) 구현
- [x] **REFACTOR**: 도메인 분리 
- [x] **Check**: Vitest 통과 확인

### Phase 2: Infrastructure - Quasarzone Scraper 구현
- [x] **RED**: 퀘이사존 모의 HTML을 주입하여 파싱 실패 테스트 작성
- [x] **GREEN**: Cheerio를 이용해 퀘이사존 파싱 로직 구현
- [x] **REFACTOR**: 선택자 상수화 등
- [x] **Check**: 단위 테스트 통과

### Phase 3: Infrastructure - Ppomppu Scraper 구현
- [x] **RED**: 뽐뿌 모의 HTML (EUC-KR) 주입 시 파싱 실패 테스트 작성
- [x] **GREEN**: iconv-lite 및 Cheerio를 이용해 뽐뿌 파싱 로직 구현
- [x] **REFACTOR**: 디코딩 로직 헬퍼 분리
- [x] **Check**: 단위 테스트 통과

### Phase 4: Application - Multi-Scraping UseCase 구현
- [x] **RED**: Scraper 인터페이스 다수를 주입받아 모두 실행하는지 검증하는 테스트 작성
- [x] **GREEN**: 여러 스크래퍼를 병렬(`Promise.allSettled`)로 실행하여 결과를 취합/저장하는 UseCase 구현
- [x] **REFACTOR**: 기존 단일 스크래퍼 대응에서 다중 스크래퍼 배열 기반으로 변경
- [x] **Check**: UseCase 테스트 통과

## 4. Quality Gates (품질 검증)
- [x] 실제 웹 대상 통합 테스트 성공 (CLI 진입점)
- [x] 단위/통합 테스트 완벽 통과 (Green Status)
- [x] 기존 Supabase 스키마와 데이터 호환성 유지
