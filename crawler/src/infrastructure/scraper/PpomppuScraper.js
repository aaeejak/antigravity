import * as cheerio from 'cheerio';
import crypto from 'crypto';
import iconv from 'iconv-lite';
import { Deal } from '../../domain/deal/Deal.js';
import { Scraper } from '../../domain/deal/Scraper.js';

export class PpomppuScraper extends Scraper {
    async scrape() {
        const url = "https://www.ppomppu.co.kr/zboard/zboard.php?id=ppomppu";
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (!response.ok) throw new Error(`Ppomppu fetch failed: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return this.parseBuffer(buffer);
    }

    parseBuffer(buffer) {
        // Ppomppu uses EUC-KR encoding
        const html = iconv.decode(buffer, 'euc-kr');
        const $ = cheerio.load(html);
        const deals = [];

        // Ppomppu hot deals are usually in tr.baseList or tr class that contains list_vspace
        const items = $('tr.baseList').toArray();
        if (items.length === 0) {
            // Alternatively try finding `.list_title` or `.baseList-title` directly
            const links = $('.baseList-title').toArray();
            for (const link of links) {
                const titleTag = $(link);
                const title = titleTag.text().trim();
                let urlPath = titleTag.attr('href') || '';
                if (urlPath.startsWith('/zboard/')) urlPath = `https://www.ppomppu.co.kr${urlPath}`;
                else if (!urlPath.startsWith('http')) urlPath = `https://www.ppomppu.co.kr/zboard/${urlPath}`;

                const tr = titleTag.closest('tr');
                let thumbnail = null;
                const img = tr.find('.thumb_border');
                if (img.length) {
                    thumbnail = img.attr('src');
                    if (thumbnail && thumbnail.startsWith('//')) thumbnail = `https:${thumbnail}`;
                }

                if (title && urlPath) {
                    const hash = crypto.createHash('sha256').update(urlPath).digest('hex');
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
                        url: urlPath,
                        deal_id: urlPath.split('no=').pop() || hash.substring(0, 8),
                        price: '0', // Ppomppu title doesn't strictly separate price always, we'll extract it if possible or leave 0
                        source: 'ppomppu',
                        thumbnail
                    }));
                }
            }
            return deals;
        }

        // If tr.baseList found
        for (const el of items) {
            const titleTag = $(el).find('.baseList-title');
            if (!titleTag.length) continue;

            const title = titleTag.text().trim();
            let urlPath = titleTag.attr('href') || '';
            if (urlPath.startsWith('/zboard/')) urlPath = `https://www.ppomppu.co.kr${urlPath}`;
            else if (!urlPath.startsWith('http')) urlPath = `https://www.ppomppu.co.kr/zboard/${urlPath}`;

            let thumbnail = null;
            const img = $(el).find('.thumb_border');
            if (img.length) {
                thumbnail = img.attr('src');
                if (thumbnail && thumbnail.startsWith('//')) thumbnail = `https:${thumbnail}`;
            }

            if (title && urlPath) {
                const hash = crypto.createHash('sha256').update(urlPath).digest('hex');
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
                    url: urlPath,
                    deal_id: urlPath.split('no=').pop() || hash.substring(0, 8),
                    price: '0',
                    source: 'ppomppu',
                    thumbnail
                }));
            }
        }
        return deals;
    }
}
