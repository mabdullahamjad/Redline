export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ id: string }>;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

export class ResendProvider implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(message: EmailMessage): Promise<{ id: string }> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend request failed with HTTP ${response.status}`);
    }

    const body: unknown = await response.json();
    if (!body || typeof body !== "object" || typeof (body as { id?: unknown }).id !== "string") {
      throw new Error("Resend returned an invalid response");
    }

    return { id: (body as { id: string }).id };
  }
}

export function renderReminder(job: {
  title: string;
  country: string | null;
  currency: string;
  impact: string;
  event_time: string;
  market_assets: string[];
  reminder_interval_minutes: number;
}) {
  const interval =
    job.reminder_interval_minutes >= 60
      ? `${job.reminder_interval_minutes / 60} hour${job.reminder_interval_minutes === 60 ? "" : "s"}`
      : `${job.reminder_interval_minutes} minutes`;
  const time = new Date(job.event_time).toISOString().replace("T", " ").replace(".000Z", " UTC");
  const country = job.country ?? "—";
  const markets = job.market_assets.join(", ");
  const text = `REDLINE reminder\n\n${job.title}\nCountry: ${country}\nCurrency: ${job.currency}\nImpact: ${job.impact}\nMarket / asset: ${markets}\nEvent time: ${time}\nReminder: ${interval} before`;

  return {
    subject: `REDLINE: ${job.title} in ${interval}`,
    text,
    html: `<main><h1>REDLINE reminder</h1><p><strong>${escapeHtml(job.title)}</strong></p><p>Country: ${escapeHtml(country)}<br>Currency: ${escapeHtml(job.currency)}<br>Impact: ${escapeHtml(job.impact)}<br>Market / asset: ${escapeHtml(markets)}<br>Event time: ${escapeHtml(time)}<br>Reminder: ${escapeHtml(interval)} before</p></main>`,
  };
}
