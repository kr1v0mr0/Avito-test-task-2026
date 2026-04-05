import { z } from 'zod';
import type { ItemDetail } from '../types/item';

const autoParamsSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.coerce.number().int().optional(),
  transmission: z.enum(['automatic', 'manual']).optional(),
  mileage: z.coerce.number().optional(),
  enginePower: z.coerce.number().optional(),
});

const realEstateParamsSchema = z.object({
  type: z.enum(['flat', 'house', 'room']).optional(),
  address: z.string().optional(),
  area: z.coerce.number().optional(),
  floor: z.coerce.number().optional(),
});

const electronicsParamsSchema = z.object({
  type: z.enum(['phone', 'laptop', 'misc']).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.enum(['new', 'used']).optional(),
  color: z.string().optional(),
});

const base = {
  title: z.string().min(1, 'Введите название'),
  price: z.coerce.number().min(0, 'Цена не может быть отрицательной'),
  description: z.string().optional(),
};

export const itemFormSchema = z.discriminatedUnion('category', [
  z.object({
    ...base,
    category: z.literal('auto'),
    params: autoParamsSchema,
  }),
  z.object({
    ...base,
    category: z.literal('real_estate'),
    params: realEstateParamsSchema,
  }),
  z.object({
    ...base,
    category: z.literal('electronics'),
    params: electronicsParamsSchema,
  }),
]);

export type ItemFormValues = z.infer<typeof itemFormSchema>;

export function itemToFormValues(item: ItemDetail): ItemFormValues {
  const price = item.price ?? 0;
  if (item.category === 'auto') {
    return {
      category: 'auto',
      title: item.title,
      price,
      description: item.description ?? '',
      params: { ...item.params },
    };
  }
  if (item.category === 'real_estate') {
    return {
      category: 'real_estate',
      title: item.title,
      price,
      description: item.description ?? '',
      params: { ...item.params },
    };
  }
  return {
    category: 'electronics',
    title: item.title,
    price,
    description: item.description ?? '',
    params: { ...item.params },
  };
}

/** Убираем пустые строки и приводим числа — иначе zod на сервере отдаёт 400 (partial() всё ещё валидирует переданные поля). */
function sanitizeParamsForApi(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const numericKeys = new Set([
    'yearOfManufacture',
    'mileage',
    'enginePower',
    'area',
    'floor',
  ]);
  const out: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(params)) {
    if (raw === null || raw === undefined) continue;
    if (typeof raw === 'string' && raw.trim() === '') continue;

    if (numericKeys.has(key)) {
      const n = typeof raw === 'number' ? raw : Number(raw);
      if (!Number.isFinite(n)) continue;
      out[key] = key === 'mileage' || key === 'area' ? n : Math.trunc(n);
      continue;
    }

    out[key] = raw;
  }

  return out;
}

export function formValuesToPutBody(values: ItemFormValues): unknown {
  const price = Number.isFinite(values.price) ? values.price : 0;
  const params = sanitizeParamsForApi(values.params as Record<string, unknown>);

  return {
    category: values.category,
    title: values.title.trim(),
    price,
    description: values.description?.trim() ? values.description : undefined,
    params,
  };
}
