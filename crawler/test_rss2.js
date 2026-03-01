import * as cheerio from 'cheerio';

async function testRss() {
    const urls = [
        "https://www.fmkorea.com/hotdeal/rss",
        "https://www.fmkorea.com/index.php?mid=hotdeal&act=rss",
        "https://www.fmkorea.com/rss",
        "https://www.fmkorea.com/search?q=cache:hotdeal",
    ];

    for (const url of urls) {
        console.log(`Testing: ${url}`);
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
                }
            });
            console.log(`  Result: ${response.status} ${response.statusText}`);
            if (response.ok) {
                const text = await response.text();
                console.log(`  Length: ${text.length}`);
                if (text.includes('fm_best_widget') || text.includes('<item>')) {
                    console.log("  Success!");
                }
            }
        } catch (e) {
            console.error(`  Error: ${e.message}`);
        }
    }
}
testRss();
