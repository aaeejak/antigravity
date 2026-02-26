import { describe, it, expect } from 'vitest';
import { Deal } from '../../../src/domain/deal/Deal.js';

describe('Deal Domain Entity', () => {
    it('should throw an error if title is missing', () => {
        expect(() => {
            new Deal({ url: 'https://example.com/1', source: 'test' });
        }).toThrow('Title is required');
    });

    it('should throw an error if url is missing', () => {
        expect(() => {
            new Deal({ title: 'Test Deal', source: 'test' });
        }).toThrow('URL is required');
    });

    it('should create a valid Deal entity with default posted_at as null', () => {
        const deal = new Deal({
            title: 'Test Deal',
            url: 'https://example.com/1',
            source: 'test',
            price: '10,000원',
            thumbnail: 'https://example.com/thumb.jpg'
        });

        expect(deal.title).toBe('Test Deal');
        expect(deal.url).toBe('https://example.com/1');
        expect(deal.source).toBe('test');
        expect(deal.posted_at).toBeNull();
        expect(deal.id).toBeDefined(); // should auto-generate deterministic ID
    });

    it('should create a valid Deal entity with a specific posted_at time', () => {
        const postedAt = '2026-02-27T10:00:00.000Z';
        const deal = new Deal({
            title: 'Test Deal',
            url: 'https://example.com/1',
            source: 'test',
            posted_at: postedAt
        });

        expect(deal.posted_at).toBe(postedAt);
    });
});
