import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../contexts/AppContext";
import { usePlatformStats, useReferralLeaderboard } from "../hooks/useQueries";

export function AdminPage() {
  const { isAdmin, navigate } = useApp();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: leaderboard = [], isLoading: lbLoading } =
    useReferralLeaderboard();

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 text-center"
        data-ocid="admin.unauthorized.panel"
      >
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          You need admin privileges to view this page.
        </p>
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          data-ocid="admin.back.button"
          className="px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats ? Number(stats.totalUsers) : 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active Users",
      value: stats ? Number(stats.activeUsers) : 0,
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Suspended Users",
      value: stats ? Number(stats.suspendedUsers) : 0,
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      label: "Total Holdings",
      value: stats ? Number(stats.totalHoldings) : 0,
      icon: BarChart3,
      color: "text-chart-2",
    },
    {
      label: "Total Transactions",
      value: stats ? Number(stats.totalTransactions) : 0,
      icon: Activity,
      color: "text-chart-3",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl" data-ocid="admin.page">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Admin Panel
          </h2>
          <p className="text-muted-foreground text-xs">
            Platform management overview
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        data-ocid="admin.stats.panel"
      >
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-glow rounded-2xl border border-border p-5"
            data-ocid={`admin.stats.item.${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium">
                {label}
              </span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            {statsLoading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className={`text-3xl font-display font-bold ${color}`}>
                {value}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* User Visibility via Leaderboard */}
      <div className="card-glow rounded-2xl border border-border shadow-card">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            User Visibility
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Users visible via referral activity
          </p>
        </div>
        {lbLoading ? (
          <div className="p-5 space-y-3" data-ocid="admin.users.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            className="py-12 text-center"
            data-ocid="admin.users.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No user activity yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="admin.users.table">
              <thead>
                <tr className="border-b border-border">
                  {["Username", "Referrals", "Status"].map((h) => (
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
                {leaderboard.map((entry, i) => (
                  <tr
                    key={entry.username}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`admin.users.item.${i + 1}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {entry.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {entry.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground font-mono">
                      {Number(entry.referralCount)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
