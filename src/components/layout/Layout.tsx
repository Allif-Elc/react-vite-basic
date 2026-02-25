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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">API Docs Platform</h1>
          <nav className="flex gap-4 items-center">
            <a href="/" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/abac" className="text-gray-700 hover:text-gray-900">
              Access Control
            </a>
            <a href="/projects/new" className="text-gray-700 hover:text-gray-900">
              New Project
            </a>
            <div className="border-l border-gray-300 h-6 mx-2" />
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
