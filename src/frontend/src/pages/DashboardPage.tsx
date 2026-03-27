import { Skeleton } from "@/components/ui/skeleton";
import { Activity, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Variant_buy_sell } from "../backend";
import { useApp } from "../contexts/AppContext";
import { useHoldings, usePrices, useTransactions } from "../hooks/useQueries";
import {
  COIN_COLORS,
  FALLBACK_PRICES,
  formatCurrency,
  formatDate,
  formatPct,
  generate30DayHistory,
  get24hChangeForSymbol,
  getPriceForSymbol,
} from "../lib/crypto";

const DEMO_HOLDINGS = [
  {
    id: 1n,
    symbol: "BTC",
    name: "Bitcoin",
    quantity: 0.45,
    costBasis: 58000,
    walletAddressLabel: "Main Wallet",
    createdAt: 0n,
    updatedAt: 0n,
  },
  {
    id: 2n,
    symbol: "ETH",
    name: "Ethereum",
    quantity: 3.2,
    costBasis: 2800,
    walletAddressLabel: "DeFi Wallet",
    createdAt: 0n,
    updatedAt: 0n,
  },
  {
    id: 3n,
    symbol: "SOL",
    name: "Solana",
    quantity: 12,
    costBasis: 145,
    walletAddressLabel: "Hot Wallet",
    createdAt: 0n,
    updatedAt: 0n,
  },
  {
    id: 4n,
    symbol: "BNB",
    name: "BNB",
    quantity: 5,
    costBasis: 380,
    walletAddressLabel: "Exchange",
    createdAt: 0n,
    updatedAt: 0n,
  },
];

const DEMO_TRANSACTIONS = [
  {
    id: 1n,
    symbol: "BTC",
    transactionType: Variant_buy_sell.buy,
    quantity: 0.1,
    priceAtTime: 65000,
    totalValue: 6500,
    date: BigInt(Date.now() - 2 * 86400000) * 1000000n,
    notes: "DCA buy",
  },
  {
    id: 2n,
    symbol: "ETH",
    transactionType: Variant_buy_sell.buy,
    quantity: 0.5,
    priceAtTime: 3400,
    totalValue: 1700,
    date: BigInt(Date.now() - 5 * 86400000) * 1000000n,
    notes: "",
  },
  {
    id: 3n,
    symbol: "SOL",
    transactionType: Variant_buy_sell.sell,
    quantity: 2,
    priceAtTime: 170,
    totalValue: 340,
    date: BigInt(Date.now() - 7 * 86400000) * 1000000n,
    notes: "Take profit",
  },
  {
    id: 4n,
    symbol: "BTC",
    transactionType: Variant_buy_sell.buy,
    quantity: 0.05,
    priceAtTime: 62000,
    totalValue: 3100,
    date: BigInt(Date.now() - 14 * 86400000) * 1000000n,
    notes: "",
  },
  {
    id: 5n,
    symbol: "BNB",
    transactionType: Variant_buy_sell.buy,
    quantity: 2,
    priceAtTime: 390,
    totalValue: 780,
    date: BigInt(Date.now() - 20 * 86400000) * 1000000n,
    notes: "",
  },
];

function KPICard({
  title,
  value,
  sub,
  positive,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  return (
    <div className="card-glow rounded-2xl p-5 border border-border shadow-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">
          {title}
        </span>
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-9 w-36 mb-1" />
      ) : (
        <p className="text-3xl font-display font-bold text-foreground tracking-tight">
          {value}
        </p>
      )}
      {sub && (
        <p
          className={`text-sm mt-1 font-medium ${positive ? "positive" : positive === false ? "negative" : "text-muted-foreground"}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function DashboardPage() {
  const { userProfile, navigate } = useApp();
  const { data: holdingsData, isLoading: holdingsLoading } = useHoldings();
  const { data: txData, isLoading: txLoading } = useTransactions();
  const { data: pricesData } = usePrices();

  const prices =
    pricesData && Object.keys(pricesData).length > 0
      ? pricesData
      : FALLBACK_PRICES;
  const holdings =
    holdingsData && holdingsData.length > 0 ? holdingsData : DEMO_HOLDINGS;
  const transactions = txData && txData.length > 0 ? txData : DEMO_TRANSACTIONS;
  const isDemo = !holdingsData || holdingsData.length === 0;

  const { totalValue, totalPnl, pnlPct } = useMemo(() => {
    let val = 0;
    let cost = 0;
    for (const h of holdings) {
      const price = getPriceForSymbol(prices, h.symbol);
      val += price * h.quantity;
      cost += h.costBasis * h.quantity;
    }
    const pnl = val - cost;
    const pct = cost > 0 ? (pnl / cost) * 100 : 0;
    return { totalValue: val, totalPnl: pnl, pnlPct: pct };
  }, [holdings, prices]);

  const btcPrice = prices.bitcoin?.usd ?? 0;
  const btcChange = prices.bitcoin?.usd_24h_change ?? 0;
  const ethPrice = prices.ethereum?.usd ?? 0;
  const ethChange = prices.ethereum?.usd_24h_change ?? 0;

  const chartData = useMemo(
    () => generate30DayHistory(totalValue),
    [totalValue],
  );

  const allocationData = useMemo(() => {
    return holdings
      .map((h) => ({
        name: h.symbol,
        value: getPriceForSymbol(prices, h.symbol) * h.quantity,
        color: COIN_COLORS[h.symbol] ?? "#20C9A6",
      }))
      .filter((d) => d.value > 0);
  }, [holdings, prices]);

  const recentTx = [...transactions]
    .sort((a, b) => Number(b.date - a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      {isDemo && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
          <Activity className="w-4 h-4 shrink-0" />
          <span>
            Viewing sample portfolio data —{" "}
            <button
              type="button"
              onClick={() => navigate("portfolio")}
              className="underline font-medium"
            >
              add your first holding
            </button>{" "}
            to get started.
          </span>
        </div>
      )}

      {/* Greeting */}
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">
          Welcome back,{" "}
          <span className="text-teal">{userProfile?.name || "Trader"}</span>!
        </h2>
        <p className="text-muted-foreground mt-1">
          Here's your portfolio overview for today.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 card-glow rounded-2xl p-6 border border-border shadow-card">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            Total Portfolio Value
          </p>
          {holdingsLoading ? (
            <Skeleton className="h-12 w-48 mb-2" />
          ) : (
            <p
              className="text-5xl font-display font-bold text-foreground tracking-tight"
              data-ocid="dashboard.portfolio_value.card"
            >
              {formatCurrency(totalValue)}
            </p>
          )}
          <p
            className={`text-sm mt-2 font-medium ${totalPnl >= 0 ? "positive" : "negative"}`}
          >
            {totalPnl >= 0 ? (
              <TrendingUp className="inline w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="inline w-4 h-4 mr-1" />
            )}
            {formatCurrency(Math.abs(totalPnl))} ({formatPct(pnlPct)}) all time
          </p>
        </div>

        <KPICard
          title="BTC Price"
          value={formatCurrency(btcPrice)}
          sub={formatPct(btcChange)}
          positive={btcChange >= 0}
          icon={TrendingUp}
          loading={holdingsLoading}
        />
        <KPICard
          title="ETH Price"
          value={formatCurrency(ethPrice)}
          sub={formatPct(ethChange)}
          positive={ethChange >= 0}
          icon={DollarSign}
          loading={holdingsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Performance Chart */}
        <div
          className="lg:col-span-3 card-glow rounded-2xl p-5 border border-border shadow-card"
          data-ocid="dashboard.performance.card"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            Portfolio Performance
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20C9A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#20C9A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: "#9AA6B2", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: "#9AA6B2", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "#1B2230",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  color: "#F1F5F9",
                  fontSize: 12,
                }}
                formatter={(v: number) => [formatCurrency(v), "Value"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#20C9A6"
                strokeWidth={2}
                fill="url(#perfGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#20C9A6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Chart */}
        <div
          className="lg:col-span-2 card-glow rounded-2xl p-5 border border-border shadow-card"
          data-ocid="dashboard.allocation.card"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            Asset Allocation
          </h3>
          {allocationData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1B2230",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12,
                      color: "#F1F5F9",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [formatCurrency(v), "Value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {allocationData.slice(0, 4).map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: d.color }}
                      />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="text-foreground font-medium">
                      {totalValue > 0
                        ? `${((d.value / totalValue) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
              No holdings
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="card-glow rounded-2xl border border-border shadow-card"
        data-ocid="dashboard.transactions.card"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Recent Transactions
          </h3>
          <button
            type="button"
            onClick={() => navigate("transactions")}
            data-ocid="dashboard.view_all_transactions.link"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all
          </button>
        </div>
        {txLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="dashboard.transactions.table">
              <thead>
                <tr className="border-b border-border">
                  {["Asset", "Type", "Quantity", "Price", "Total", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx, i) => (
                  <motion.tr
                    key={String(tx.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`dashboard.transactions.item.${i + 1}`}
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">
                      {tx.symbol}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                          tx.transactionType === Variant_buy_sell.buy
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {tx.transactionType === Variant_buy_sell.buy
                          ? "BUY"
                          : "SELL"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground font-mono">
                      {tx.quantity}
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground font-mono">
                      {formatCurrency(tx.priceAtTime)}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground font-mono">
                      {formatCurrency(tx.totalValue)}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>
                  </motion.tr>
                ))}
                {recentTx.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-sm text-muted-foreground"
                      data-ocid="dashboard.transactions.empty_state"
                    >
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
