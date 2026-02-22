import * as cheerio from 'cheerio';
const urls = ['https://www.fmkorea.com/9517981180', 'https://www.fmkorea.com/9517998042'];

async function check() {
    for (const url of urls) {
        const t = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.text());
        const $ = cheerio.load(t);
        const imgs = $('.xe_content img').map((_, el) => $(el).attr('src') + ' | ' + $(el).attr('data-original')).get();
        console.log(`Images for ${url}:`, imgs);
    }
}
check();
