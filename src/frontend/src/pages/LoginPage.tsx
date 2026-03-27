import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { navigate } = useApp();
  const [error, setError] = useState("");

  function handleLogin() {
    setError("");
    login();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
        data-ocid="login.modal"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 teal-glow mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            CryptoTrack
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your portfolio, your control
          </p>
        </div>

        {/* Card */}
        <div className="card-glow rounded-2xl p-8 shadow-card border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Sign In
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Connect securely using Internet Identity
          </p>

          {error && (
            <div
              data-ocid="login.error_state"
              className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all teal-glow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect with Internet Identity"
            )}
          </button>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => navigate("register")}
            data-ocid="login.register.link"
            className="w-full mt-4 py-3 px-4 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-card/80 hover:border-primary/30 transition-all"
          >
            Create New Account
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Secured by the Internet Computer blockchain
        </p>
      </motion.div>
    </div>
  );
}
