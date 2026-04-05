import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { fetchItemById } from '../api/items';
import { ItemParamsView } from '../components/ItemParamsView';
import { CATEGORY_LABELS } from '../helpers/categories';
import { formatDateRu, formatPriceRub } from '../helpers/format';
import { getRevisionHints } from '../helpers/revision';

const categoryAccent = {
  electronics: '#2563eb',
  real_estate: '#c026d3',
  auto: '#ea580c',
} as const;

export function AdsDetailPage() {
  const { id } = useParams();
  const numericId = Number(id);

  const query = useQuery({
    queryKey: ['item', numericId],
    queryFn: ({ signal }) => fetchItemById(numericId, signal),
    enabled: Number.isFinite(numericId),
  });

  if (!Number.isFinite(numericId)) {
    return <Alert severity="error">Некорректный идентификатор</Alert>;
  }

  if (query.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Alert severity="error">
        Объявление не найдено или сервер недоступен.
      </Alert>
    );
  }

  const item = query.data;
  const accent = categoryAccent[item.category];
  const hints = getRevisionHints(item);

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        to="/ads"
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        К списку объявлений
      </Button>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
          <Box
            sx={{
              bgcolor: `${accent}14`,
              minHeight: 260,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageOutlinedIcon sx={{ fontSize: 72, color: `${accent}99` }} />
          </Box>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, width: '100%' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={CATEGORY_LABELS[item.category]} />
                {item.needsRevision && (
                  <Chip color="warning" label="Требует доработок" />
                )}
              </Stack>
              <Typography variant="h4">{item.title}</Typography>
              <Typography variant="h5" color="primary.main">
                {formatPriceRub(item.price)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Опубликовано: {formatDateRu(item.createdAt)}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to={`/ads/${item.id}/edit`}
                  variant="contained"
                  startIcon={<EditOutlinedIcon />}
                >
                  Редактировать
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Характеристики
          </Typography>
          <ItemParamsView item={item} />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Описание
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {item.description?.trim() ? item.description : '—'}
          </Typography>
        </CardContent>
      </Card>

      {hints.length > 0 && (
        <Alert severity="warning" variant="outlined">
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Требуются доработки
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Не заполнены поля:
          </Typography>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {hints.map((h) => (
              <Typography key={h} component="li" variant="body2">
                {h}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}

      <Divider />
    </Stack>
  );
}
