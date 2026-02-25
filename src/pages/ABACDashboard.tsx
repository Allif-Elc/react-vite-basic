import { Suspense } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { PageSkeleton } from "../components/Skeleton";
import { Shield, FileText, UserCog, ChevronRight } from "lucide-react";

const navItems = [
  { path: "", label: "Attributes", icon: Shield },
  { path: "resources", label: "Resources", icon: Shield },
  { path: "permissions", label: "Permissions", icon: Shield },
  { path: "policies", label: "Policies", icon: FileText },
  { path: "user-policies", label: "User Policies", icon: UserCog },
] as const;

export default function ABACDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Access Control</h1>
              <p className="text-sm text-gray-500">ABAC Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === ""}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
