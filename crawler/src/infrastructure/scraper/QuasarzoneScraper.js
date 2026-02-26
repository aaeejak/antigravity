import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { ProxyAgent } from 'undici';
import { Deal } from '../../domain/deal/Deal.js';
import { Scraper } from '../../domain/deal/Scraper.js';

export class QuasarzoneScraper extends Scraper {
    async scrape() {
        const url = "https://quasarzone.com/bbs/qb_saleinfo";
        const fetchOptions = {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        };

        if (process.env.PROXY_URL) {
            fetchOptions.dispatcher = new ProxyAgent(process.env.PROXY_URL);
        }

        const response = await fetch(url, fetchOptions);
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

            let posted_at = null;
            const dateStr = $(el).find('.date').text().trim();
            if (dateStr) {
                const now = new Date();
                if (dateStr === '방금') {
                    posted_at = now.toISOString();
                } else if (dateStr.includes('분 전')) {
                    const mins = parseInt(dateStr, 10);
                    now.setMinutes(now.getMinutes() - mins);
                    posted_at = now.toISOString();
                } else if (dateStr.includes('시간 전')) {
                    const hours = parseInt(dateStr, 10);
                    now.setHours(now.getHours() - hours);
                    posted_at = now.toISOString();
                } else if (dateStr.match(/^\d{2}-\d{2}$/)) {
                    // MM-DD format, assume current year
                    const [mm, dd] = dateStr.split('-');
                    const year = now.getFullYear();
                    posted_at = new Date(`${year}-${mm}-${dd}T00:00:00+09:00`).toISOString();
                }
            }

            if (title && url && posted_at) {
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
                    thumbnail,
                    posted_at
                }));
            }
        }
        return deals;
    }
}
