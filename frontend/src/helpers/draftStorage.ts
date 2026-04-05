const prefix = 'ad-draft-';

export function draftStorageKey(id: number): string {
  return `${prefix}${id}`;
}

export function loadDraft<T>(id: number): T | null {
  try {
    const raw = localStorage.getItem(draftStorageKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveDraft<T>(id: number, data: T): void {
  localStorage.setItem(draftStorageKey(id), JSON.stringify(data));
}

export function clearDraft(id: number): void {
  localStorage.removeItem(draftStorageKey(id));
}
