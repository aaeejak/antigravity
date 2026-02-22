import { describe, it, expect, beforeEach } from 'vitest';
import { renderDeals, renderError } from '../js/ui.js';

describe('UI Module', () => {
    beforeEach(() => {
        // Setup a mock DOM
        document.body.innerHTML = '<div id="deal-list"></div>';
    });

    it('renders empty state when deals array is empty', () => {
        renderDeals([]);
        const container = document.getElementById('deal-list');
        expect(container.innerHTML).toContain('No active deals found');
    });

    it('renders deals when provided', () => {
        const mockDeals = [
            {
                id: '1',
                title: 'Test Deal',
                url: 'http://example.com',
                price: '1000',
                source: 'test',
                created_at: new Date().toISOString()
            }
        ];

        renderDeals(mockDeals);
        const container = document.getElementById('deal-list');
        expect(container.querySelectorAll('.deal-card').length).toBe(1);
        expect(container.innerHTML).toContain('Test Deal');
    });

    it('renders error message', () => {
        renderError('Failed to load API');
        const container = document.getElementById('deal-list');
        expect(container.innerHTML).toContain('Failed to load API');
        expect(container.querySelector('.error-message')).not.toBeNull();
    });
});
