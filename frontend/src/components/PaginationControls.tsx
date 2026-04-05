import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Props = {
  page: number;
  pageCount: number;
  onPageChange: (p: number) => void;
};

export function PaginationControls({ page, pageCount, onPageChange }: Props) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ py: 2 }}>
      <IconButton aria-label="Назад" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="body2">
        Страница {page} из {Math.max(pageCount, 1)}
      </Typography>
      <IconButton aria-label="Вперёд" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
}
