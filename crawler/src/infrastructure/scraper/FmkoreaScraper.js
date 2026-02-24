import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { ProxyAgent } from 'undici';
import { Deal } from '../../domain/deal/Deal.js';
import { Scraper } from '../../domain/deal/Scraper.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export class FmkoreaScraper extends Scraper {
    async scrape() {
        const url = "https://www.fmkorea.com/hotdeal";
        const fetchOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        if (process.env.PROXY_URL) {
            fetchOptions.dispatcher = new ProxyAgent(process.env.PROXY_URL);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            throw new Error(`Failed to fetch Fmkorea: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        return this.parseHtml(html);
    }

    async parseHtml(html) {
        const $ = cheerio.load(html);
        const deals = [];
        const elements = $('.fm_best_widget ul li .li').toArray();

        for (const element of elements) {
            const titleTag = $(element).find('h3.title a');
            if (!titleTag.length) continue;

            const rawTitle = titleTag.text().trim();
            const urlPath = titleTag.attr('href') || '';
            const fullUrl = urlPath.startsWith('/') ? `https://fmkorea.com${urlPath}` : urlPath;
            const urlId = fullUrl.includes('/') ? fullUrl.split('/').pop() : 'unknown';

            const infoDiv = $(element).find('.hotdeal_info');
            let price = "0";
            let originalPrice = null;

            if (infoDiv.length) {
                const textParts = infoDiv.text().split(/[\|\n\t]/).map(s => s.trim()).filter(Boolean);
                for (const part of textParts) {
                    if (part.includes('원') && !part.includes('쇼핑몰') && !part.includes('배송') && !part.includes('원가')) {
                        price = part;
                    } else if (part.includes('원') && part.includes('원가')) {
                        originalPrice = part.replace(/\(원가\)/g, '').replace(/원가/g, '').trim();
                    }
                }
            }

            let thumbnail = null;
            try {
                const articleHtml = await fetch(fullUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                }).then(r => r.text());
                const _$ = cheerio.load(articleHtml);
                const imgs = _$('.xe_content img').toArray();
                let validSrc = null;
                for (const img of imgs) {
                    let src = _$(img).attr('src');
                    if (src && !src.includes('transparent') && !src.includes('clear')) {
                        validSrc = src;
                        break;
                    }
                }
                if (validSrc) {
                    if (validSrc.startsWith('//')) validSrc = `https:${validSrc}`;
                    else if (validSrc.startsWith('/')) validSrc = `https://fmkorea.com${validSrc}`;
                    thumbnail = validSrc;
                }
            } catch (err) {
                console.warn(`Failed to fetch high-res image for ${fullUrl}:`, err.message);
            }

            // Note: Removed 70x50 fallback image per previous task

            await sleep(1000); // 1초 대기

            const hash = crypto.createHash('sha256').update(fullUrl).digest('hex');
            const deterministicId = [
                hash.substring(0, 8),
                hash.substring(8, 12),
                '5' + hash.substring(13, 16),
                'a' + hash.substring(17, 20),
                hash.substring(20, 32)
            ].join('-');

            deals.push(new Deal({
                id: deterministicId,
                deal_id: urlId,
                title: rawTitle,
                url: fullUrl,
                thumbnail,
                price,
                original_price: originalPrice,
                source: "fmkorea"
            }));
        }
        return deals;
    }
}
