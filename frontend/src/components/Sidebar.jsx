
import { NavLink } from "react-router-dom";

import {
  House,
  Map,
  Wallet,
  Users,
  UserRound,
  LogOut,
  PackageCheck,
  Route
} from "lucide-react";

const links = [
  { name: "Dashboard", path: "/dashboard", icon: House },
  { name: "Navigation", path: "/navigation", icon: Map },
  {
    name: "Route Intelligence",
    path: "/route-intelligence",
    icon: Route
  },
  { name: "Deliveries", path: "/deliveries", icon: PackageCheck },
  { name: "Earnings", path: "/earnings", icon: Wallet },
  { name: "Community", path: "/community", icon: Users },
  { name: "Profile", path: "/profile", icon: UserRound }
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white p-5">
      <h1 className="text-2xl font-bold mb-2">
        Rider<span className="text-green-400">Connect</span>
      </h1>

      <p className="text-xs text-slate-400 mb-10">
        Smart Rider Assistance
      </p>

      <nav className="space-y-2">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            <Icon size={19} />
            {name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
        className="flex items-center gap-3 text-slate-300 mt-12 p-3 hover:bg-slate-800 rounded-lg w-full"
      >
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}
