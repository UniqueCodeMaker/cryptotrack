import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit2,
  Loader2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { HoldingDTO } from "../backend";
import {
  useAddHolding,
  useHoldings,
  usePrices,
  useRemoveHolding,
  useUpdateHolding,
} from "../hooks/useQueries";
import {
  COIN_NAMES,
  FALLBACK_PRICES,
  formatCurrency,
  formatPct,
  getPriceForSymbol,
} from "../lib/crypto";

const SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "ADA", "XRP", "DOT", "DOGE"];

type HoldingForm = {
  symbol: string;
  name: string;
  quantity: string;
  costBasis: string;
  walletAddressLabel: string;
};

const emptyForm = (): HoldingForm => ({
  symbol: "BTC",
  name: "Bitcoin",
  quantity: "",
  costBasis: "",
  walletAddressLabel: "",
});

export function PortfolioPage() {
  const { data: holdings = [], isLoading } = useHoldings();
  const { data: pricesData } = usePrices();
  const addHolding = useAddHolding();
  const updateHolding = useUpdateHolding();
  const removeHolding = useRemoveHolding();

  const prices =
    pricesData && Object.keys(pricesData).length > 0
      ? pricesData
      : FALLBACK_PRICES;

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<HoldingDTO | null>(null);
  const [form, setForm] = useState<HoldingForm>(emptyForm());
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [txPwdPrompt, setTxPwdPrompt] = useState(false);
  const [txPwdInput, setTxPwdInput] = useState("");

  function openAdd() {
    setForm(emptyForm());
    setEditTarget(null);
    setShowModal(true);
  }

  function openEdit(h: HoldingDTO) {
    setForm({
      symbol: h.symbol,
      name: h.name,
      quantity: String(h.quantity),
      costBasis: String(h.costBasis),
      walletAddressLabel: h.walletAddressLabel,
    });
    setEditTarget(h);
    setShowModal(true);
  }

  function handleSymbolChange(sym: string) {
    setForm((f) => ({ ...f, symbol: sym, name: COIN_NAMES[sym] ?? sym }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number.parseFloat(form.quantity);
    const cost = Number.parseFloat(form.costBasis);
    if (Number.isNaN(qty) || qty <= 0 || Number.isNaN(cost) || cost <= 0) {
      toast.error("Please enter valid quantity and cost basis");
      return;
    }
    try {
      if (editTarget) {
        await updateHolding.mutateAsync({
          id: editTarget.id,
          symbol: form.symbol,
          name: form.name,
          quantity: qty,
          costBasis: cost,
          walletAddressLabel: form.walletAddressLabel,
        });
        toast.success("Holding updated");
      } else {
        await addHolding.mutateAsync({
          symbol: form.symbol,
          name: form.name,
          quantity: qty,
          costBasis: cost,
          walletAddressLabel: form.walletAddressLabel,
        });
        toast.success("Holding added");
      }
      setShowModal(false);
    } catch {
      toast.error("Failed to save holding");
    }
  }

  function requestDelete(id: bigint) {
    setDeleteId(id);
    setTxPwdPrompt(true);
    setTxPwdInput("");
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await removeHolding.mutateAsync(deleteId);
      toast.success("Holding removed");
      setTxPwdPrompt(false);
      setDeleteId(null);
    } catch {
      toast.error("Failed to remove holding");
    }
  }

  const { totalValue, totalCost, totalPnl } = useMemo(() => {
    let val = 0;
    let cost = 0;
    for (const h of holdings) {
      val += getPriceForSymbol(prices, h.symbol) * h.quantity;
      cost += h.costBasis * h.quantity;
    }
    return { totalValue: val, totalCost: cost, totalPnl: val - cost };
  }, [holdings, prices]);

  const isPending = addHolding.isPending || updateHolding.isPending;

  return (
    <div className="space-y-6 max-w-7xl" data-ocid="portfolio.page">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Value",
            value: formatCurrency(totalValue),
            highlight: true,
          },
          {
            label: "Total Cost",
            value: formatCurrency(totalCost),
            highlight: false,
          },
          {
            label: "Total P&L",
            value: `${formatCurrency(Math.abs(totalPnl))} (${formatPct(totalCost > 0 ? (totalPnl / totalCost) * 100 : 0)})`,
            positive: totalPnl >= 0,
          },
        ].map(({ label, value, highlight, positive }) => (
          <div
            key={label}
            className="card-glow rounded-2xl p-5 border border-border"
          >
            <p className="text-xs text-muted-foreground font-medium mb-1">
              {label}
            </p>
            <p
              className={`text-2xl font-display font-bold ${
                positive === true
                  ? "positive"
                  : positive === false
                    ? "negative"
                    : highlight
                      ? "text-primary"
                      : "text-foreground"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Holdings Table */}
      <div className="card-glow rounded-2xl border border-border shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">Holdings</h3>
          <button
            type="button"
            onClick={openAdd}
            data-ocid="portfolio.add.button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Holding
          </button>
        </div>

        {isLoading ? (
          <div
            className="p-5 space-y-3"
            data-ocid="portfolio.holdings.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : holdings.length === 0 ? (
          <div
            className="py-16 text-center"
            data-ocid="portfolio.holdings.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No holdings yet — add your first asset to get started.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 text-primary text-sm font-medium hover:underline"
            >
              + Add your first holding
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="portfolio.holdings.table">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Asset",
                    "Quantity",
                    "Cost Basis",
                    "Current Price",
                    "Current Value",
                    "P&L",
                    "Wallet",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => {
                  const price = getPriceForSymbol(prices, h.symbol);
                  const currentValue = price * h.quantity;
                  const costTotal = h.costBasis * h.quantity;
                  const pnl = currentValue - costTotal;
                  const pnlPct = costTotal > 0 ? (pnl / costTotal) * 100 : 0;
                  return (
                    <motion.tr
                      key={String(h.id)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-ocid={`portfolio.holdings.item.${i + 1}`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                            {h.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {h.symbol}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {h.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-foreground">
                        {h.quantity}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-foreground">
                        {formatCurrency(h.costBasis)}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono text-foreground">
                        {formatCurrency(price)}
                      </td>
                      <td className="px-5 py-3 text-sm font-mono font-semibold text-foreground">
                        {formatCurrency(currentValue)}
                      </td>
                      <td className="px-5 py-3">
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${pnl >= 0 ? "positive" : "negative"}`}
                        >
                          {pnl >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {formatCurrency(Math.abs(pnl))} ({formatPct(pnlPct)})
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-[120px] truncate">
                        {h.walletAddressLabel || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(h)}
                            data-ocid={`portfolio.holdings.edit_button.${i + 1}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDelete(h.id)}
                            data-ocid={`portfolio.holdings.delete_button.${i + 1}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/30 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
            data-ocid="portfolio.holding.modal"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card-glow w-full max-w-md rounded-2xl border border-border shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">
                  {editTarget ? "Edit Holding" : "Add Holding"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  data-ocid="portfolio.holding.close_button"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="holding-symbol"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Symbol
                  </label>
                  <select
                    id="holding-symbol"
                    value={form.symbol}
                    onChange={(e) => handleSymbolChange(e.target.value)}
                    data-ocid="portfolio.holding.symbol.select"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    {SYMBOLS.map((s) => (
                      <option key={s} value={s}>
                        {s} — {COIN_NAMES[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="holding-qty"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Quantity
                    </label>
                    <input
                      id="holding-qty"
                      type="number"
                      step="any"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                      placeholder="0.00"
                      data-ocid="portfolio.holding.quantity.input"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="holding-cost"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Cost Basis (USD)
                    </label>
                    <input
                      id="holding-cost"
                      type="number"
                      step="any"
                      value={form.costBasis}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, costBasis: e.target.value }))
                      }
                      placeholder="0.00"
                      data-ocid="portfolio.holding.cost_basis.input"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="holding-wallet"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Wallet Label
                  </label>
                  <input
                    id="holding-wallet"
                    type="text"
                    value={form.walletAddressLabel}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        walletAddressLabel: e.target.value,
                      }))
                    }
                    placeholder="e.g. Ledger Cold Wallet"
                    data-ocid="portfolio.holding.wallet_label.input"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    data-ocid="portfolio.holding.cancel_button"
                    className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/30 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    data-ocid="portfolio.holding.save_button"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    {editTarget ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {txPwdPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
            data-ocid="portfolio.delete.dialog"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="card-glow w-full max-w-sm rounded-2xl border border-border shadow-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Confirm Delete
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your transaction password to confirm deletion.
              </p>
              <input
                type="password"
                value={txPwdInput}
                onChange={(e) => setTxPwdInput(e.target.value)}
                placeholder="Transaction password"
                data-ocid="portfolio.delete.password.input"
                className="w-full px-4 py-2.5 mb-4 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTxPwdPrompt(false)}
                  data-ocid="portfolio.delete.cancel_button"
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={removeHolding.isPending}
                  data-ocid="portfolio.delete.confirm_button"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/80 text-destructive-foreground text-sm font-semibold hover:bg-destructive transition-all disabled:opacity-60"
                >
                  {removeHolding.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
