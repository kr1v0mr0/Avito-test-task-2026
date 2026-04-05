export type Category = 'auto' | 'real_estate' | 'electronics';

export type ItemListEntry = {
  id: number;
  category: Category;
  title: string;
  price: number | null;
  needsRevision: boolean;
};

export type ItemsListResponse = {
  items: ItemListEntry[];
  total: number;
};

export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: 'automatic' | 'manual';
  mileage?: number;
  enginePower?: number;
};

export type RealEstateItemParams = {
  type?: 'flat' | 'house' | 'room';
  address?: string;
  area?: number;
  floor?: number;
};

export type ElectronicsItemParams = {
  type?: 'phone' | 'laptop' | 'misc';
  brand?: string;
  model?: string;
  condition?: 'new' | 'used';
  color?: string;
};

export type ItemDetail =
  | (BaseItemFields & { category: 'auto'; params: AutoItemParams })
  | (BaseItemFields & { category: 'real_estate'; params: RealEstateItemParams })
  | (BaseItemFields & { category: 'electronics'; params: ElectronicsItemParams });

type BaseItemFields = {
  id: number;
  title: string;
  description?: string;
  price: number | null;
  createdAt: string;
  updatedAt: string;
  needsRevision: boolean;
};

export type SortColumn = 'title' | 'createdAt' | 'price';
export type SortDirection = 'asc' | 'desc';
