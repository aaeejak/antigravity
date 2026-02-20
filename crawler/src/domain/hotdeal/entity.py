from pydantic import BaseModel
from typing import Optional

class HotDeal(BaseModel):
    id: str
    title: str
    url: str
    price: str
    source: str
    original_price: Optional[str] = None
