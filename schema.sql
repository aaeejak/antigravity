-- Supabase Dashboard 내 "SQL Editor" 에 복사하여 실행해주세요!

-- 1. deals 테이블 생성
CREATE TABLE public.deals (
    id UUID DEFAULT auth.uid() PRIMARY KEY,
    deal_id TEXT NOT NULL, -- 크롤링된 사이트의 글 번호
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE, -- 중복 입력을 막기 위한 Unique 제약 조건
    thumbnail TEXT, -- 썸네일 이미지 URL
    price TEXT,
    original_price TEXT,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 자동 업데이트 트리거 생성 (upsert 시 updated_at 갱신)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deals_modtime
BEFORE UPDATE ON public.deals
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 (프론트엔드용 읽기 채널은 전체 개방)
CREATE POLICY "Enable read access for all users" ON public.deals
    FOR SELECT USING (true);

-- API 키 접근의 경우 기본적으로 서비스 롤키(Server)는 정책을 무시하고 전체 권한이 있습니다.
-- 별도로 프론트엔드쪽에서 AnonKey로 INSERT, UPDATE, DELETE 하는 것은 불가능합니다 (서버 전용).
