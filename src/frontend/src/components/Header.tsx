import { Bell, ChevronDown, Search } from "lucide-react";
import { useApp } from "../contexts/AppContext";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  portfolio: "Portfolio",
  wallets: "Wallets",
  transactions: "Transactions",
  referrals: "Referrals",
  admin: "Admin Panel",
  profile: "Profile",
};

const TIMEFRAMES = ["24H", "7D", "30D", "1Y"];

export function Header() {
  const { currentPage } = useApp();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {PAGE_TITLES[currentPage] ?? "CryptoTrack"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            data-ocid="header.search_input"
            className="w-52 pl-9 pr-4 py-2 text-sm rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Timeframe */}
        <div className="hidden md:flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              data-ocid="header.timeframe.tab"
              className="px-3 py-1 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <button
          type="button"
          data-ocid="header.notifications.button"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* User quick dropdown */}
        <button
          type="button"
          data-ocid="header.user.button"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-primary text-xs font-semibold">
            C
          </div>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
}
