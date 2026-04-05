import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ItemDetail } from '../types/item';

function Row({ label, value }: { label: string; value: string | number | undefined | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}

const transmissionLabel: Record<'automatic' | 'manual', string> = {
  automatic: 'Автомат',
  manual: 'Механика',
};

const reType: Record<'flat' | 'house' | 'room', string> = {
  flat: 'Квартира',
  house: 'Дом',
  room: 'Комната',
};

const elType: Record<'phone' | 'laptop' | 'misc', string> = {
  phone: 'Телефон',
  laptop: 'Ноутбук',
  misc: 'Другое',
};

const conditionLabel: Record<'new' | 'used', string> = {
  new: 'Новое',
  used: 'Б/у',
};

export function ItemParamsView({ item }: { item: ItemDetail }) {
  if (item.category === 'auto') {
    const p = item.params;
    return (
      <Stack spacing={1}>
        <Row label="Марка" value={p.brand} />
        <Row label="Модель" value={p.model} />
        <Row label="Год выпуска" value={p.yearOfManufacture} />
        <Row
          label="Коробка"
          value={p.transmission ? transmissionLabel[p.transmission] : undefined}
        />
        <Row label="Пробег, км" value={p.mileage} />
        <Row label="Мощность, л.с." value={p.enginePower} />
      </Stack>
    );
  }
  if (item.category === 'real_estate') {
    const p = item.params;
    return (
      <Stack spacing={1}>
        <Row label="Тип" value={p.type ? reType[p.type] : undefined} />
        <Row label="Адрес" value={p.address} />
        <Row label="Площадь, м²" value={p.area} />
        <Row label="Этаж" value={p.floor} />
      </Stack>
    );
  }
  const p = item.params;
  return (
    <Stack spacing={1}>
      <Row label="Тип" value={p.type ? elType[p.type] : undefined} />
      <Row label="Бренд" value={p.brand} />
      <Row label="Модель" value={p.model} />
      <Row label="Состояние" value={p.condition ? conditionLabel[p.condition] : undefined} />
      <Row label="Цвет" value={p.color} />
    </Stack>
  );
}
