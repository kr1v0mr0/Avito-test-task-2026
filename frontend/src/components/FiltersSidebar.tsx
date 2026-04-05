import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import type { Category } from '../types/item';
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../helpers/categories';

type Props = {
  selectedCategories: Category[];
  onToggleCategory: (c: Category) => void;
  onlyNeedsRevision: boolean;
  onOnlyNeedsRevision: (v: boolean) => void;
  onReset: () => void;
};

export function FiltersSidebar({
  selectedCategories,
  onToggleCategory,
  onlyNeedsRevision,
  onOnlyNeedsRevision,
  onReset,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, position: 'sticky', top: 96 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Фильтры
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Категория
      </Typography>
      <FormGroup>
        {ALL_CATEGORIES.map((c) => (
          <FormControlLabel
            key={c}
            control={
              <Checkbox
                checked={selectedCategories.includes(c)}
                onChange={() => onToggleCategory(c)}
              />
            }
            label={CATEGORY_LABELS[c]}
          />
        ))}
      </FormGroup>
      <Divider sx={{ my: 2 }} />
      <FormControlLabel
        control={
          <Switch
            checked={onlyNeedsRevision}
            onChange={(_, v) => onOnlyNeedsRevision(v)}
          />
        }
        label="Только требующие доработок"
      />
      <Stack sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={onReset}>
          Сбросить фильтры
        </Button>
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Если категории не выбраны, показываются все категории.
        </Typography>
      </Box>
    </Paper>
  );
}
