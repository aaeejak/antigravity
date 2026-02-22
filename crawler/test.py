import requests
from bs4 import BeautifulSoup

url = 'https://www.fmkorea.com/hotdeal'
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
soup = BeautifulSoup(response.text, 'html.parser')
item = soup.select_one('.fm_best_widget ul li .li')
print(item.prettify())
