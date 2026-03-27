import { AlertCircle, Check, Key, Loader2, Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile } from "../hooks/useQueries";

export function ProfilePage() {
  const { identity } = useInternetIdentity();
  const {
    userProfile,
    userRole,
    isAdmin,
    setUserProfile,
    transactionPassword,
    setTransactionPassword,
  } = useApp();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState(userProfile?.name ?? "");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  useEffect(() => {
    setName(userProfile?.name ?? "");
  }, [userProfile]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync(name.trim());
      setUserProfile({ name: name.trim() });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  function handleSetTxPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess(false);
    if (newPwd.length < 4) {
      setPwdError("Password must be at least 4 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match");
      return;
    }
    setTransactionPassword(newPwd);
    setPwdSuccess(true);
    setNewPwd("");
    setConfirmPwd("");
    toast.success("Transaction password set");
  }

  const principalStr =
    identity?.getPrincipal().toString() ?? "Not authenticated";

  return (
    <div className="space-y-6 max-w-2xl" data-ocid="profile.page">
      {/* Profile Info */}
      <div className="card-glow rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              data-ocid="profile.name.input"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={saveProfile.isPending || !name.trim()}
            data-ocid="profile.save.button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/15 text-primary text-sm font-semibold hover:bg-primary/25 transition-all disabled:opacity-60"
          >
            {saveProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Name
          </button>
        </form>
      </div>

      {/* Transaction Password */}
      <div className="card-glow rounded-2xl border border-border shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
            <Key className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Transaction Password
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Required before deleting holdings or transactions
            </p>
          </div>
        </div>

        {transactionPassword && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
            <Check className="w-4 h-4 shrink-0" />
            Transaction password is set
          </div>
        )}

        <form onSubmit={handleSetTxPassword} className="space-y-4">
          <div>
            <label
              htmlFor="tx-new-pwd"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              New Password
            </label>
            <input
              id="tx-new-pwd"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="Min 4 characters"
              data-ocid="profile.txpassword.input"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div>
            <label
              htmlFor="tx-confirm-pwd"
              className="text-sm font-medium text-foreground mb-1.5 block"
            >
              Confirm Password
            </label>
            <input
              id="tx-confirm-pwd"
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Repeat password"
              data-ocid="profile.txpassword_confirm.input"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          {pwdError && (
            <div
              className="flex items-center gap-2 text-destructive text-sm"
              data-ocid="profile.txpassword.error_state"
            >
              <AlertCircle className="w-4 h-4" />
              {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div
              className="flex items-center gap-2 text-success text-sm"
              data-ocid="profile.txpassword.success_state"
            >
              <Check className="w-4 h-4" />
              Password updated successfully
            </div>
          )}
          <button
            type="submit"
            data-ocid="profile.txpassword.save_button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-warning/15 text-warning text-sm font-semibold hover:bg-warning/25 transition-all"
          >
            <Key className="w-4 h-4" />
            {transactionPassword ? "Update Password" : "Set Password"}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card-glow rounded-2xl border border-border shadow-card p-6"
        data-ocid="profile.account.panel"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-chart-2/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-chart-2" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Account Info
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Role</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isAdmin
                  ? "bg-warning/15 text-warning"
                  : "bg-primary/15 text-primary"
              }`}
            >
              {isAdmin ? "Administrator" : userRole}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Principal ID</p>
            <p className="text-sm font-mono text-foreground break-all bg-muted/20 px-3 py-2 rounded-xl">
              {principalStr}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
