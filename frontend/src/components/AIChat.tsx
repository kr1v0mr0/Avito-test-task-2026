import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { ChatMessage } from '../api/llm';

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Показать индикатор ожидания ответа AI в области сообщений */
  waitingForReply?: boolean;
};

export function AIChat({ messages, onSend, disabled, waitingForReply }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText('');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Чат с AI
      </Typography>
      <Stack spacing={1} sx={{ maxHeight: 280, overflow: 'auto', mb: 1 }}>
        {messages.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Задайте вопрос об этом объявлении — контекст карточки передаётся автоматически.
          </Typography>
        )}
        {messages.map((m, i) => (
          <Box
            key={i}
            sx={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
              bgcolor: m.role === 'user' ? 'primary.main' : 'action.hover',
              color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
              px: 1.5,
              py: 1,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {m.content}
            </Typography>
          </Box>
        ))}
        {waitingForReply && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            alignSelf="flex-start"
            sx={{
              maxWidth: '92%',
              bgcolor: 'action.hover',
              color: 'text.secondary',
              px: 1.5,
              py: 1,
              borderRadius: 2,
            }}
          >
            <CircularProgress size={18} />
            <Typography variant="body2">AI отвечает…</Typography>
          </Stack>
        )}
      </Stack>
      <Stack direction="row" spacing={1} alignItems="flex-end">
        <TextField
          fullWidth
          multiline
          minRows={2}
          size="small"
          placeholder="Сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
        />
        <IconButton color="primary" onClick={submit} disabled={disabled || !text.trim()}>
          <SendIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}
