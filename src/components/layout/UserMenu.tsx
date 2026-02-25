import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { User, LogOut, LogIn } from "lucide-react";
import { useAuthStore, selectIsAuthenticated, selectUser } from "../../stores/authStore";

interface UserMenuProps {
  onLogout: () => void;
}

const UserMenu = ({ onLogout }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    closeMenu();
    onLogout();
  }, [closeMenu, onLogout]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Enter":
        case " ":
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
          break;
        case "Escape":
          closeMenu();
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
          break;
      }
    },
    [isOpen, closeMenu]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, closeMenu]);

  const menuItems = useMemo(
    () => [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Logout", onClick: handleLogout, icon: LogOut },
    ],
    [handleLogout]
  );

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <LogIn className="w-5 h-5" aria-hidden="true" />
        <span>Login</span>
      </a>
    );
  }

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
          {getUserInitials()}
        </div>
        {user?.name && <span className="hidden sm:inline">{user.name}</span>}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  role="menuitem"
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <a
                key={item.label}
                href={item.href}
                role="menuitem"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
