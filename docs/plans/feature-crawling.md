# 크롤링 기능 (FMKorea) 구현 계획

## 1. 개요 (Overview)
- **목표**: 펨코(fmkorea) 핫딜 게시판 HTML을 크롤링하여 `HotDeal` 도메인 개체로 파싱하고, DB 저장을 위한 인터페이스로 전달하는 백엔드 파이프라인 구축. (`elky84/web-crawler`의 룰셋 기반 선언적 구조 차용)
- **상태**: 완료
- **예상 소요 시간**: 2 hours
- **시작일 (Start Date)**: 2026-02-20

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: Clean Architecture, TDD
- **기술 스택**: Python 3.13, `pytest` (테스트), `beautifulsoup4` (HTML 파싱), `requests` (HTTP 요청)
- **디렉터리/폴더 구조 (`crawler/` 내)**: 
  - `src/domain/hotdeal/`: 엔티티(Entity) 및 레포지토리/스크래퍼(Interface) 정의
  - `src/application/crawling/`: 비즈니스 유스케이스 (크롤링 -> 필터링 -> DB 저장 파이프라인)
  - `src/infrastructure/scraper/`: `requests`와 `BeautifulSoup`을 이용한 펨코 전용 파서
  - `src/presentation/cli/`: 크론 작업이나 커맨드 라인 실행을 위한 진입점
  - `tests/`: TDD를 위한 테스트 코드 디렉터리

## 3. 구현 단계 (Implementation Phases)

### Phase 1: Domain Model 및 Interface 정의
- [x] **RED**: `HotDeal` 데이터 클래스(Entity) 인스턴스화 시 필수 속성(제목, URL 등) 유효성 검증 실패 테스트 작성
- [x] **GREEN**: `HotDeal` 도메인 모델 구현 및 `dataclasses` 또는 `pydantic` 적용
- [x] **REFACTOR**: 도메인 객체의 순수성 확보 및 인터페이스(레포지토리, 스크래퍼) 명확화
- [x] **Check**: `pytest` 커버리지 확인

### Phase 2: Infrastructure - FMKorea Scraper 구현
- [x] **RED**: 로컬에 저장된 펨코 핫딜 게시판 모의 HTML을 주입하여 `FmkoreaScraper`의 파싱 결과가 올바른지 검증하는 실패 테스트 작성
- [x] **GREEN**: `BeautifulSoup`을 활용하여 펨코용 실제 파싱 로직 구현 (가격, 쇼핑몰, 링크 등 추출)
- [x] **REFACTOR**: DOM 셀렉터 및 파싱 로직을 선언적인 `Rule/Selector` 구조로 리팩토링 (`elky84/web-crawler` 방식 참조)
- [x] **Check**: 테스트 작성 완료 및 파싱 데이터 검증

### Phase 3: Application - CrawlUseCase 구현
- [x] **RED**: 의존성 객체(`Scraper`, `Repository`)를 Mocking(`unittest.mock`)하여 파이프라인 흐름 단위 테스트 작성
- [x] **GREEN**: `CrawlHotDealsUseCase` 를 구현하여 전체 제어 로직 작성
- [x] **REFACTOR**: 로깅 추가 및 에러 핸들링 구조화
- [x] **Check**: 유스케이스 단위 테스트 통과

## 4. Quality Gates (품질 검증)
- [x] 실제 펨코 웹사이트 대상 통합 테스트 1회 이상 성공 확인할 것
- [x] 모든 단위 테스트 통과 상태 유지 (Green Status)
- [x] 컨벤션 및 타입 린팅 에러 없음
