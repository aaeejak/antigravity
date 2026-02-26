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
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'max-age=0',
                'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"Windows"',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1'
            }
        };

        if (process.env.PROXY_URL) {
            fetchOptions.dispatcher = new ProxyAgent(process.env.PROXY_URL);
        }

        let response;
        try {
            response = await fetch(url, fetchOptions);
            if (!response.ok) throw new Error(response.statusText || response.status);
        } catch (error) {
            console.warn(`Fmkorea fetch with proxy failed (${error.message}). Retrying without proxy...`);
            delete fetchOptions.dispatcher;
            response = await fetch(url, fetchOptions);
        }

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
            let posted_at = null;
            try {
                const articleHtml = await fetch(fullUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Cache-Control': 'max-age=0',
                        'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
                        'Sec-Ch-Ua-Mobile': '?0',
                        'Sec-Ch-Ua-Platform': '"Windows"',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'same-origin',
                        'Sec-Fetch-User': '?1',
                        'Upgrade-Insecure-Requests': '1',
                        'Referer': 'https://www.fmkorea.com/hotdeal'
                    }
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

                const dateStr = _$('.date.m_no').text().trim(); // e.g. "2026.02.26 15:53"
                if (dateStr) {
                    const match = dateStr.match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/);
                    if (match) {
                        const [, year, mm, dd, hh, min] = match;
                        posted_at = new Date(`${year}-${mm}-${dd}T${hh}:${min}:00+09:00`).toISOString();
                    }
                }
            } catch (err) {
                console.warn(`Failed to fetch high-res image for ${fullUrl}:`, err.message);
            }

            // Note: Removed 70x50 fallback image per previous task

            await sleep(1000); // 1초 대기

            if (!posted_at) continue;

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
                source: "fmkorea",
                posted_at
            }));
        }
        return deals;
    }
}
