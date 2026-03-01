import { describe, it, expect } from 'vitest';
import { PriceFormatter } from '../../../src/domain/deal/PriceFormatter.js';

describe('PriceFormatter', () => {
    it('should format KRW prices correctly', () => {
        expect(PriceFormatter.format('14,606원')).toBe('￦ 14,606 (KRW)');
        expect(PriceFormatter.format('14606 원')).toBe('￦ 14,606 (KRW)');
        expect(PriceFormatter.format('￦ 14606')).toBe('￦ 14,606 (KRW)');
        expect(PriceFormatter.format('14606 KRW')).toBe('￦ 14,606 (KRW)');
        expect(PriceFormatter.format('14606')).toBe('￦ 14,606 (KRW)'); // default
    });

    it('should format USD prices correctly', () => {
        expect(PriceFormatter.format('$14.6')).toBe('$ 14.60 (USD)');
        expect(PriceFormatter.format('14.6 달러')).toBe('$ 14.60 (USD)');
        expect(PriceFormatter.format('14.60 USD')).toBe('$ 14.60 (USD)');
    });

    it('should format JPY prices correctly', () => {
        expect(PriceFormatter.format('¥1500')).toBe('¥ 1,500 (JPY)');
        expect(PriceFormatter.format('1500 엔')).toBe('¥ 1,500 (JPY)');
    });

    it('should format EUR prices correctly', () => {
        expect(PriceFormatter.format('€ 15.12')).toBe('€ 15.12 (EUR)');
        expect(PriceFormatter.format('15.12 유로')).toBe('€ 15.12 (EUR)');
    });

    it('should handle free/zero gracefully', () => {
        expect(PriceFormatter.format('무료')).toBe('무료');
        expect(PriceFormatter.format('0원')).toBe('￦ 0 (KRW)');
    });

    it('should handle unparseable text by returning it as is or empty', () => {
        expect(PriceFormatter.format('가격 정보 없음')).toBe('가격 정보 없음');
        expect(PriceFormatter.format('')).toBe('');
    });
});
