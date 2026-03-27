import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
