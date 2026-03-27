import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function RegisterPage() {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { actor } = useActor();
  const { navigate, setUserProfile } = useApp();

  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Display name is required");
      return;
    }
    if (!identity || !actor) {
      login();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await actor.saveCallerUserProfile({ name: name.trim() });
      setUserProfile({ name: name.trim() });
      navigate("dashboard");
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
        data-ocid="register.modal"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 teal-glow mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            CryptoTrack
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create your account
          </p>
        </div>

        <div className="card-glow rounded-2xl p-8 shadow-card border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Get Started
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {identity ? "Set up your profile" : "Connect your identity first"}
          </p>

          {error && (
            <div
              data-ocid="register.error_state"
              className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {!identity ? (
            <button
              type="button"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="register.connect.button"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all teal-glow"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Connecting...
                </>
              ) : (
                "Connect Internet Identity"
              )}
            </button>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="reg-name"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Display Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Trader"
                  data-ocid="register.name.input"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-referral"
                  className="text-sm font-medium text-foreground mb-1.5 block"
                >
                  Referral Code{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="reg-referral"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code"
                  data-ocid="register.referral.input"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                data-ocid="register.submit_button"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all teal-glow disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => navigate("login")}
            data-ocid="register.login.link"
            className="w-full mt-4 py-3 px-4 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:text-foreground hover:border-primary/30 transition-all"
          >
            Already have an account? Sign in
          </button>
        </div>
      </motion.div>
    </div>
  );
}
