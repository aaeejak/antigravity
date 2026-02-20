from src.domain.hotdeal.interfaces import Scraper, HotDealRepository

class CrawlHotDealsUseCase:
    def __init__(self, scraper: Scraper, repository: HotDealRepository):
        self._scraper = scraper
        self._repository = repository

    def execute(self, html: str) -> None:
        deals = self._scraper.scrape(html)
        if deals:
            self._repository.save(deals)
