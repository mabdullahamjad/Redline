import type { FmpEconomicCalendarRecord } from "./types.ts";

const FMP_ECONOMIC_CALENDAR_URL = "https://financialmodelingprep.com/stable/economic-calendar";
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 12_000;

export class FmpClientError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
    readonly status?: number,
  ) {
    super(message);
    this.name = "FmpClientError";
  }
}

export interface FmpClientOptions {
  apiKey: string;
  fetchFn?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEconomicCalendarPayload(value: unknown): value is FmpEconomicCalendarRecord[] {
  return Array.isArray(value) && value.every(isRecord);
}

function retryDelay(response: Response | undefined, attempt: number): number {
  const retryAfter = response?.headers.get("retry-after");
  const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1_000, 30_000);
  }
  return Math.min(500 * 2 ** attempt + Math.floor(Math.random() * 250), 5_000);
}

function defaultSleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export class FmpEconomicCalendarClient {
  private readonly fetchFn: typeof fetch;
  private readonly sleep: (milliseconds: number) => Promise<void>;

  constructor(private readonly options: FmpClientOptions) {
    if (!options.apiKey.trim()) throw new Error("FMP_API_KEY is required");
    this.fetchFn = options.fetchFn ?? fetch;
    this.sleep = options.sleep ?? defaultSleep;
  }

  async fetchCalendar(from: Date, to: Date): Promise<FmpEconomicCalendarRecord[]> {
    const url = new URL(FMP_ECONOMIC_CALENDAR_URL);
    url.searchParams.set("from", from.toISOString().slice(0, 10));
    url.searchParams.set("to", to.toISOString().slice(0, 10));

    let lastError: FmpClientError | undefined;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let response: Response | undefined;

      try {
        response = await this.fetchFn(url, {
          headers: { apikey: this.options.apiKey, accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          const retryable =
            response.status === 408 || response.status === 429 || response.status >= 500;
          lastError = new FmpClientError(
            `FMP request failed with HTTP ${response.status}`,
            retryable,
            response.status,
          );
          if (!retryable || attempt === MAX_ATTEMPTS - 1) throw lastError;
        } else {
          let payload: unknown;
          try {
            payload = await response.json();
          } catch {
            throw new FmpClientError("FMP returned invalid JSON", false, response.status);
          }
          if (!isEconomicCalendarPayload(payload)) {
            throw new FmpClientError(
              "FMP response is not an economic-calendar array",
              false,
              response.status,
            );
          }
          return payload;
        }
      } catch (error) {
        if (error instanceof FmpClientError) {
          lastError = error;
          if (!error.retryable || attempt === MAX_ATTEMPTS - 1) throw error;
        } else {
          const message =
            error instanceof DOMException && error.name === "AbortError"
              ? "FMP request timed out"
              : "FMP network request failed";
          lastError = new FmpClientError(message, true);
          if (attempt === MAX_ATTEMPTS - 1) throw lastError;
        }
      } finally {
        clearTimeout(timeout);
      }

      await this.sleep(retryDelay(response, attempt));
    }
    throw lastError ?? new FmpClientError("FMP request failed", true);
  }
}
