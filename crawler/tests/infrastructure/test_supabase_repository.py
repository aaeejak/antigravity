import pytest
from unittest.mock import MagicMock, patch
from src.domain.hotdeal.entity import HotDeal
from src.infrastructure.database.supabase import SupabaseHotDealRepository

def test_supabase_repository_upserts_deals():
    # Arrange
    fake_deals = [
        HotDeal(id="1", title="Deal 1", url="http://d1.com", price="100", source="test"),
        HotDeal(id="2", title="Deal 2", url="http://d2.com", price="200", original_price="300", source="test"),
    ]
    
    # supabase client mocking
    mock_supabase_client = MagicMock()
    mock_table = MagicMock()
    mock_upsert = MagicMock()
    
    mock_supabase_client.table.return_value = mock_table
    mock_table.upsert.return_value = mock_upsert
    
    repo = SupabaseHotDealRepository(mock_supabase_client)
    
    # Act
    repo.save(fake_deals)
    
    # Assert
    mock_supabase_client.table.assert_called_once_with('deals')
    
    # Verify exact data payload sent to upsert
    expected_payload = [
        {
            "deal_id": "1",
            "title": "Deal 1",
            "url": "http://d1.com",
            "price": "100",
            "original_price": None,
            "source": "test"
        },
        {
            "deal_id": "2",
            "title": "Deal 2",
            "url": "http://d2.com",
            "price": "200",
            "original_price": "300",
            "source": "test"
        }
    ]
    mock_table.upsert.assert_called_once_with(expected_payload, on_conflict="url")
    mock_upsert.execute.assert_called_once()
