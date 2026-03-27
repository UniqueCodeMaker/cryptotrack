import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { type Page, useApp } from "../contexts/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_ITEMS: {
  page: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { page: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { page: "portfolio", label: "Portfolio", icon: BarChart3 },
  { page: "wallets", label: "Wallets", icon: Wallet },
  { page: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { page: "referrals", label: "Referrals", icon: Users },
];

export function Sidebar() {
  const { currentPage, navigate, userProfile, isAdmin } = useApp();
  const { clear, identity } = useInternetIdentity();

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const initials = userProfile?.name
    ? userProfile.name.slice(0, 2).toUpperCase()
    : principalStr.slice(0, 2).toUpperCase();

  function handleLogout() {
    clear();
    navigate("login");
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sidebar-gradient fixed left-0 top-0 h-full w-64 flex flex-col z-40 border-r border-sidebar-border"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center teal-glow">
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <span className="font-display font-bold text-lg text-foreground tracking-tight">
          CryptoTrack
        </span>
      </div>

      {/* User Profile Block */}
      <button
        type="button"
        className="flex items-center gap-3 px-4 py-4 mx-3 mt-4 rounded-xl bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors text-left"
        onClick={() => navigate("profile")}
        data-ocid="sidebar.profile.button"
      >
        <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {userProfile?.name || "Anonymous"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {isAdmin ? "Administrator" : "Member"}
          </p>
        </div>
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1" data-ocid="sidebar.nav.panel">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              type="button"
              onClick={() => navigate(page)}
              data-ocid={`sidebar.${page}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/40"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}

        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate("admin")}
            data-ocid="sidebar.admin.link"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              currentPage === "admin"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/40"
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Admin
            {currentPage === "admin" && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </button>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 pb-4 space-y-1 border-t border-sidebar-border pt-4">
        <button
          type="button"
          onClick={() => navigate("profile")}
          data-ocid="sidebar.profile.link"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/40 transition-all"
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="sidebar.logout.button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}
