import { describe, expect, it } from 'vitest';
import { formatDateRu, formatPriceRub } from './format';

describe('formatPriceRub', () => {
  it('formats integer rub amounts', () => {
    expect(formatPriceRub(1200)).toMatch(/1\s?200/);
  });

  it('shows dash for null', () => {
    expect(formatPriceRub(null)).toBe('—');
  });
});

describe('formatDateRu', () => {
  it('formats ISO date', () => {
    expect(formatDateRu('2026-02-12T00:00:00.000Z')).toContain('2026');
  });
});
