import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { UserProfile } from "../backend";
import { UserRole } from "../backend";

export type Page =
  | "dashboard"
  | "portfolio"
  | "wallets"
  | "transactions"
  | "referrals"
  | "admin"
  | "profile"
  | "login"
  | "register";

export type PriceEntry = { usd: number; usd_24h_change: number };
export type PriceData = Record<string, PriceEntry>;

interface AppContextType {
  currentPage: Page;
  navigate: (page: Page) => void;
  userProfile: UserProfile | null;
  userRole: UserRole;
  isAdmin: boolean;
  setUserProfile: (p: UserProfile | null) => void;
  setUserRole: (r: UserRole) => void;
  transactionPassword: string | null;
  setTransactionPassword: (pwd: string | null) => void;
  prices: PriceData;
  setPrices: (d: PriceData) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.guest);
  const [transactionPassword, setTransactionPassword] = useState<string | null>(
    null,
  );
  const [prices, setPrices] = useState<PriceData>({});

  const navigate = useCallback((page: Page) => setCurrentPage(page), []);
  const isAdmin = userRole === UserRole.admin;

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigate,
        userProfile,
        userRole,
        isAdmin,
        setUserProfile,
        setUserRole,
        transactionPassword,
        setTransactionPassword,
        prices,
        setPrices,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
