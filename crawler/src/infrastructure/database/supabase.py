from typing import List
import uuid
from supabase import Client
from src.domain.hotdeal.entity import HotDeal
from src.domain.hotdeal.interfaces import HotDealRepository

class SupabaseHotDealRepository(HotDealRepository):
    def __init__(self, client: Client):
        self._client = client
        self._table = "deals"

    def save(self, deals: List[HotDeal]) -> None:
        if not deals:
            return
            
        payload = []
        for deal in deals:
            # Deterministic UUID based on URL to satisfy NOT NULL constraint and prevent overwrite issues
            deterministic_id = str(uuid.uuid5(uuid.NAMESPACE_URL, deal.url))
            
            payload.append({
                "id": deterministic_id,
                "deal_id": deal.id,
                "title": deal.title,
                "url": deal.url,
                "price": deal.price,
                "original_price": deal.original_price,
                "source": deal.source
            })
            
        # upsert을 통해 url(unique constraints) 중복 시 덮어쓰기 동작 수행
        self._client.table(self._table).upsert(payload, on_conflict="url").execute()
