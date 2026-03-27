import type { PriceData } from "../contexts/AppContext";

export const COIN_ID_TO_SYMBOL: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  binancecoin: "BNB",
  solana: "SOL",
  cardano: "ADA",
  ripple: "XRP",
  polkadot: "DOT",
  dogecoin: "DOGE",
};

export const SYMBOL_TO_COIN_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  ADA: "cardano",
  XRP: "ripple",
  DOT: "polkadot",
  DOGE: "dogecoin",
};

export const COIN_NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "BNB",
  SOL: "Solana",
  ADA: "Cardano",
  XRP: "XRP",
  DOT: "Polkadot",
  DOGE: "Dogecoin",
};

export const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  BNB: "#F3BA2F",
  SOL: "#9945FF",
  ADA: "#0033AD",
  XRP: "#00AAE4",
  DOT: "#E6007A",
  DOGE: "#C2A633",
};

// Fallback prices when backend is unavailable
export const FALLBACK_PRICES: PriceData = {
  bitcoin: { usd: 67_420, usd_24h_change: 2.4 },
  ethereum: { usd: 3_512, usd_24h_change: -0.8 },
  binancecoin: { usd: 412, usd_24h_change: 1.2 },
  solana: { usd: 178, usd_24h_change: 5.3 },
  cardano: { usd: 0.58, usd_24h_change: -1.5 },
  ripple: { usd: 0.62, usd_24h_change: 0.9 },
  polkadot: { usd: 8.9, usd_24h_change: -2.1 },
  dogecoin: { usd: 0.168, usd_24h_change: 3.7 },
};

export function getPriceForSymbol(prices: PriceData, symbol: string): number {
  const coinId = SYMBOL_TO_COIN_ID[symbol.toUpperCase()];
  if (!coinId) return 0;
  const entry = prices[coinId];
  return entry?.usd ?? 0;
}

export function get24hChangeForSymbol(
  prices: PriceData,
  symbol: string,
): number {
  const coinId = SYMBOL_TO_COIN_ID[symbol.toUpperCase()];
  if (!coinId) return 0;
  const entry = prices[coinId];
  return entry?.usd_24h_change ?? 0;
}

export function formatCurrency(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export function formatDate(nanos: bigint): string {
  const ms = Number(nanos / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generate30DayHistory(currentValue: number) {
  const data: { date: string; value: number }[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const dateMs = now - i * 24 * 60 * 60 * 1000;
    const progress = (29 - i) / 29;
    const trend = currentValue * (0.78 + progress * 0.22);
    const wave = trend * (1 + Math.sin(i * 0.7) * 0.04);
    data.push({
      date: new Date(dateMs).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: Math.max(0, wave),
    });
  }
  return data;
}

export function getReferralCode(principalStr: string): string {
  const clean = principalStr.replace(/-/g, "");
  return clean.slice(-8).toUpperCase();
}
