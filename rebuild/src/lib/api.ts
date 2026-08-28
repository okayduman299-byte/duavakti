const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRetryable(error: unknown): boolean {
  return error instanceof ApiError && (
    error.status === 408 ||
    error.status === 425 ||
    error.status === 429 ||
    (typeof error.status === 'number' && error.status >= 500) ||
    error.status == null
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new ApiError(`Sunucu ${response.status} hatası verdi.`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('İstek zaman aşımına uğradı.');
    }
    throw new ApiError('İnternet bağlantısı kurulamadı.');
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await requestJson(url, timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt >= MAX_RETRIES || !isRetryable(error)) break;
      await sleep(RETRY_DELAYS_MS[attempt] ?? 4000);
    }
  }

  throw lastError instanceof Error ? lastError : new ApiError('Vakit servisine ulaşılamadı.');
}
