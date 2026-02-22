import fs from 'fs';
import * as cheerio from 'cheerio';

function parseQuasarzone() {
    console.log("=== QUASARZONE ===");
    const html = fs.readFileSync('quasarzone.html', 'utf8');
    const $ = cheerio.load(html);
    const items = $('.market-info-list tbody tr').toArray();
    console.log(`Initial items found: ${items.length}`);
    for (const el of items) {
        const titleTag = $(el).find('.subject-link');
        const title = titleTag.find('.ellipsis-with-reply-cnt').text().trim();
        const url = titleTag.attr('href');
        const price = $(el).find('.market-info-sub p span').first().text().trim();
        const thumb = $(el).find('img').attr('src');
        if (title) console.log({ title, url, price, thumb });
    }
}

function parsePpomppu() {
    console.log("=== PPOMPPU ===");
    const html = fs.readFileSync('ppomppu.html', 'utf8');
    const $ = cheerio.load(html);
    const items = $('.list_title').parent().parent().parent().toArray(); // Just an example, let's log the first .list_title instead
    const listTitles = $('.list_title').toArray();
    console.log(`Initial titles found: ${listTitles.length}`);
    for (let i = 0; i < 3; i++) {
        if (!listTitles[i]) break;
        const aTag = $(listTitles[i]).parent();
        console.log("Title:", $(listTitles[i]).text().trim(), "Href:", aTag.attr('href'));

        // Ppomppu typical tr has multiple tds.
        const tr = aTag.closest('tr');
        const thumb = tr.find('.thumb_border').attr('src');
        console.log("Thumb:", thumb);
    }
}

parseQuasarzone();
parsePpomppu();
