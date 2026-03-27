import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Wallet } from "lucide-react";
import { useMemo } from "react";
import { useHoldings, usePrices } from "../hooks/useQueries";
import {
  COIN_COLORS,
  FALLBACK_PRICES,
  formatCurrency,
  getPriceForSymbol,
} from "../lib/crypto";

export function WalletsPage() {
  const { data: holdings = [], isLoading } = useHoldings();
  const { data: pricesData } = usePrices();
  const prices =
    pricesData && Object.keys(pricesData).length > 0
      ? pricesData
      : FALLBACK_PRICES;

  const walletGroups = useMemo(() => {
    const groups: Record<string, typeof holdings> = {};
    for (const h of holdings) {
      const label = h.walletAddressLabel || "Unlabeled";
      if (!groups[label]) groups[label] = [];
      groups[label].push(h);
    }
    return Object.entries(groups);
  }, [holdings]);

  return (
    <div className="space-y-6 max-w-4xl" data-ocid="wallets.page">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Wallets
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Read-only view of wallet labels linked to your holdings.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="wallets.loading_state">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : walletGroups.length === 0 ? (
        <div
          className="card-glow rounded-2xl border border-border p-16 text-center"
          data-ocid="wallets.empty_state"
        >
          <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No wallet labels found.
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Add holdings with wallet labels to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-ocid="wallets.list">
          {walletGroups.map(([label, items], wi) => {
            const totalValue = items.reduce(
              (sum, h) =>
                sum + getPriceForSymbol(prices, h.symbol) * h.quantity,
              0,
            );
            return (
              <div
                key={label}
                className="card-glow rounded-2xl border border-border shadow-card"
                data-ocid={`wallets.wallet.item.${wi + 1}`}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {items.length} asset{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-base font-display font-bold text-foreground">
                    {formatCurrency(totalValue)}
                  </p>
                </div>
                <div className="p-4 grid gap-3">
                  {items.map((h) => {
                    const price = getPriceForSymbol(prices, h.symbol);
                    const val = price * h.quantity;
                    return (
                      <div
                        key={String(h.id)}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              background: COIN_COLORS[h.symbol] ?? "#20C9A6",
                            }}
                          />
                          <span className="text-sm font-semibold text-foreground">
                            {h.symbol}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {h.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-semibold text-foreground">
                            {formatCurrency(val)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {h.quantity} {h.symbol}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card-glow rounded-2xl border border-border p-5">
        <div className="flex items-start gap-3">
          <ExternalLink className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Blockchain Explorer
            </p>
            <p className="text-xs text-muted-foreground">
              Wallet balances shown here are read-only labels from your
              holdings. For live on-chain balances, use a block explorer like{" "}
              <a
                href="https://blockchair.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Blockchair
              </a>{" "}
              or{" "}
              <a
                href="https://etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Etherscan
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
