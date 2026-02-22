from bs4 import BeautifulSoup
from typing import List, Optional
from src.domain.hotdeal.entity import HotDeal
from src.domain.hotdeal.interfaces import Scraper

class FmkoreaScraper(Scraper):
    def scrape(self, html: str) -> List[HotDeal]:
        soup = BeautifulSoup(html, 'html.parser')
        deals = []
        
        # 펨코 핫딜 위젯 리스트 파싱
        items = soup.select('.fm_best_widget ul li .li')
        
        for item in items:
            title_tag = item.select_one('h3.title a')
            if not title_tag:
                continue
                
            # "[11마존] 커세어 K70 PRO 미니 무선" 형태 추출 (댓글수 span 제거 후 텍스트)
            # clone the tag to avoid modifying the tree if we needed it again, but since it's local it's fine.
            reply_span = title_tag.find_next_sibling('span', class_='reply_count')
            if reply_span:
                # 텍스트만 깔끔하게 추출하기 위해 부모에서 순수 텍스트만 조립하는 방식 대신 정제
                pass
                
            raw_title = title_tag.get_text(strip=True)
            # href 추출
            url_path = title_tag.get('href', '')
            full_url = f"https://fmkorea.com{url_path}" if url_path.startswith('/') else url_path
            url_id = full_url.split('/')[-1] if '/' in full_url else 'unknown'
            
            # 가격 정보 추출 (fmkorea에서는 .hotdeal_info 요소 구조가 다를 수 있음)
            info_div = item.select_one('.hotdeal_info')
            if not info_div:
                continue
                
            # 에펨코리아는 span 내부에 여러 텍스트가 섞여있거나 다른 구조일 수 있음.
            # 모의 데이터에 맞춘 기본 태그부터
            price = "0"
            price_span = info_div.find('span', string=lambda s: s and '원' in s and '쇼핑몰' not in s and '배송비' not in s)
            
            # 실제 응답과 다를 경우 fallback으로 span(1) 같은 위치 기반이나 특정 클래스가 있는지 확인
            all_info_text = info_div.get_text(separator='|', strip=True)
            text_parts = all_info_text.split('|')
            
            original_price = None
            for part in text_parts:
                if '원' in part and '쇼핑몰' not in part and '배송' not in part and '원가' not in part:
                    price = part.strip()
                elif '원' in part and '원가' in part:
                    original_price = part.replace('(원가)', '').replace('원가', '').strip()
                    
            # 썸네일 경로 추출
            thumbnail = None
            thumb_link = item.select_one('.thumb img')
            if thumb_link:
                # src가 없으면 data-original 등을 확인, 펨코 구조에 따름
                thumbnail = thumb_link.get('src') or thumb_link.get('data-original')
                # 프로토콜 추가
                if thumbnail and thumbnail.startswith('//'):
                    thumbnail = f"https:{thumbnail}"
            
            deals.append(HotDeal(
                id=url_id,
                title=raw_title,
                url=full_url,
                thumbnail=thumbnail,
                price=price,
                original_price=original_price,
                source="fmkorea"
            ))
            
        return deals
