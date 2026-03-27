import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Loader2, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_buy_sell } from "../backend";
import {
  useAddTransaction,
  useDeleteTransaction,
  useTransactions,
} from "../hooks/useQueries";
import { formatCurrency, formatDate } from "../lib/crypto";

const SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "ADA", "XRP", "DOT", "DOGE"];
const TABLE_HEADERS = [
  "Asset",
  "Type",
  "Quantity",
  "Price",
  "Total Value",
  "Notes",
  "Date",
  "",
];

type TxForm = {
  symbol: string;
  transactionType: Variant_buy_sell;
  quantity: string;
  priceAtTime: string;
  notes: string;
};

const emptyForm = (): TxForm => ({
  symbol: "BTC",
  transactionType: Variant_buy_sell.buy,
  quantity: "",
  priceAtTime: "",
  notes: "",
});

export function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const addTx = useAddTransaction();
  const deleteTx = useDeleteTransaction();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TxForm>(emptyForm());
  const [filterType, setFilterType] = useState<"all" | Variant_buy_sell>("all");
  const [filterSymbol, setFilterSymbol] = useState("all");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [txPwdPrompt, setTxPwdPrompt] = useState(false);

  const filtered = transactions
    .filter((tx) => filterType === "all" || tx.transactionType === filterType)
    .filter((tx) => filterSymbol === "all" || tx.symbol === filterSymbol)
    .sort((a, b) => Number(b.date - a.date));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number.parseFloat(form.quantity);
    const price = Number.parseFloat(form.priceAtTime);
    if (Number.isNaN(qty) || qty <= 0 || Number.isNaN(price) || price <= 0) {
      toast.error("Please enter valid quantity and price");
      return;
    }
    try {
      await addTx.mutateAsync({
        symbol: form.symbol,
        transactionType: form.transactionType,
        quantity: qty,
        priceAtTime: price,
        totalValue: qty * price,
        notes: form.notes,
      });
      toast.success("Transaction recorded");
      setShowModal(false);
      setForm(emptyForm());
    } catch {
      toast.error("Failed to add transaction");
    }
  }

  function requestDelete(id: bigint) {
    setDeleteId(id);
    setTxPwdPrompt(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteTx.mutateAsync(deleteId);
      toast.success("Transaction deleted");
      setTxPwdPrompt(false);
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete transaction");
    }
  }

  return (
    <div className="space-y-6 max-w-7xl" data-ocid="transactions.page">
      <div className="card-glow rounded-2xl border border-border shadow-card">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            Transactions
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filters */}
            <div className="flex items-center gap-1.5 bg-muted/20 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as typeof filterType)
                }
                data-ocid="transactions.type.select"
                className="bg-transparent text-sm text-foreground focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value={Variant_buy_sell.buy}>Buy</option>
                <option value={Variant_buy_sell.sell}>Sell</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/20 rounded-xl px-3 py-1.5">
              <select
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                data-ocid="transactions.symbol.select"
                className="bg-transparent text-sm text-foreground focus:outline-none"
              >
                <option value="all">All Assets</option>
                {SYMBOLS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm());
                setShowModal(true);
              }}
              data-ocid="transactions.add.button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="p-5 space-y-3" data-ocid="transactions.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="py-16 text-center"
            data-ocid="transactions.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No transactions found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="transactions.table">
              <thead>
                <tr className="border-b border-border">
                  {TABLE_HEADERS.map((h) => (
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
                {filtered.map((tx, i) => (
                  <motion.tr
                    key={String(tx.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`transactions.item.${i + 1}`}
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
                    <td className="px-5 py-3 text-sm font-mono text-foreground">
                      {tx.quantity}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono text-foreground">
                      {formatCurrency(tx.priceAtTime)}
                    </td>
                    <td className="px-5 py-3 text-sm font-mono font-semibold text-foreground">
                      {formatCurrency(tx.totalValue)}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground max-w-[140px] truncate">
                      {tx.notes || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => requestDelete(tx.id)}
                        data-ocid={`transactions.delete_button.${i + 1}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-muted/30 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
            data-ocid="transactions.add.modal"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="card-glow w-full max-w-md rounded-2xl border border-border shadow-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">
                  Add Transaction
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  data-ocid="transactions.add.close_button"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted/30 text-muted-foreground hover:text-foreground transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="tx-symbol"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Symbol
                    </label>
                    <select
                      id="tx-symbol"
                      value={form.symbol}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, symbol: e.target.value }))
                      }
                      data-ocid="transactions.add.symbol.select"
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      {SYMBOLS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="tx-type"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Type
                    </label>
                    <select
                      id="tx-type"
                      value={form.transactionType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          transactionType: e.target.value as Variant_buy_sell,
                        }))
                      }
                      data-ocid="transactions.add.type.select"
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    >
                      <option value={Variant_buy_sell.buy}>Buy</option>
                      <option value={Variant_buy_sell.sell}>Sell</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="tx-qty"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Quantity
                    </label>
                    <input
                      id="tx-qty"
                      type="number"
                      step="any"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                      placeholder="0.00"
                      data-ocid="transactions.add.quantity.input"
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tx-price"
                      className="text-sm font-medium text-foreground mb-1.5 block"
                    >
                      Price (USD)
                    </label>
                    <input
                      id="tx-price"
                      type="number"
                      step="any"
                      value={form.priceAtTime}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, priceAtTime: e.target.value }))
                      }
                      placeholder="0.00"
                      data-ocid="transactions.add.price.input"
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="tx-notes"
                    className="text-sm font-medium text-foreground mb-1.5 block"
                  >
                    Notes (optional)
                  </label>
                  <input
                    id="tx-notes"
                    type="text"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="e.g. DCA purchase"
                    data-ocid="transactions.add.notes.input"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    data-ocid="transactions.add.cancel_button"
                    className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/30 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addTx.isPending}
                    data-ocid="transactions.add.submit_button"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    {addTx.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Record
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {txPwdPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
            data-ocid="transactions.delete.dialog"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="card-glow w-full max-w-sm rounded-2xl border border-border shadow-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Delete Transaction
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTxPwdPrompt(false)}
                  data-ocid="transactions.delete.cancel_button"
                  className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/30 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleteTx.isPending}
                  data-ocid="transactions.delete.confirm_button"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/80 text-destructive-foreground text-sm font-semibold hover:bg-destructive transition-all disabled:opacity-60"
                >
                  {deleteTx.isPending ? (
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
