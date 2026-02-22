import { describe, it, expect, vi } from 'vitest';
import { CrawlDealsUseCase } from '../../../src/application/crawling/CrawlDealsUseCase.js';
import { Deal } from '../../../src/domain/deal/Deal.js';
import { Scraper } from '../../../src/domain/deal/Scraper.js';
import { DealRepository } from '../../../src/domain/deal/DealRepository.js';

class MockScraperSuccess extends Scraper {
    constructor(source) {
        super();
        this.source = source;
    }
    async scrape() {
        return [new Deal({ title: `Deal from ${this.source}`, url: `http://${this.source}.com/1`, source: this.source })];
    }
}

class MockScraperFailure extends Scraper {
    async scrape() {
        throw new Error('Network error');
    }
}

class MockRepository extends DealRepository {
    async saveAll(deals) {
        this.savedDeals = deals;
    }
}

describe('CrawlDealsUseCase (Application)', () => {
    it('should aggregate deals from multiple scrapers and ignore failures', async () => {
        const repo = new MockRepository();
        const scrapers = [
            new MockScraperSuccess('site1'),
            new MockScraperFailure(),
            new MockScraperSuccess('site2')
        ];
        const useCase = new CrawlDealsUseCase(scrapers, repo);

        await useCase.execute();

        expect(repo.savedDeals).toBeDefined();
        expect(repo.savedDeals.length).toBe(2);
        expect(repo.savedDeals[0].source).toBe('site1');
        expect(repo.savedDeals[1].source).toBe('site2');
    });
});
