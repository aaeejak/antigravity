from abc import ABC, abstractmethod
from typing import List
from .entity import HotDeal

class Scraper(ABC):
    @abstractmethod
    def scrape(self, html: str) -> List[HotDeal]:
        pass

class HotDealRepository(ABC):
    @abstractmethod
    def save(self, deals: List[HotDeal]) -> None:
        pass
