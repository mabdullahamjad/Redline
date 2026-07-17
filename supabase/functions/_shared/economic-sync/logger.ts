import type { StructuredLogger } from "./types.ts";

function write(
  level: "info" | "warn" | "error",
  event: string,
  fields: Record<string, unknown> = {},
) {
  console[level](
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "economic-event-sync",
      level,
      event,
      ...fields,
    }),
  );
}

export const logger: StructuredLogger = {
  info: (event, fields) => write("info", event, fields),
  warn: (event, fields) => write("warn", event, fields),
  error: (event, fields) => write("error", event, fields),
};
