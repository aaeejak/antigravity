import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { Deal } from '../../domain/deal/Deal.js';
import { Scraper } from '../../domain/deal/Scraper.js';

export class QuasarzoneScraper extends Scraper {
    async scrape() {
        const url = "https://quasarzone.com/bbs/qb_saleinfo";
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!response.ok) throw new Error(`Quasarzone fetch failed: ${response.status}`);
        const html = await response.text();
        return this.parseHtml(html);
    }

    parseHtml(html) {
        const $ = cheerio.load(html);
        const deals = [];
        const items = $('.market-info-list').toArray();

        for (const el of items) {
            const titleTag = $(el).find('.tit .subject-link');
            if (!titleTag.length) continue;

            let title = titleTag.find('.ellipsis-with-reply-cnt').text().trim();
            if (!title) title = titleTag.text().trim();

            let urlPath = titleTag.attr('href') || '';
            const url = urlPath.startsWith('/') ? `https://quasarzone.com${urlPath}` : urlPath;

            const priceText = $(el).find('.text-orange').first().text().trim();
            const price = priceText.replace(/[^0-9]/g, ''); // Numeric price

            // Get thumbnail from the left side
            let thumbnail = null;
            const img = $(el).find('.thumb-wrap img').first();
            if (img.length) {
                thumbnail = img.attr('src');
            }

            if (title && url) {
                const urlId = url.split('/').pop();
                const hash = crypto.createHash('sha256').update(url).digest('hex');
                const deterministicId = [
                    hash.substring(0, 8),
                    hash.substring(8, 12),
                    '5' + hash.substring(13, 16),
                    'a' + hash.substring(17, 20),
                    hash.substring(20, 32)
                ].join('-');

                deals.push(new Deal({
                    id: deterministicId,
                    title,
                    url,
                    deal_id: urlId,
                    price: priceText, // or price
                    source: 'quasarzone',
                    thumbnail
                }));
            }
        }
        return deals;
    }
}
