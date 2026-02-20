import pytest
from pydantic import ValidationError
from src.domain.hotdeal.entity import HotDeal

def test_hotdeal_creation_valid():
    # Arrange & Act
    deal = HotDeal(
        id="test-123",
        title="[핫딜] 테스트 키보드",
        url="https://fmkorea.com/12345",
        price="99,000",
        original_price="150,000",
        source="fmkorea"
    )
    
    # Assert
    assert deal.id == "test-123"
    assert deal.title == "[핫딜] 테스트 키보드"
    assert deal.url == "https://fmkorea.com/12345"
    assert deal.price == "99,000"
    assert deal.original_price == "150,000"
    assert deal.source == "fmkorea"

def test_hotdeal_requires_mandatory_fields():
    # Arrange & Act & Assert
    with pytest.raises(ValidationError):
        # url, source 등 필수 값 누락
        HotDeal(
            id="test-124",
            title="필수값 누락 핫딜",
            price="10,000"
        )
