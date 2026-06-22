import { Outlet } from "react-router-dom";
import { useCallback } from "react";
import UserMenu from "./UserMenu";
import { useAuthStore } from "../../stores/authStore";

export default function Layout() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">API Docs Platform</h1>
          <nav className="flex gap-4 items-center">
            <a href="/" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </a>
            <a href="/abac" className="text-muted-foreground hover:text-foreground">
              Access Control
            </a>
            <a href="/projects/new" className="text-muted-foreground hover:text-foreground">
              New Project
            </a>
            <div className="border-l border-border h-6 mx-2" />
            <UserMenu onLogout={handleLogout} />
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
