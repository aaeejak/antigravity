export class CrawlDealsUseCase {
    /**
     * @param {import('../../domain/deal/Scraper.js').Scraper[]} scrapers 
     * @param {import('../../domain/deal/DealRepository.js').DealRepository} repository 
     */
    constructor(scrapers, repository) {
        this.scrapers = scrapers;
        this.repository = repository;
    }

    async execute() {
        console.log(`Starting crawl with ${this.scrapers.length} scrapers...`);

        const results = await Promise.allSettled(
            this.scrapers.map(scraper => scraper.scrape())
        );

        const allDeals = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const deals = result.value;
                console.log(`Scraper ${this.scrapers[index].constructor.name} found ${deals.length} deals.`);
                allDeals.push(...deals);
            } else {
                console.error(`Scraper ${this.scrapers[index].constructor.name} failed:`, result.reason);
            }
        });

        if (allDeals.length > 0) {
            console.log(`Saving ${allDeals.length} total deals to repository...`);
            await this.repository.saveAll(allDeals);
        } else {
            console.log("No deals found to save.");
        }
    }
}
