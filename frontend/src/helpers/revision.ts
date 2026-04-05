import type { ItemDetail } from '../types/item';

export function getRevisionHints(item: ItemDetail): string[] {
  const hints: string[] = [];
  if (!item.description?.trim()) {
    hints.push('Описание');
  }

  if (item.category === 'auto') {
    const p = item.params;
    if (!p.brand?.trim()) hints.push('Марка');
    if (!p.model?.trim()) hints.push('Модель');
    if (p.yearOfManufacture == null) hints.push('Год выпуска');
    if (!p.transmission) hints.push('Коробка передач');
    if (p.mileage == null) hints.push('Пробег');
    if (p.enginePower == null) hints.push('Мощность двигателя');
  } else if (item.category === 'real_estate') {
    const p = item.params;
    if (!p.type) hints.push('Тип жилья');
    if (!p.address?.trim()) hints.push('Адрес');
    if (p.area == null) hints.push('Площадь');
    if (p.floor == null) hints.push('Этаж');
  } else {
    const p = item.params;
    if (!p.type) hints.push('Тип техники');
    if (!p.brand?.trim()) hints.push('Бренд');
    if (!p.model?.trim()) hints.push('Модель');
    if (!p.condition) hints.push('Состояние');
    if (!p.color?.trim()) hints.push('Цвет');
  }

  return hints;
}
