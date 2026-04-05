/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
  readonly VITE_OLLAMA_URL?: string;
  /** Сборка с nginx-прокси на `/ollama` (docker compose) */
  readonly VITE_OLLAMA_VIA_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
