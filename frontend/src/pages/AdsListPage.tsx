import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { fetchItemsList } from '../api/items';
import { AdCard } from '../components/AdCard';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { PaginationControls } from '../components/PaginationControls';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useUiStore } from '../store/uiStore';
import type { Category, SortColumn, SortDirection } from '../types/item';

const PAGE_SIZE = 10;

type SortPreset = 'newest' | 'price_asc' | 'price_desc' | 'title_asc';

function presetToSort(preset: SortPreset): { sortColumn: SortColumn; sortDirection: SortDirection } {
  switch (preset) {
    case 'newest':
      return { sortColumn: 'createdAt', sortDirection: 'desc' };
    case 'price_asc':
      return { sortColumn: 'price', sortDirection: 'asc' };
    case 'price_desc':
      return { sortColumn: 'price', sortDirection: 'desc' };
    case 'title_asc':
      return { sortColumn: 'title', sortDirection: 'asc' };
  }
}

export function AdsListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [onlyNeedsRevision, setOnlyNeedsRevision] = useState(false);
  const [sortPreset, setSortPreset] = useState<SortPreset>('newest');
  const [page, setPage] = useState(1);

  const adsLayout = useUiStore((s) => s.adsLayout);
  const setAdsLayout = useUiStore((s) => s.setAdsLayout);

  const { sortColumn, sortDirection } = useMemo(
    () => presetToSort(sortPreset),
    [sortPreset],
  );

  const categoriesForQuery = selectedCategories.length ? selectedCategories : undefined;

  const categoriesKey = useMemo(
    () => [...selectedCategories].sort().join(','),
    [selectedCategories],
  );

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        q: debouncedSearch,
        nr: onlyNeedsRevision,
        sort: sortPreset,
        cat: categoriesKey,
      }),
    [debouncedSearch, onlyNeedsRevision, sortPreset, categoriesKey],
  );

  useEffect(() => {
    // Сброс страницы при изменении фильтров (ожидаемое поведение пагинации)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- синхронизация пагинации с фильтрами
    setPage(1);
  }, [filterKey]);

  const query = useQuery({
    queryKey: [
      'items',
      {
        q: debouncedSearch,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        categories: categoriesForQuery,
        needsRevision: onlyNeedsRevision,
        sortColumn,
        sortDirection,
      },
    ],
    queryFn: ({ signal }) =>
      fetchItemsList({
        q: debouncedSearch,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        categories: categoriesForQuery,
        needsRevision: onlyNeedsRevision,
        sortColumn,
        sortDirection,
        signal,
      }),
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleToggleCategory = (c: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setOnlyNeedsRevision(false);
    setSearch('');
    setSortPreset('newest');
    setPage(1);
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Мои объявления</Typography>
        <Typography variant="body1" color="text.secondary">
          Всего объявлений: {query.isLoading ? '…' : total}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <TextField
          fullWidth
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 240 }}>
          <Select
            value={sortPreset}
            onChange={(e) => setSortPreset(e.target.value as SortPreset)}
          >
            <MenuItem value="newest">По новизне</MenuItem>
            <MenuItem value="price_asc">По цене (возрастание)</MenuItem>
            <MenuItem value="price_desc">По цене (убывание)</MenuItem>
            <MenuItem value="title_asc">По названию (А→Я)</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={adsLayout}
          exclusive
          onChange={(_, v) => v && setAdsLayout(v)}
          aria-label="вид списка"
        >
          <ToggleButton value="grid" aria-label="сетка">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="список">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <FiltersSidebar
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            onlyNeedsRevision={onlyNeedsRevision}
            onOnlyNeedsRevision={setOnlyNeedsRevision}
            onReset={handleResetFilters}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          {query.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          )}
          {query.isError && (
            <Alert severity="error">
              Не удалось загрузить объявления. Проверьте, что backend запущен на порту 8080.
            </Alert>
          )}
          {query.isSuccess && (
            <>
              {query.data.items.length === 0 ? (
                <Alert severity="info">Ничего не найдено — измените фильтры или поиск.</Alert>
              ) : adsLayout === 'grid' ? (
                <Grid container spacing={2}>
                  {query.data.items.map((item) => (
                    <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <AdCard {...item} layout="grid" />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Stack spacing={2}>
                  {query.data.items.map((item) => (
                    <AdCard key={item.id} {...item} layout="list" />
                  ))}
                </Stack>
              )}
              <PaginationControls
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
