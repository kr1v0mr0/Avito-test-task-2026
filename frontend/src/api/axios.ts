import axios from 'axios';

function apiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) return fromEnv;
  // В dev ходим на Vite, он проксирует на Fastify — без cross-origin и без CORS
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') return '/backend';
  return 'http://localhost:8080';
}

export const api = axios.create({
  baseURL: apiBaseUrl(),
});
