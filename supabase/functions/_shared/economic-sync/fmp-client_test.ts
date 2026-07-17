import { FmpEconomicCalendarClient, FmpClientError } from "./fmp-client.ts";

Deno.test("retries a rate-limited FMP request and returns a validated array", async () => {
  let attempts = 0;
  let slept = 0;
  const client = new FmpEconomicCalendarClient({
    apiKey: "test-key",
    fetchFn: async (input, init) => {
      attempts += 1;
      if (new Headers(init?.headers).get("apikey") !== "test-key")
        throw new Error("FMP key header missing");
      if (!String(input).includes("from=2026-07-01") || !String(input).includes("to=2026-07-31"))
        throw new Error("date range missing");
      return attempts === 1
        ? new Response("rate limited", { status: 429, headers: { "retry-after": "0" } })
        : Response.json([]);
    },
    sleep: async () => {
      slept += 1;
    },
  });

  const records = await client.fetchCalendar(
    new Date("2026-07-01T00:00:00Z"),
    new Date("2026-07-31T00:00:00Z"),
  );
  if (attempts !== 2 || slept !== 1 || records.length !== 0)
    throw new Error("rate-limit retry did not behave as expected");
});

Deno.test("rejects a non-array FMP response", async () => {
  const client = new FmpEconomicCalendarClient({
    apiKey: "test-key",
    fetchFn: async () => Response.json({ error: "unexpected response" }),
  });
  try {
    await client.fetchCalendar(new Date("2026-07-01T00:00:00Z"), new Date("2026-07-31T00:00:00Z"));
    throw new Error("expected FMP response validation to fail");
  } catch (error) {
    if (!(error instanceof FmpClientError)) throw error;
  }
});
