
import { Bell, MapPin } from "lucide-react";

export default function Header() {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (error) {
    console.error("Unable to read user information:", error);
  }

  return (
    <header className="bg-white border-b border-slate-200 px-5 py-4 md:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

      {/* Welcome Section */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-800">
          Welcome, {user.fullName || user.name || "Rider"}!
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Your delivery assistance dashboard
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4">

        {/* Location Status */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-2">
          <MapPin size={16} className="text-slate-500 shrink-0" />

          <span className="text-xs sm:text-sm text-slate-600">
            Location not shared
          </span>
        </div>

        {/* Notification Button */}
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition"
        >
          <Bell size={21} />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>

      </div>
    </header>
  );
}
