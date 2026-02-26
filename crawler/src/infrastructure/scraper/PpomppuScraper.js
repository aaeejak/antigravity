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

                let posted_at = null;
                const timeTag = tr.find('td[title], td.eng.list_vspace');
                let timeStr = timeTag.attr('title') || timeTag.text().trim() || tr.find('time.baseList-time').text().trim() || tr.find('nobr.eng').attr('title') || tr.find('nobr.eng').text().trim();
                if (timeStr) {
                    // Format is usually "YY.MM.DD HH:mm:ss"
                    const match = timeStr.match(/(\d{2})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
                    if (match) {
                        const [, yy, mm, dd, hh, min, ss] = match;
                        const year = parseInt(yy, 10) + 2000;
                        posted_at = new Date(`${year}-${mm}-${dd}T${hh}:${min}:${ss}+09:00`).toISOString();
                    } else if (timeStr.includes(':')) {
                        // "HH:mm:ss" means today
                        const now = new Date();
                        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD
                        posted_at = new Date(`${todayStr}T${timeStr}+09:00`).toISOString();
                    }
                }

                if (title && urlPath && posted_at) {
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
                        price: title.match(/([0-9,]+)\s*원/) ? title.match(/([0-9,]+)\s*원/)[1] : '0',
                        source: 'ppomppu',
                        thumbnail,
                        posted_at
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

            let posted_at = null;
            const timeTag = $(el).find('td[title], td.eng.list_vspace');
            let timeStr = timeTag.attr('title') || timeTag.text().trim() || $(el).find('time.baseList-time').text().trim() || $(el).find('nobr.eng').attr('title') || $(el).find('nobr.eng').text().trim();
            // sometimes title is inside a span
            if (!timeStr) {
                timeStr = $(el).find('[title]').attr('title');
            }
            if (timeStr) {
                // Format is usually "YY.MM.DD HH:mm:ss"
                const match = timeStr.match(/(\d{2})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
                if (match) {
                    const [, yy, mm, dd, hh, min, ss] = match;
                    const year = parseInt(yy, 10) + 2000;
                    posted_at = new Date(`${year}-${mm}-${dd}T${hh}:${min}:${ss}+09:00`).toISOString();
                } else if (timeStr.includes(':')) {
                    // "HH:mm:ss" means today
                    const now = new Date();
                    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); // YYYY-MM-DD
                    posted_at = new Date(`${todayStr}T${timeStr}+09:00`).toISOString();
                }
            }

            if (title && urlPath && posted_at) {
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
                    price: title.match(/([0-9,]+)\s*원/) ? title.match(/([0-9,]+)\s*원/)[1] : '0',
                    source: 'ppomppu',
                    thumbnail,
                    posted_at
                }));
            }
        }
        return deals;
    }
}
