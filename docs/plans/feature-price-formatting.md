# 가격 정보 포맷팅 통일 (Price Formatting) 구현 계획

## 1. 개요 (Overview)
- **목표**: 뽐뿌, 퀘이사존, 에펨코리아 등 다양한 소스에서 수집되는 가격 정보를 일관된 포맷(예: `￦ 14,606 (KRW)`, `$ 15.99 (USD)`)으로 통일하여 사용자 경험을 향상시킨다.
- **상태**: 진행중
- **예상 소요 시간**: 1시간
- **시작일**: 2026-03-02

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: Clean Architecture
- **유틸리티 추가**: `src/domain/deal/PriceFormatter.js` 생성
  - 문자열 내에서 `$`, `\u0024`, `USD`, `달러` 등을 감지하여 USD로 처리
  - `¥`, `JPY`, `엔` 등을 감지하여 JPY로 처리
  - `€`, `EUR`, `유로` 등을 감지하여 EUR로 처리
  - 기본값 및 `원`, `KRW`, `￦` 등은 KRW로 처리
  - 숫자를 추출하여 천 단위 콤마(,) 쉼표를 삽입하고 기호와 함께 문자열 반환

## 3. 구현 단계 (Implementation Phases)

### Phase 1: PriceFormatter 도메인 서비스 구현 
- [ ] **RED**: `PriceFormatter.test.js` 작성 (다양한 가격 텍스트 입력 시기대하는 포맷 반환 테스트)
- [ ] **GREEN**: `PriceFormatter.js` 구현 (통화 기호 감지 및 숫자 추출, 콤마 포맷팅)
- [ ] **REFACTOR**: 정규식 최적화 및 가독성 개선

### Phase 2: 각 Scraper에 PriceFormatter 적용
- [ ] **RED/GREEN**: `QuasarzoneScraper.js`, `PpomppuScraper.js`, `FmkoreaScraper.js` 내의 가격 추출(price) 로직을 `PriceFormatter.format`을 거치도록 수정
- [ ] **Check**: 각 스크래퍼 단위 테스트 실행 및 통과 확인

### Phase 3: DB 및 UI 확인
- [ ] **Check**: 크롤러 수동 실행 (`node src/presentation/cli/index.js`) 후 Supabase DB에 포맷팅된 텍스트가 저장되는지 확인
- [ ] **Check**: UI 상에서 일관된 포맷(예: `￦ 14,606 (KRW)`)으로 노출되는지 최종 확인

## 4. Quality Gates (품질 검증)
- [ ] 모든 단위/통합 테스트 완벽 통과 (Green Status)
- [ ] 린트(Lint) 불량/에러 여부
- [ ] DB 저장 결과물 확인
