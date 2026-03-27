import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useReferralLeaderboard, useReferralStats } from "../hooks/useQueries";
import { getReferralCode } from "../lib/crypto";

export function ReferralsPage() {
  const { identity } = useInternetIdentity();
  const { data: stats, isLoading: statsLoading } = useReferralStats();
  const { data: leaderboard = [], isLoading: lbLoading } =
    useReferralLeaderboard();
  const [copied, setCopied] = useState(false);

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const referralCode = principalStr
    ? getReferralCode(principalStr)
    : "XXXXXXXX";
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const myRank =
    leaderboard.findIndex((e) => getReferralCode(e.username) === referralCode) +
    1;

  return (
    <div className="space-y-6 max-w-4xl" data-ocid="referrals.page">
      {/* Referral Link Card */}
      <div className="card-glow rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Your Referral Link
            </h2>
            <p className="text-xs text-muted-foreground">
              Share this link to invite friends
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1.5">Referral Code</p>
          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <span className="text-lg font-mono font-bold text-primary tracking-widest">
              {referralCode}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Shareable Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground font-mono truncate">
              {referralLink}
            </div>
            <button
              type="button"
              onClick={copyLink}
              data-ocid="referrals.copy.button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-all shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-glow rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            Total Referrals
          </p>
          {statsLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <p
              className="text-4xl font-display font-bold text-primary"
              data-ocid="referrals.stats.card"
            >
              {stats ? Number(stats.referralCount) : 0}
            </p>
          )}
        </div>
        <div className="card-glow rounded-2xl border border-border p-5">
          <p className="text-xs text-muted-foreground font-medium mb-2">
            Your Rank
          </p>
          <p className="text-4xl font-display font-bold text-foreground">
            {myRank > 0 ? `#${myRank}` : "—"}
          </p>
        </div>
      </div>

      {/* Referred Users */}
      {stats && stats.referredUsers.length > 0 && (
        <div className="card-glow rounded-2xl border border-border shadow-card">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-foreground">
              Referred Users
            </h3>
          </div>
          <div className="p-4 space-y-2" data-ocid="referrals.referred.list">
            {stats.referredUsers.map((username, i) => (
              <div
                key={username}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20"
                data-ocid={`referrals.referred.item.${i + 1}`}
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {username.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm text-foreground font-medium">
                  {username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card-glow rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Trophy className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Referral Leaderboard
          </h3>
        </div>
        {lbLoading ? (
          <div
            className="p-5 space-y-3"
            data-ocid="referrals.leaderboard.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div
            className="py-12 text-center"
            data-ocid="referrals.leaderboard.empty_state"
          >
            <p className="text-muted-foreground text-sm">
              No referrals recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-ocid="referrals.leaderboard.table">
              <thead>
                <tr className="border-b border-border">
                  {["Rank", "Username", "Referrals"].map((h) => (
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
                  <motion.tr
                    key={entry.username}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`referrals.leaderboard.item.${i + 1}`}
                  >
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          i === 0
                            ? "bg-warning/20 text-warning"
                            : i === 1
                              ? "bg-muted/40 text-foreground"
                              : i === 2
                                ? "bg-chart-3/20 text-chart-3"
                                : "bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground">
                      {entry.username}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/15 text-primary text-sm font-semibold">
                        {Number(entry.referralCount)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
