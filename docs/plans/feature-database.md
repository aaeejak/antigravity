# Supabase 연동 기능 구현 계획

## 1. 개요 (Overview)
- **목표**: 크롤링한 `HotDeal` 엔티티 데이터를 Supabase PostgreSQL 데이터베이스에 저장(추가/업데이트)하는 Infrastructure(Adapter) 구현 및 스키마 세팅.
- **상태**: 진행중
- **예상 소요 시간**: 1 hour
- **시작일 (Start Date)**: 2026-02-20

## 2. 아키텍처 결정사항 (Architecture Decisions)
- **디자인 패턴**: Clean Architecture (Repository Pattern), TDD
- **기술 스택**: Python `supabase` SDK, `python-dotenv`
- **디렉터리/폴더 구조**: 
  - `src/infrastructure/database/`: Supabase Adapter 로직
  - `tests/infrastructure/`: 단위/통합 테스트 (모의 DB 활용)
  - `schema.sql`: 사용자 Supabase 대시보드에서 실행할 SQL 원본 파일

## 3. 구현 단계 (Implementation Phases)

### Phase 1: 스키마 및 환경 설정
- [x] **SQL Script 작성**: 데이터베이스에서 실행할 `deals` 테이블 생성, Unique Constraint 설정, RLS 정책 추가 SQL 작성.
- [x] **사용자 확인 처리**: 사용자가 웹브라우저에서 직접 테이블 및 정책 생성을 마치고 비밀 키를 공유받아 로컬 `.env` 에 연동하도록 대기.

### Phase 2: Infrastructure - SupabaseHotDealRepository 구현
- [x] **RED**: `supabase-py`를 Mocking하여 `.save()` 호출 시 `upsert` 메서드가 올바르게 호출되는지 확인하는 실패 테스트 작성
- [x] **GREEN**: `.env` 설정 정보를 이용하는 `SupabaseRepository` 클래스 작성
- [x] **REFACTOR**: 로깅 및 에러 핸들링 추가 (결정적 UUID 생성 로직 추가 등)
- [x] **Check**: 유스케이스 단위 테스트 통과 (TDD)

## 4. Quality Gates (품질 검증)
- [x] 사용자 Supabase Dashboard에서 `deals` 테이블이 생성되었는지 확인
- [x] Python SDK 단위 테스트 에러 없이 통과
- [x] 실제 로컬 터미널에서 `run.py` 실행 시 실제 수집 데이터 성공적으로 DB 저장 확인
