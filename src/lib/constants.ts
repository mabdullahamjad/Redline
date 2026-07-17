export const CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const IMPACT_LEVELS = [
  { value: "high", label: "High", description: "Market-moving releases" },
  { value: "medium", label: "Medium", description: "Notable data prints" },
  { value: "low", label: "Low", description: "Background context" },
] as const;

export type ImpactLevel = (typeof IMPACT_LEVELS)[number]["value"];

export const NOTIFICATION_TIMES = [
  { value: 24, label: "24 Hours Before" },
  { value: 12, label: "12 Hours Before" },
  { value: 1, label: "1 Hour Before" },
] as const;

export type NotificationTime = (typeof NOTIFICATION_TIMES)[number]["value"];
