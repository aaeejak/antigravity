import crypto from 'crypto';

export class Deal {
    constructor({ title, url, deal_id, source, price = '0', original_price = null, thumbnail = null, id = null }) {
        if (!title) throw new Error('Title is required');
        if (!url) throw new Error('URL is required');

        this.title = title.trim();
        this.url = url.trim();
        this.source = source || 'unknown';
        this.deal_id = deal_id || url.split('/').pop();
        this.price = price;
        this.original_price = original_price;
        this.thumbnail = thumbnail;

        // auto-generate ID if not provided, for simplicity we use hash of URL
        this.id = id || this.generateDeterministicId(this.url);
    }

    generateDeterministicId(url) {
        const hash = crypto.createHash('sha256').update(url).digest('hex');
        return [
            hash.substring(0, 8),
            hash.substring(8, 12),
            '5' + hash.substring(13, 16),
            'a' + hash.substring(17, 20),
            hash.substring(20, 32)
        ].join('-');
    }
}
