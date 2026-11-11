
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";

import {
  Wallet,
  PackageCheck,
  Fuel,
  TrendingUp,
  MapPin,
  Navigation,
  Clock,
  ArrowUpRight,
  Users,
  Plus,
  Route
} from "lucide-react";

import { Link } from "react-router-dom";
import { readData } from "../services/storage";

// Get today's date using local timezone
function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Format currency in Indian Rupees
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function Dashboard() {
  const today = getToday();

  // Read saved transactions
  const transactions = readData("transactions", []);

  // Read saved deliveries
  const deliveries = readData("deliveries", []);

  // Calculate completed deliveries
  const completedDeliveries = deliveries.filter(
    (item) => item.status === "COMPLETED"
  );

  // Today's transactions
  const todayTransactions = transactions.filter(
    (item) => item.date === today
  );

  // Today's income
  const todayIncome = todayTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Today's expenses
  const todayExpenses = todayTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Today's fuel expenses
  const todayFuelExpenses = todayTransactions
    .filter(
      (item) =>
        item.type === "EXPENSE" &&
        item.category === "Fuel"
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);

  // Today's net earnings
  const todayNetEarnings = todayIncome - todayExpenses;

  // Dashboard statistics
  const stats = [
    {
      title: "Today's Earnings",
      value: formatCurrency(todayIncome),
      subtitle: "Income recorded today",
      icon: Wallet
    },
    {
      title: "Completed Deliveries",
      value: completedDeliveries.length,
      subtitle: "Successfully completed orders",
      icon: PackageCheck
    },
    {
      title: "Fuel Expenses",
      value: formatCurrency(todayFuelExpenses),
      subtitle: "Fuel costs recorded today",
      icon: Fuel
    },
    {
      title: "Net Earnings",
      value: formatCurrency(todayNetEarnings),
      subtitle: "Today's income minus expenses",
      icon: TrendingUp
    }
  ];

  // Latest transactions for Recent Activity
  const activities = [...transactions]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0">

        {/* Header */}
        <Header />

        <div className="p-5 md:p-8 space-y-8">

          {/* Welcome Section */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Dashboard Overview
              </h1>

              <p className="text-slate-500 mt-2">
                Welcome back! Here's your delivery performance summary.
              </p>
            </div>

            <Link
              to="/navigation"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium transition"
            >
              <Navigation size={18} />
              Start Navigation
            </Link>

          </section>

          {/* Statistics Cards */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

              {stats.map((stat) => (
                <StatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  description={stat.subtitle}
                  icon={stat.icon}
                />
              ))}

            </div>
          </section>

          {/* Navigation Banner */}
          <section className="bg-gradient-to-r from-green-700 to-emerald-500 rounded-2xl p-6 md:p-8 text-white shadow-sm">

            <div className="flex flex-col md:flex-row justify-between gap-6">

              <div className="max-w-xl">

                <div className="flex items-center gap-2 mb-3">
                  <Route size={22} />

                  <span className="font-semibold">
                    RiderConnect Smart Navigation
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold">
                  Smarter Routes. Better Deliveries.
                </h2>

                <p className="text-green-50 mt-3 leading-relaxed">
                  Discover frequently travelled delivery corridors,
                  useful landmarks and return-route recommendations
                  based on previous rider journeys.
                </p>

                <Link
                  to="/navigation"
                  className="inline-flex items-center gap-2 mt-6 bg-white text-green-700 px-5 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
                >
                  Explore Navigation
                  <ArrowUpRight size={18} />
                </Link>

              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="bg-white/15 rounded-full p-8">
                  <MapPin size={90} strokeWidth={1.3} />
                </div>
              </div>

            </div>
          </section>

          {/* Lower Dashboard Sections */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Navigation Preview */}
            <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6">

              <div className="flex justify-between items-center mb-5">

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Navigation Overview
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Your smart delivery route workspace
                  </p>
                </div>

                <MapPin className="text-green-600" size={25} />

              </div>

              <div className="bg-slate-100 rounded-xl h-56 flex flex-col items-center justify-center text-center p-5">

                <div className="bg-green-100 p-4 rounded-full mb-3">
                  <Navigation size={32} className="text-green-700" />
                </div>

                <h3 className="font-semibold text-slate-700">
                  Your Navigation Map
                </h3>

                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  Delivery routes, historical rider journeys and
                  nearby landmarks will appear here.
                </p>

                <Link
                  to="/navigation"
                  className="text-green-700 font-semibold text-sm mt-4 hover:underline"
                >
                  Open Navigation →
                </Link>

              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">

                <div className="bg-green-50 rounded-lg p-4">

                  <div className="flex items-center gap-2 text-green-700">
                    <Route size={18} />

                    <span className="text-sm font-medium">
                      Routes Available
                    </span>
                  </div>

                  <p className="text-xl font-bold text-slate-800 mt-2">
                    0
                  </p>

                </div>

                <div className="bg-blue-50 rounded-lg p-4">

                  <div className="flex items-center gap-2 text-blue-700">
                    <MapPin size={18} />

                    <span className="text-sm font-medium">
                      Nearby Landmarks
                    </span>
                  </div>

                  <p className="text-xl font-bold text-slate-800 mt-2">
                    0
                  </p>

                </div>

              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">

              <h2 className="text-lg font-bold text-slate-800 mb-5">
                Quick Actions
              </h2>

              <div className="space-y-4">

                <Link
                  to="/navigation"
                  className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition"
                >
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Navigation className="text-green-700" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Start Navigation
                    </p>

                    <p className="text-xs text-slate-500">
                      Find a delivery route
                    </p>
                  </div>
                </Link>

                <Link
                  to="/deliveries"
                  className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition"
                >
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <PackageCheck className="text-emerald-700" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Manage Deliveries
                    </p>

                    <p className="text-xs text-slate-500">
                      Add and track delivery orders
                    </p>
                  </div>
                </Link>

                <Link
                  to="/earnings"
                  className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                >
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Plus className="text-blue-700" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Manage Earnings
                    </p>

                    <p className="text-xs text-slate-500">
                      Track income and expenses
                    </p>
                  </div>
                </Link>

                <Link
                  to="/community"
                  className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition"
                >
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="text-purple-700" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-800">
                      Rider Community
                    </p>

                    <p className="text-xs text-slate-500">
                      Connect with other riders
                    </p>
                  </div>
                </Link>

              </div>
            </div>

          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">

            <div className="flex justify-between items-center mb-5">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recent Activity
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your latest recorded income and expenses
                </p>
              </div>

              <Clock size={22} className="text-slate-500" />

            </div>

            <div className="space-y-4">

              {activities.length === 0 ? (

                <p className="text-center text-slate-500 py-8">
                  No transactions recorded yet.
                </p>

              ) : (

                activities.map((activity) => (

                  <div
                    key={activity.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                  >

                    <div>
                      <p className="font-semibold text-slate-800">
                        {activity.title}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {activity.category} · {activity.date}
                      </p>
                    </div>

                    <span
                      className={`font-bold ${
                        activity.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {activity.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(Number(activity.amount))}
                    </span>

                  </div>

                ))

              )}

            </div>
          </section>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400 pb-3">
            RiderConnect © 2026. Smart assistance for delivery partners.
          </p>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
