import pytest
from src.infrastructure.scraper.fmkorea import FmkoreaScraper

@pytest.fixture
def mock_fmkorea_html():
    return """
    <div class="fm_best_widget">
        <ul>
            <li class="li_best2_pop0">
                <div class="li">
                    <a href="/45678" class="thumb">
                        <img src="//znfmkorea.com/image.jpg" alt="test">
                    </a>
                    <h3 class="title">
                        <a href="/45678" tabindex="-1">
                            [11마존] 커세어 K70 PRO 미니 무선
                        </a>
                        <span class="reply_count">[15]</span>
                    </h3>
                    <div class="hotdeal_info">
                        <span>120,000원</span>
                        <span>150,000원 (원가)</span>
                        <a href="https://example.com/mall">11번가</a>
                    </div>
                </div>
            </li>
            <li class="li_best2_pop0">
                <div class="li">
                    <h3 class="title">
                        <a href="/99999" tabindex="-1">
                            [G마켓] 햇반 210g 36개
                        </a>
                    </h3>
                    <div class="hotdeal_info">
                        <span>32,400원</span>
                        <a href="https://example.com/mall">지마켓</a>
                    </div>
                </div>
            </li>
        </ul>
    </div>
    """

def test_fmkorea_scraper_parses_html(mock_fmkorea_html):
    # Arrange
    scraper = FmkoreaScraper()
    
    # Act
    deals = scraper.scrape(mock_fmkorea_html)
    
    # Assert
    assert len(deals) == 2
    assert deals[0].title == "[11마존] 커세어 K70 PRO 미니 무선"
    assert deals[0].url == "https://fmkorea.com/45678"
    assert deals[0].thumbnail == "https://znfmkorea.com/image.jpg"
    assert deals[0].price == "120,000원"
    assert deals[0].original_price == "150,000원"
    assert deals[0].source == "fmkorea"
    
    assert deals[1].title == "[G마켓] 햇반 210g 36개"
    assert deals[1].url == "https://fmkorea.com/99999"
    assert deals[1].thumbnail is None
    assert deals[1].price == "32,400원"
    assert deals[1].original_price is None
    assert deals[1].source == "fmkorea"
