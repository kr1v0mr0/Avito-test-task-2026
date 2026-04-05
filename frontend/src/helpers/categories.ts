import type { Category } from '../types/item';

export const CATEGORY_LABELS: Record<Category, string> = {
  auto: 'Транспорт',
  real_estate: 'Недвижимость',
  electronics: 'Электроника',
};

export const ALL_CATEGORIES: Category[] = ['electronics', 'real_estate', 'auto'];
