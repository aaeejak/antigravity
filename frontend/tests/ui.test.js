import { describe, it, expect, beforeEach } from 'vitest';
import { renderDeals, renderError } from '../js/ui.js';

describe('UI Module', () => {
    beforeEach(() => {
        // Setup a mock DOM
        document.body.innerHTML = '<div id="deals-container"></div>';
    });

    it('renders empty state when deals array is empty', () => {
        renderDeals([]);
        const container = document.getElementById('deals-container');
        expect(container.innerHTML).toContain('등록된 핫딜이 없습니다.');
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
        const container = document.getElementById('deals-container');
        expect(container.querySelectorAll('.deal-card').length).toBe(1);
        expect(container.innerHTML).toContain('Test Deal');
    });

    it('renders error message', () => {
        renderError('Failed to load API');
        const container = document.getElementById('deals-container');
        expect(container.innerHTML).toContain('Failed to load API');
    });
});
