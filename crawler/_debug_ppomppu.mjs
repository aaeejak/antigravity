import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

const url = "https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu";
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
const buf = Buffer.from(await res.arrayBuffer());
const html = iconv.decode(buf, 'euc-kr');
const $ = cheerio.load(html);

const items = $('tr.baseList').toArray();
console.log('Total tr.baseList:', items.length);

for (let i = 0; i < Math.min(3, items.length); i++) {
    const el = items[i];
    console.log(`\n=== Row ${i} ===`);
    const titleTag = $(el).find('.baseList-title');
    console.log('Title:', titleTag.text().trim().substring(0, 60));

    const imgs = $(el).find('img').toArray();
    console.log('All img count:', imgs.length);
    for (let j = 0; j < imgs.length; j++) {
        const img = $(imgs[j]);
        console.log(`  img[${j}]:`, JSON.stringify({
            src: img.attr('src'),
            class: img.attr('class'),
            'data-src': img.attr('data-src'),
            'data-original': img.attr('data-original'),
        }));
    }

    console.log('.thumb_border:', $(el).find('.thumb_border').length);
    console.log('.baseList-thumb:', $(el).find('.baseList-thumb').length);

    const tds = $(el).find('td').toArray();
    for (let t = 0; t < Math.min(5, tds.length); t++) {
        const tdHtml = $(tds[t]).html();
        if (tdHtml && (tdHtml.includes('img') || tdHtml.includes('thumb'))) {
            console.log(`  TD[${t}] (${tdHtml.length} chars):`, tdHtml.substring(0, 400));
        }
    }
}
