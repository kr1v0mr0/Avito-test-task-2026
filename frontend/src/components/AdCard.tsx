import PlaceholderOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import type { Category } from '../types/item';
import { CATEGORY_LABELS } from '../helpers/categories';
import { formatPriceRub } from '../helpers/format';

const categoryAccent: Record<Category, string> = {
  electronics: '#2563eb',
  real_estate: '#c026d3',
  auto: '#ea580c',
};

type Props = {
  id: number;
  category: Category;
  title: string;
  price: number | null;
  needsRevision: boolean;
  layout: 'grid' | 'list';
};

export function AdCard({ id, category, title, price, needsRevision, layout }: Props) {
  const navigate = useNavigate();
  const accent = categoryAccent[category];

  return (
    <Card variant="outlined" sx={{ height: layout === 'grid' ? '100%' : 'auto' }}>
      <CardActionArea
        onClick={() => navigate(`/ads/${id}`)}
        sx={{
          height: '100%',
          alignItems: 'stretch',
          display: layout === 'list' ? 'flex' : 'block',
          flexDirection: layout === 'list' ? 'row' : 'column',
        }}
      >
        <Box
          sx={{
            bgcolor: `${accent}14`,
            minHeight: layout === 'list' ? 160 : 160,
            width: layout === 'list' ? 220 : '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <PlaceholderOutlinedIcon sx={{ fontSize: 48, color: `${accent}99` }} />
        </Box>
        <CardContent sx={{ flex: 1 }}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={CATEGORY_LABELS[category]} sx={{ fontWeight: 600 }} />
              {needsRevision && (
                <Chip size="small" color="warning" label="Требует доработок" />
              )}
            </Stack>
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="h6" color="primary.main">
              {formatPriceRub(price)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
