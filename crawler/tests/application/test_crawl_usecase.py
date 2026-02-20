import pytest
from unittest.mock import Mock
from src.domain.hotdeal.entity import HotDeal
from src.application.crawling.use_case import CrawlHotDealsUseCase
from src.domain.hotdeal.interfaces import Scraper, HotDealRepository

def test_crawl_usecase_orchestrates_flow():
    # Arrange
    mock_scraper = Mock(spec=Scraper)
    mock_repo = Mock(spec=HotDealRepository)
    
    # 가짜 반환 데이터 설정
    fake_deals = [
        HotDeal(
            id="1", title="Test Deal", url="http://test.com", 
            price="100", source="test"
        )
    ]
    mock_scraper.scrape.return_value = fake_deals
    
    use_case = CrawlHotDealsUseCase(
        scraper=mock_scraper,
        repository=mock_repo
    )
    
    # Act
    use_case.execute("<html>FAKE HTML</html>")
    
    # Assert
    mock_scraper.scrape.assert_called_once_with("<html>FAKE HTML</html>")
    mock_repo.save.assert_called_once_with(fake_deals)
