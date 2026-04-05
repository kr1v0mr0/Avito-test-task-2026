import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { diffWords } from 'diff';

type Props = {
  before: string;
  after: string;
};

export function DiffView({ before, after }: Props) {
  const parts = diffWords(before, after);

  const left = parts.filter((p) => !p.added);
  const right = parts.filter((p) => !p.removed);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
      }}
    >
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Было
        </Typography>
        <Typography component="div" variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {left.map((part, i) => (
            <span
              key={i}
              style={{
                backgroundColor: part.removed ? 'rgba(211, 47, 47, 0.15)' : undefined,
                textDecoration: part.removed ? 'line-through' : undefined,
              }}
            >
              {part.value}
            </span>
          ))}
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Стало
        </Typography>
        <Typography component="div" variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {right.map((part, i) => (
            <span
              key={i}
              style={{
                backgroundColor: part.added ? 'rgba(46, 125, 50, 0.18)' : undefined,
              }}
            >
              {part.value}
            </span>
          ))}
        </Typography>
      </Paper>
    </Box>
  );
}
