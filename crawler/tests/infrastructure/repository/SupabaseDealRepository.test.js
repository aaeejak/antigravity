import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Deal } from '../../../src/domain/deal/Deal.js';
import { SupabaseDealRepository } from '../../../src/infrastructure/repository/SupabaseDealRepository.js';

describe('SupabaseDealRepository', () => {
    let mockSupabaseClient;
    let mockUpsert;
    let mockFrom;

    beforeEach(() => {
        mockUpsert = vi.fn().mockResolvedValue({ error: null });
        mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });

        mockSupabaseClient = {
            from: mockFrom
        };
    });

    it('should upsert deals ignoring conflicts on "url"', async () => {
        const repo = new SupabaseDealRepository(mockSupabaseClient);
        const deals = [
            new Deal({ title: 'Deal 1', url: 'http://example.com/1', source: 'fmkorea', price: '1000' }),
            new Deal({ title: 'Deal 2', url: 'http://example.com/2', source: 'quasarzone', price: '2000' })
        ];

        await repo.saveAll(deals);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
        expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
            deals.map(d => ({
                id: d.id,
                title: d.title,
                url: d.url,
                source: d.source,
                deal_id: d.deal_id,
                price: d.price,
                original_price: null,
                thumbnail: null,
            })),
            { onConflict: 'url' }
        );
    });

    it('should throw error if upsert fails', async () => {
        const repo = new SupabaseDealRepository(mockSupabaseClient);
        mockUpsert.mockResolvedValueOnce({ error: { message: 'DB Error' } });

        const deals = [
            new Deal({ title: 'Deal 1', url: 'http://example.com/1', source: 'fmkorea', price: '1000' })
        ];

        await expect(repo.saveAll(deals)).rejects.toThrow('DB Error');
    });
});
