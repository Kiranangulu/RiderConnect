
import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  House,
  Map,
  Wallet,
  Users,
  UserRound,
  LogOut,
  PackageCheck,
  Route,
  Menu,
  X
} from "lucide-react";

const links = [
  { name: "Dashboard", path: "/dashboard", icon: House },
  { name: "Navigation", path: "/navigation", icon: Map },
  { name: "Route Intelligence", path: "/route-intelligence", icon: Route },
  { name: "Deliveries", path: "/deliveries", icon: PackageCheck },
  { name: "Earnings", path: "/earnings", icon: Wallet },
  { name: "Community", path: "/community", icon: Users },
  { name: "Profile", path: "/profile", icon: UserRound }
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden fixed top-3 left-3 z-[70] rounded-lg bg-slate-950 p-3 text-white shadow-lg"
      >
        <Menu size={23} />
      </button>

      {/* Mobile background overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="md:hidden fixed inset-0 z-[60] bg-black/50"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky
          top-0 left-0 z-[65]
          flex h-dvh md:h-screen
          w-[min(82vw,280px)] md:w-60 lg:w-64
          shrink-0 flex-col
          bg-slate-950 p-5 text-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
            Rider<span className="text-green-400">Connect</span>
          </h1>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"
          >
            <X size={22} />
          </button>
        </div>

        <p className="mb-8 text-xs text-slate-400">
          Smart Rider Assistance
        </p>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl p-3 text-sm sm:text-base transition ${
                  isActive
                    ? "bg-green-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 flex w-full items-center gap-3 rounded-xl p-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>
    </>
  );
}
