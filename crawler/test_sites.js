import fs from 'fs';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';

async function fetchSample(url, name) {
    try {
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
        const arrayBuffer = await r.arrayBuffer();
        let t;
        if (name === 'Ppomppu') {
            t = iconv.decode(Buffer.from(arrayBuffer), 'euc-kr');
        } else {
            t = Buffer.from(arrayBuffer).toString('utf-8');
        }

        fs.writeFileSync(`${name.toLowerCase()}.html`, t);
        console.log(`Saved ${name.toLowerCase()}.html`);
    } catch (e) {
        console.error(e.message);
    }
}

async function test() {
    await fetchSample("https://quasarzone.com/bbs/qb_saleinfo", "Quasarzone");
    await fetchSample("https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu", "Ppomppu");
}
test();
