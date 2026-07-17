import { EventNormalizationError, normalizeEconomicEvent } from "./normalizer.ts";

Deno.test("normalizes a valid FMP calendar record to UTC with a stable identifier", async () => {
  const input = {
    date: "2026-07-16 08:30:00",
    country: "United States",
    event: "Consumer Price Index",
    currency: "usd",
    impact: "High",
    actual: null,
    previous: "2.4%",
    estimate: "2.5%",
  };
  const [first, second] = await Promise.all([
    normalizeEconomicEvent(input),
    normalizeEconomicEvent(input),
  ]);

  if (first.eventTime !== "2026-07-16T08:30:00.000Z")
    throw new Error("event time was not normalized to UTC");
  if (first.providerEventId !== second.providerEventId)
    throw new Error("provider identifier is not deterministic");
  if (first.currency !== "USD" || first.forecast !== "2.5%")
    throw new Error("calendar fields were not normalized");
});

Deno.test("rejects malformed records before they reach the database", async () => {
  await Promise.resolve(
    normalizeEconomicEvent({ event: "CPI", country: "US", currency: "USD", impact: "high" }),
  )
    .then(() => {
      throw new Error("expected normalization to fail");
    })
    .catch((error) => {
      if (!(error instanceof EventNormalizationError)) throw error;
    });
});
