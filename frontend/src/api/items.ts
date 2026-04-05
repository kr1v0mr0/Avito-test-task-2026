import type { ItemDetail, ItemsListResponse, SortColumn, SortDirection } from '../types/item';
import type { Category } from '../types/item';
import { api } from './axios';

export type ListItemsParams = {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: Category[];
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
  signal?: AbortSignal;
};

export function buildItemsQuery(
  params: ListItemsParams,
): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (params.q !== undefined) q.q = params.q;
  if (params.limit !== undefined) q.limit = params.limit;
  if (params.skip !== undefined) q.skip = params.skip;
  if (params.needsRevision) q.needsRevision = 'true';
  if (params.categories?.length) q.categories = params.categories.join(',');
  if (params.sortColumn) q.sortColumn = params.sortColumn;
  if (params.sortDirection) q.sortDirection = params.sortDirection;
  return q;
}

export async function fetchItemsList(params: ListItemsParams): Promise<ItemsListResponse> {
  const { data } = await api.get<ItemsListResponse>('/items', {
    params: buildItemsQuery(params),
    signal: params.signal,
  });
  return data;
}

export async function fetchItemById(
  id: number,
  signal?: AbortSignal,
): Promise<ItemDetail> {
  const { data } = await api.get<ItemDetail>(`/items/${id}`, { signal });
  return data;
}

export async function updateItem(
  id: number,
  body: unknown,
  signal?: AbortSignal,
): Promise<void> {
  await api.put(`/items/${id}`, body, { signal });
}
