import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdsLayoutMode = 'grid' | 'list';

type UiState = {
  adsLayout: AdsLayoutMode;
  setAdsLayout: (mode: AdsLayoutMode) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      adsLayout: 'grid',
      setAdsLayout: (adsLayout) => set({ adsLayout }),
    }),
    { name: 'seller-cabinet-ui' },
  ),
);
