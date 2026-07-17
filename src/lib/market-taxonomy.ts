export const MARKET_CATEGORIES = ["forex", "crypto", "metals", "indices"] as const;
export type MarketCategory = (typeof MARKET_CATEGORIES)[number];

export const MARKET_LABELS: Record<MarketCategory, string> = {
  forex: "Forex",
  crypto: "Crypto",
  metals: "Metals",
  indices: "Indices",
};

export const MARKET_ASSETS: Record<MarketCategory, readonly { code: string; label: string }[]> = {
  forex: [
    { code: "USD", label: "USD" },
    { code: "EUR", label: "EUR" },
    { code: "GBP", label: "GBP" },
    { code: "JPY", label: "JPY" },
    { code: "AUD", label: "AUD" },
    { code: "CAD", label: "CAD" },
    { code: "CHF", label: "CHF" },
    { code: "NZD", label: "NZD" },
    { code: "CNY", label: "CNY" },
  ],
  crypto: [
    { code: "BTC", label: "Bitcoin (BTC)" },
    { code: "ETH", label: "Ethereum (ETH)" },
  ],
  metals: [
    { code: "XAU", label: "Gold (XAU)" },
    { code: "XAG", label: "Silver (XAG)" },
  ],
  indices: [],
};

export function assetsForMarket(market: MarketCategory) {
  return MARKET_ASSETS[market];
}
