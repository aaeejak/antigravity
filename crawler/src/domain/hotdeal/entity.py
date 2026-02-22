from pydantic import BaseModel
from typing import Optional

class HotDeal(BaseModel):
    id: str
    title: str
    url: str
    thumbnail: Optional[str] = None
    price: str
    source: str
    original_price: Optional[str] = None
