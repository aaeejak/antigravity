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
            new Deal({ title: 'Deal 1', url: 'http://example.com/1', source: 'fmkorea', price: '1000', posted_at: '2026-02-26T15:00:00.000Z' }),
            new Deal({ title: 'Deal 2', url: 'http://example.com/2', source: 'quasarzone', price: '2000' })
        ];

        await repo.saveAll(deals);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('deals');
        expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
            [
                {
                    id: deals[0].id,
                    title: deals[0].title,
                    url: deals[0].url,
                    source: deals[0].source,
                    deal_id: deals[0].deal_id,
                    price: deals[0].price,
                    original_price: null,
                    thumbnail: null,
                    created_at: '2026-02-26T15:00:00.000Z'
                },
                {
                    id: deals[1].id,
                    title: deals[1].title,
                    url: deals[1].url,
                    source: deals[1].source,
                    deal_id: deals[1].deal_id,
                    price: deals[1].price,
                    original_price: null,
                    thumbnail: null,
                }
            ],
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
