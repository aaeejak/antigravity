import urllib.request
from src.infrastructure.scraper.fmkorea import FmkoreaScraper

def main():
    print("Fetching FMKorea Hot Deals (1st page)...")
    url = "https://www.fmkorea.com/hotdeal"
    
    try:
        from bs4 import BeautifulSoup
        # fmkorea 는 기본 utf-8이지만, 사이트 측 응답에 따라 메타태그에서 charset 처리 등이 필요할 수 있음.  
        # requests 라이브러리로 대체하여 인코딩 자동 처리를 유도.
        import requests
        print("Using requests for better encoding handling...")
        
        response = requests.get(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'},
        )
        response.encoding = 'utf-8' # FMKorea는 utf-8 베이스지만, 경우에 따라 지정 필요
        html = response.text
    except Exception as e:
        print(f"Failed to fetch: {e}")
        return
        
    scraper = FmkoreaScraper()
    
    import os
    from dotenv import load_dotenv
    from supabase import create_client, Client
    from src.infrastructure.database.supabase import SupabaseHotDealRepository
    from src.application.crawling.use_case import CrawlHotDealsUseCase
    
    load_dotenv()
    url: str = os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("SUPABASE_KEY")
    supabase_client: Client = create_client(url, key)
    
    repository = SupabaseHotDealRepository(supabase_client)
    use_case = CrawlHotDealsUseCase(scraper, repository)
    
    print("Executing Crawl -> Parse -> Save pipeline...")
    use_case.execute(html)
    
    print("--- Pipeline Execution Complete ---")

if __name__ == "__main__":
    main()
