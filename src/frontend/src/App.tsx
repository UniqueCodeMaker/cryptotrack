import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { AppProvider, useApp } from "./contexts/AppContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { usePrices, useUserProfile, useUserRole } from "./hooks/useQueries";
import { AdminPage } from "./pages/AdminPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReferralsPage } from "./pages/ReferralsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { WalletsPage } from "./pages/WalletsPage";

const PUBLIC_PAGES = new Set(["login", "register"]);

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { currentPage, navigate, setUserProfile, setUserRole, setPrices } =
    useApp();

  const { data: profileData } = useUserProfile();
  const { data: roleData } = useUserRole();
  const { data: pricesData } = usePrices();

  // Sync profile / role / prices into context
  useEffect(() => {
    if (profileData !== undefined) setUserProfile(profileData);
  }, [profileData, setUserProfile]);

  useEffect(() => {
    if (roleData != null) setUserRole(roleData);
  }, [roleData, setUserRole]);

  useEffect(() => {
    if (pricesData && Object.keys(pricesData).length > 0) setPrices(pricesData);
  }, [pricesData, setPrices]);

  // Auth redirect
  useEffect(() => {
    if (isInitializing) return;
    if (!identity && !PUBLIC_PAGES.has(currentPage)) {
      navigate("login");
    }
    if (identity && PUBLIC_PAGES.has(currentPage)) {
      navigate("dashboard");
    }
  }, [identity, isInitializing, currentPage, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center teal-glow">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">
            Loading CryptoTrack...
          </p>
        </div>
      </div>
    );
  }

  if (!identity || PUBLIC_PAGES.has(currentPage)) {
    if (currentPage === "register") return <RegisterPage />;
    return <LoginPage />;
  }

  const pageMap: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    portfolio: <PortfolioPage />,
    wallets: <WalletsPage />,
    transactions: <TransactionsPage />,
    referrals: <ReferralsPage />,
    admin: <AdminPage />,
    profile: <ProfilePage />,
  };

  return <Layout>{pageMap[currentPage] ?? <DashboardPage />}</Layout>;
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "oklch(0.20 0.04 253)",
            border: "1px solid oklch(1 0 0 / 8%)",
            color: "oklch(0.96 0.008 240)",
          },
        }}
      />
    </AppProvider>
  );
}
