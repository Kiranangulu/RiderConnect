
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  PackageCheck,
  Clock,
  XCircle,
  Plus,
  Search,
  MapPin,
  IndianRupee,
  CalendarDays,
  CheckCircle,
  Trash2,
  Truck
} from "lucide-react";

import {
  readData,
  writeData
} from "../services/storage";

const initialDeliveries = [];

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState(() =>
    readData("deliveries", initialDeliveries)
  );

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [form, setForm] = useState({
    orderId: "",
    customerArea: "",
    amount: "",
    date: getToday(),
    status: "PENDING"
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Save deliveries whenever the list changes.
  useEffect(() => {
    writeData("deliveries", deliveries);
  }, [deliveries]);

  // Delivery statistics.
  const stats = useMemo(() => {
    const completed = deliveries.filter(
      (item) => item.status === "COMPLETED"
    );

    const pending = deliveries.filter(
      (item) => item.status === "PENDING"
    );

    const cancelled = deliveries.filter(
      (item) => item.status === "CANCELLED"
    );

    const totalAmount = completed.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    return {
      total: deliveries.length,
      completed: completed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      totalAmount
    };
  }, [deliveries]);

  // Search and filter deliveries.
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((item) => {
        const matchesFilter =
          filter === "ALL" || item.status === filter;

        const matchesSearch =
          item.orderId.toLowerCase().includes(search.toLowerCase()) ||
          item.customerArea.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [deliveries, filter, search]);

  // Form input handler.
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Add a new delivery.
  function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    const amount = Number(form.amount);

    if (
      !form.orderId.trim() ||
      !form.customerArea.trim() ||
      !form.amount ||
      amount <= 0 ||
      !form.date
    ) {
      setError("Please enter all valid delivery details.");
      return;
    }

    const duplicate = deliveries.some(
      (item) =>
        item.orderId.toLowerCase() === form.orderId.trim().toLowerCase()
    );

    if (duplicate) {
      setError("This order ID already exists.");
      return;
    }

    const newDelivery = {
      id: Date.now(),
      orderId: form.orderId.trim(),
      customerArea: form.customerArea.trim(),
      amount,
      date: form.date,
      status: form.status,
      incomeRecorded: false,
      createdAt: Date.now()
    };

    setDeliveries((previous) => [
      newDelivery,
      ...previous
    ]);

    // If initially completed, create its income transaction.
    if (newDelivery.status === "COMPLETED") {
      recordDeliveryIncome(newDelivery);
    }

    setForm({
      orderId: "",
      customerArea: "",
      amount: "",
      date: getToday(),
      status: "PENDING"
    });

    setShowForm(false);
    setMessage("Delivery added successfully.");
  }

  // Add delivery income only once.
  function recordDeliveryIncome(delivery) {
    const transactions = readData("transactions", []);

    const alreadyRecorded = transactions.some(
      (item) => item.deliveryId === delivery.id
    );

    if (alreadyRecorded) return;

    const incomeTransaction = {
      id: Date.now() + Math.random(),
      title: `Delivery - ${delivery.orderId}`,
      type: "INCOME",
      category: "Delivery",
      amount: Number(delivery.amount),
      date: delivery.date,
      deliveryId: delivery.id
    };

    writeData("transactions", [
      incomeTransaction,
      ...transactions
    ]);
  }

  // Update delivery status.
  function updateStatus(id, newStatus) {
    const delivery = deliveries.find(
      (item) => item.id === id
    );

    if (!delivery) return;

    if (delivery.status === "CANCELLED") {
      setError("Cancelled deliveries cannot be updated.");
      return;
    }

    if (delivery.status === "COMPLETED") {
      setError("Completed deliveries cannot be changed.");
      return;
    }

    if (newStatus === "COMPLETED") {
      recordDeliveryIncome(delivery);
    }

    setDeliveries((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              incomeRecorded:
                newStatus === "COMPLETED"
            }
          : item
      )
    );

    setError("");
    setMessage(
      `Delivery marked as ${newStatus.toLowerCase()}.`
    );
  }

  // Delete a delivery.
  function deleteDelivery(id) {
    const delivery = deliveries.find(
      (item) => item.id === id
    );

    if (!delivery) return;

    if (delivery.status === "COMPLETED") {
      setError(
        "Completed deliveries cannot be deleted because their income is already recorded."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this delivery?"
    );

    if (!confirmed) return;

    setDeliveries((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setError("");
    setMessage("Delivery deleted successfully.");
  }

  const statCards = [
    {
      title: "Total Deliveries",
      value: stats.total,
      icon: Truck,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: PackageCheck,
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600"
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "bg-red-50 text-red-600"
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <div className="p-4 md:p-6 space-y-6">

          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Delivery Management
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Manage your delivery orders and track completed deliveries.
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setMessage("");
              }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium"
            >
              <Plus size={19} />
              Add Delivery
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg">
              {message}
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {stat.title}
                    </p>

                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon size={21} />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-slate-800 mt-4">
                    {stat.value}
                  </h2>
                </div>
              );
            })}
          </div>

          {/* Completed delivery income */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <IndianRupee size={23} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Income from Completed Deliveries
                </p>

                <h2 className="text-2xl font-bold text-slate-800">
                  {formatCurrency(stats.totalAmount)}
                </h2>
              </div>
            </div>
          </div>

          {/* Add delivery form */}
          {showForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-5">
                Add New Delivery
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Order ID
                    </label>

                    <input
                      name="orderId"
                      value={form.orderId}
                      onChange={handleChange}
                      placeholder="Example: ORD1001"
                      className="w-full border border-slate-300 rounded-lg p-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Customer Area
                    </label>

                    <input
                      name="customerArea"
                      value={form.customerArea}
                      onChange={handleChange}
                      placeholder="Example: MVP Colony"
                      className="w-full border border-slate-300 rounded-lg p-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Delivery Amount (₹)
                    </label>

                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      min="0.01"
                      step="0.01"
                      className="w-full border border-slate-300 rounded-lg p-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Delivery Date
                    </label>

                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      max={getToday()}
                      className="w-full border border-slate-300 rounded-lg p-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Delivery Status
                    </label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg p-3 bg-white"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                  >
                    Save Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setError("");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delivery history */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Delivery History
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                View and manage your delivery records.
              </p>
            </div>

            {/* Search and filter */}
            <div className="p-5 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search order ID or customer area..."
                  className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-3"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="border border-slate-300 rounded-lg p-3 bg-white"
              >
                <option value="ALL">All Deliveries</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Records */}
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-14 px-5">
                <PackageCheck
                  size={42}
                  className="mx-auto text-slate-300 mb-3"
                />

                <h3 className="font-semibold text-slate-700">
                  No deliveries found
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  Add your first delivery to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Area</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDeliveries.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4 font-medium text-slate-800">
                          {item.orderId}
                        </td>

                        <td className="p-4 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin size={15} />
                            {item.customerArea}
                          </span>
                        </td>

                        <td className="p-4 text-slate-600">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={15} />
                            {formatDate(item.date)}
                          </span>
                        </td>

                        <td className="p-4 font-semibold text-slate-800">
                          {formatCurrency(item.amount)}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              item.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : item.status === "PENDING"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">

                            {item.status === "PENDING" && (
                              <>
                                <button
                                  title="Mark completed"
                                  onClick={() =>
                                    updateStatus(item.id, "COMPLETED")
                                  }
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                >
                                  <CheckCircle size={19} />
                                </button>

                                <button
                                  title="Cancel delivery"
                                  onClick={() =>
                                    updateStatus(item.id, "CANCELLED")
                                  }
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  <XCircle size={19} />
                                </button>

                                <button
                                  title="Delete delivery"
                                  onClick={() => deleteDelivery(item.id)}
                                  className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}

                            {item.status === "COMPLETED" && (
                              <span className="text-xs text-green-700">
                                Income recorded
                              </span>
                            )}

                            {item.status === "CANCELLED" && (
                              <span className="text-xs text-slate-400">
                                No income recorded
                              </span>
                            )}

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-slate-100 p-4 text-sm text-slate-500">
              Showing {filteredDeliveries.length} of {deliveries.length} deliveries
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
