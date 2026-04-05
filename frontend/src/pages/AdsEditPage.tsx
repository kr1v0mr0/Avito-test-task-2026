import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  buildListingContextForPrompt,
  ollamaChat,
  ollamaGenerate,
  type ChatMessage,
} from '../api/llm';
import axios from 'axios';
import { fetchItemById, updateItem } from '../api/items';
import { AIChat } from '../components/AIChat';
import { DiffView } from '../components/DiffView';
import { CATEGORY_LABELS } from '../helpers/categories';
import { clearDraft, loadDraft, saveDraft } from '../helpers/draftStorage';
import {
  formValuesToPutBody,
  itemToFormValues,
  itemFormSchema,
  type ItemFormValues,
} from '../schemas/itemForm';
import type { Category } from '../types/item';

function emptyParamsForCategory(c: Category): ItemFormValues['params'] {
  if (c === 'auto') return {};
  if (c === 'real_estate') return {};
  return {};
}

export function AdsEditPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [aiBusy, setAiBusy] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [suggestedDescription, setSuggestedDescription] = useState<string | null>(null);
  const [diffBefore, setDiffBefore] = useState<string | null>(null);
  const [marketPriceText, setMarketPriceText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState(false);
  const [hideDescriptionLabel, setHideDescriptionLabel] = useState(false);
  const [aiRunningMode, setAiRunningMode] = useState<'description' | 'price' | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const itemQuery = useQuery({
    queryKey: ['item', numericId],
    queryFn: ({ signal }) => fetchItemById(numericId, signal),
    enabled: Number.isFinite(numericId),
  });

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema) as Resolver<ItemFormValues>,
  });

  const { control, handleSubmit, reset, setValue, formState } = form;
  const category = useWatch({ control, name: 'category' });
  const description = useWatch({ control, name: 'description' }) ?? '';

  useEffect(() => {
    if (!itemQuery.data) return;
    const draft = loadDraft<ItemFormValues>(numericId);
    reset(draft ?? itemToFormValues(itemQuery.data));
    if (draft) setDraftNotice(true);
    setHideDescriptionLabel(false);
  }, [itemQuery.data, numericId, reset]);

  useEffect(() => {
    if (!description.trim()) setHideDescriptionLabel(false);
  }, [description]);

  const draftTimerRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const sub = form.watch((values) => {
      window.clearTimeout(draftTimerRef.current);
      draftTimerRef.current = window.setTimeout(() => {
        if (!Number.isFinite(numericId)) return;
        saveDraft(numericId, values as ItemFormValues);
      }, 500);
    });
    return () => {
      sub.unsubscribe();
      window.clearTimeout(draftTimerRef.current);
    };
  }, [form, numericId]);

  const saveMutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      try {
        await updateItem(numericId, formValuesToPutBody(values));
      } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          const data = e.response?.data as { error?: unknown; message?: string } | undefined;
          const err = data?.error ?? data?.message;
          const text =
            err == null
              ? e.message
              : typeof err === 'string'
                ? err
                : JSON.stringify(err);
          throw new Error(
            e.response?.status === 400
              ? `Сервер отклонил данные: ${text}`
              : `Ошибка сохранения (${e.response?.status ?? '—'}): ${text}`,
          );
        }
        throw e;
      }
    },
    onSuccess: async () => {
      clearDraft(numericId);
      await queryClient.invalidateQueries({ queryKey: ['item', numericId] });
      await queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate(`/ads/${numericId}`);
    },
  });

  const runAi = async (mode: 'description' | 'price') => {
    const values = form.getValues();
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setAiBusy(true);
    setAiRunningMode(mode);
    setAiError(null);
    try {
      const ctx = buildListingContextForPrompt({
        title: values.title,
        category: values.category,
        price: values.price,
        description: values.description,
        params: values.params as Record<string, unknown>,
      });
      if (mode === 'description') {
        const had = Boolean(values.description?.trim());
        const prompt = had
          ? `Улучши текст описания объявления для продажи на классифайде. Верни только текст описания без пояснений.\n\nКонтекст:\n${ctx}`
          : `Придумай продающее описание объявления на классифайде. Верни только текст описания без пояснений.\n\nКонтекст:\n${ctx}`;
        const text = await ollamaGenerate(prompt, { signal: ac.signal });
        setSuggestedDescription(text.trim());
        setDiffBefore(had ? (values.description ?? '') : '');
      } else {
        const prompt = `Оцени ориентировочную рыночную цену в рублях для товара ниже. Ответь кратко: одна фраза с диапазоном/оценкой и 1–2 предложениями обоснования.\n\n${ctx}`;
        const text = await ollamaGenerate(prompt, { signal: ac.signal });
        setMarketPriceText(text.trim());
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      console.error(e);
      setAiError(
        'Не удалось обратиться к AI. Проверьте, что Ollama запущена и модель скачана (ollama pull llama3).',
      );
    } finally {
      setAiBusy(false);
      setAiRunningMode(null);
    }
  };

  const sendChat = async (text: string) => {
    const values = form.getValues();
    const system = `Ты помощник продавца на классифайде. Отвечай кратко и по делу. Контекст объявления:\n${buildListingContextForPrompt({
      title: values.title,
      category: values.category,
      price: values.price,
      description: values.description,
      params: values.params as Record<string, unknown>,
    })}`;
    const next: ChatMessage[] = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(next);
    setChatBusy(true);
    try {
      const reply = await ollamaChat(
        [{ role: 'user', content: `${system}\n\nВопрос: ${text}` }],
        {},
      );
      setChatMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error(e);
      setChatMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Не удалось получить ответ. Проверьте, что Ollama запущена.' },
      ]);
    } finally {
      setChatBusy(false);
    }
  };

  if (!Number.isFinite(numericId)) {
    return <Alert severity="error">Некорректный идентификатор</Alert>;
  }

  if (itemQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (itemQuery.isError || !itemQuery.data) {
    return <Alert severity="error">Объявление не найдено.</Alert>;
  }

  const descLabel =
    description.trim().length > 0 ? 'Улучшить описание' : 'Придумать описание';

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        to={`/ads/${numericId}`}
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ alignSelf: 'flex-start' }}
      >
        Назад к объявлению
      </Button>

      {draftNotice && (
        <Alert
          severity="info"
          onClose={() => setDraftNotice(false)}
        >
          Восстановлен черновик из localStorage (на случай обновления страницы).
        </Alert>
      )}

      {aiError && (
        <Alert severity="error" onClose={() => setAiError(null)}>
          {aiError}
        </Alert>
      )}

      <Typography variant="h4">Редактирование</Typography>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
        <Card variant="outlined" sx={{ flex: 2, width: '100%' }}>
          <CardContent>
            <Stack
              spacing={2}
              component="form"
              onSubmit={handleSubmit((v: ItemFormValues) => saveMutation.mutate(v))}
            >
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Категория</InputLabel>
                    <Select
                      label="Категория"
                      value={field.value}
                      onChange={(e) => {
                        const c = e.target.value as Category;
                        field.onChange(c);
                        setValue('params', emptyParamsForCategory(c));
                      }}
                    >
                      {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                        <MenuItem key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Название"
                    required
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="price"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Цена, ₽"
                    type="number"
                    required
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              {category === 'auto' && (
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Автомобиль
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="params.brand"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Марка" fullWidth />
                      )}
                    />
                    <Controller
                      name="params.model"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Модель" fullWidth />
                      )}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="params.yearOfManufacture"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Год выпуска" type="number" fullWidth />
                      )}
                    />
                    <Controller
                      name="params.transmission"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Коробка</InputLabel>
                          <Select
                            label="Коробка"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                          >
                            <MenuItem value="">
                              <em>Не выбрано</em>
                            </MenuItem>
                            <MenuItem value="automatic">Автомат</MenuItem>
                            <MenuItem value="manual">Механика</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="params.mileage"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Пробег, км" type="number" fullWidth />
                      )}
                    />
                    <Controller
                      name="params.enginePower"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Мощность, л.с." type="number" fullWidth />
                      )}
                    />
                  </Stack>
                </Stack>
              )}

              {category === 'real_estate' && (
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Недвижимость
                  </Typography>
                  <Controller
                    name="params.type"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Тип</InputLabel>
                        <Select
                          label="Тип"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        >
                          <MenuItem value="">
                            <em>Не выбрано</em>
                          </MenuItem>
                          <MenuItem value="flat">Квартира</MenuItem>
                          <MenuItem value="house">Дом</MenuItem>
                          <MenuItem value="room">Комната</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Controller
                    name="params.address"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Адрес" fullWidth />
                    )}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="params.area"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Площадь, м²" type="number" fullWidth />
                      )}
                    />
                    <Controller
                      name="params.floor"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Этаж" type="number" fullWidth />
                      )}
                    />
                  </Stack>
                </Stack>
              )}

              {category === 'electronics' && (
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Электроника
                  </Typography>
                  <Controller
                    name="params.type"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Тип</InputLabel>
                        <Select
                          label="Тип"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        >
                          <MenuItem value="">
                            <em>Не выбрано</em>
                          </MenuItem>
                          <MenuItem value="phone">Телефон</MenuItem>
                          <MenuItem value="laptop">Ноутбук</MenuItem>
                          <MenuItem value="misc">Другое</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="params.brand"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Бренд" fullWidth />
                      )}
                    />
                    <Controller
                      name="params.model"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Модель" fullWidth />
                      )}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Controller
                      name="params.condition"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Состояние</InputLabel>
                          <Select
                            label="Состояние"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value || undefined)}
                          >
                            <MenuItem value="">
                              <em>Не выбрано</em>
                            </MenuItem>
                            <MenuItem value="new">Новое</MenuItem>
                            <MenuItem value="used">Б/у</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                    <Controller
                      name="params.color"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Цвет" fullWidth />
                      )}
                    />
                  </Stack>
                </Stack>
              )}

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={hideDescriptionLabel ? undefined : 'Описание'}
                    fullWidth
                    multiline
                    minRows={5}
                    helperText={`${field.value?.length ?? 0} символов`}
                  />
                )}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={
                    aiBusy && aiRunningMode === 'description' ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <AutoAwesomeOutlinedIcon />
                    )
                  }
                  disabled={aiBusy}
                  onClick={() => runAi('description')}
                >
                  {descLabel}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={
                    aiBusy && aiRunningMode === 'price' ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SavingsOutlinedIcon />
                    )
                  }
                  disabled={aiBusy}
                  onClick={() => runAi('price')}
                >
                  Узнать рыночную цену
                </Button>
              </Stack>

              {aiBusy && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ color: 'text.secondary' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">
                    {aiRunningMode === 'price'
                      ? 'Оцениваем рыночную цену…'
                      : 'Генерируем описание…'}
                  </Typography>
                </Stack>
              )}

              {suggestedDescription && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Предложение AI
                  </Typography>
                  {diffBefore !== null && diffBefore.length > 0 && (
                    <DiffView before={diffBefore} after={suggestedDescription} />
                  )}
                  <TextField value={suggestedDescription} multiline minRows={4} fullWidth />
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => {
                      setValue('description', suggestedDescription, { shouldDirty: true });
                      setSuggestedDescription(null);
                      setDiffBefore(null);
                      setHideDescriptionLabel(true);
                    }}
                  >
                    Применить к описанию
                  </Button>
                </Stack>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button type="submit" variant="contained" disabled={saveMutation.isPending}>
                  Сохранить
                </Button>
                <Button
                  type="button"
                  component={RouterLink}
                  to={`/ads/${numericId}`}
                  variant="outlined"
                >
                  Отменить
                </Button>
              </Stack>

              {Object.keys(formState.errors).length > 0 && (
                <Alert severity="error">Проверьте поля формы.</Alert>
              )}

              {saveMutation.isError && (
                <Alert severity="error">
                  {saveMutation.error instanceof Error
                    ? saveMutation.error.message
                    : 'Не удалось сохранить.'}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2} sx={{ width: '100%', flex: 1 }}>
          <AIChat messages={chatMessages} onSend={sendChat} disabled={chatBusy} waitingForReply={chatBusy} />
        </Stack>
      </Stack>

      <Dialog open={Boolean(marketPriceText)} onClose={() => setMarketPriceText(null)} fullWidth>
        <DialogTitle>Рыночная цена (оценка AI)</DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{marketPriceText}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarketPriceText(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
