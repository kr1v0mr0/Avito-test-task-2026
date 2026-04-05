import { describe, expect, it } from 'vitest';
import { buildItemsQuery } from './items';

describe('buildItemsQuery', () => {
  it('includes search and pagination', () => {
    expect(
      buildItemsQuery({
        q: 'телефон',
        limit: 10,
        skip: 20,
        sortColumn: 'createdAt',
        sortDirection: 'desc',
      }),
    ).toEqual({
      q: 'телефон',
      limit: 10,
      skip: 20,
      sortColumn: 'createdAt',
      sortDirection: 'desc',
    });
  });

  it('serializes categories and needsRevision', () => {
    expect(
      buildItemsQuery({
        categories: ['electronics', 'auto'],
        needsRevision: true,
      }),
    ).toEqual({
      categories: 'electronics,auto',
      needsRevision: 'true',
    });
  });
});
