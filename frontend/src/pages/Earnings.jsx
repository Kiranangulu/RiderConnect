
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import {
  Wallet,
  TrendingUp,
  Fuel,
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  X,
  IndianRupee
} from "lucide-react";

import {
  readData,
  writeData
} from "../services/storage";

// Get today's date using the browser's local timezone
function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = getToday();

const initialTransactions = [
  {
    id: 1,
    title: "Delivery payment",
    category: "Delivery",
    type: "INCOME",
    amount: 45,
    date: today
  },
  {
    id: 2,
    title: "Delivery payment",
    category: "Delivery",
    type: "INCOME",
    amount: 55,
    date: today
  },
  {
    id: 3,
    title: "Petrol refill",
    category: "Fuel",
    type: "EXPENSE",
    amount: 150,
    date: today
  },
  {
    id: 4,
    title: "Food and refreshments",
    category: "Food",
    type: "EXPENSE",
    amount: 50,
    date: today
  }
];

const initialForm = {
  title: "",
  category: "Delivery",
  type: "INCOME",
  amount: "",
  date: today
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);
}

function Earnings() {
  // Load previously saved transactions from localStorage
  const [transactions, setTransactions] = useState(() =>
    readData("transactions", initialTransactions)
  );

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Save transactions whenever they change
  useEffect(() => {
    const saved = writeData("transactions", transactions);

    if (!saved) {
      setError("Unable to save transactions. Check your browser storage.");
    }
  }, [transactions]);

  // Calculate earnings and expenses automatically
  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);

    const todayTransactions = transactions.filter(
      (item) => item.date === today
    );

    const todayIncome = todayTransactions
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + item.amount, 0);

    const todayExpenses = todayTransactions
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + item.amount, 0);

    const fuelExpenses = transactions
      .filter(
        (item) =>
          item.type === "EXPENSE" &&
          item.category === "Fuel"
      )
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expenses,
      net: income - expenses,
      todayIncome,
      todayExpenses,
      fuelExpenses
    };
  }, [transactions]);

  // Apply transaction filter
  const filteredTransactions = transactions.filter((item) => {
    return filter === "ALL" || item.type === filter;
  });

  // Update form fields
  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));

    setError("");
  };

  // Add new transaction
  const addTransaction = (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim()) {
      setError("Please enter a transaction description.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    if (!form.date || form.date > today) {
      setError("Please select a valid date that is not in the future.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      title: form.title.trim(),
      category: form.category,
      type: form.type,
      amount,
      date: form.date
    };

    setTransactions((previous) => [
      newTransaction,
      ...previous
    ]);

    setForm({
      ...initialForm,
      date: today
    });

    setShowForm(false);
    setError("");
    setMessage("Transaction added successfully.");

    // Remove the success message after the next interaction
  };

  // Weekly sample chart data
  const chartData = [
    { day: "Mon", income: 650, expense: 180 },
    { day: "Tue", income: 820, expense: 210 },
    { day: "Wed", income: 720, expense: 160 },
    { day: "Thu", income: 950, expense: 240 },
    { day: "Fri", income: 780, expense: 190 },
    { day: "Sat", income: 1100, expense: 260 },
    { day: "Sun", income: 850, expense: 200 }
  ];

  const maxChartValue = Math.max(
    ...chartData.map((item) => item.income),
    1
  );

  // Statistics cards
  const statCards = [
    {
      title: "Today's Earnings",
      value: formatCurrency(totals.todayIncome),
      description: "Income recorded today",
      icon: Wallet,
      color: "green"
    },
    {
      title: "Total Expenses",
      value: formatCurrency(totals.expenses),
      description: "All recorded expenses",
      icon: Receipt,
      color: "red"
    },
    {
      title: "Fuel Expenses",
      value: formatCurrency(totals.fuelExpenses),
      description: "Recorded fuel costs",
      icon: Fuel,
      color: "orange"
    },
    {
      title: "Net Earnings",
      value: formatCurrency(totals.net),
      description: "Total income minus expenses",
      icon: TrendingUp,
      color: "blue"
    }
  ];

  const colorClasses = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    blue: "bg-blue-100 text-blue-700"
  };

  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <div className="p-5 md:p-8 space-y-7">

          {/* Page Heading */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Earnings Management
              </h1>

              <p className="text-slate-500 mt-2">
                Monitor your delivery income, fuel expenses and net earnings.
              </p>
            </div>

            <button
              onClick={() => {
                setShowForm(true);
                setMessage("");
                setError("");
              }}
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              <Plus size={19} />
              Add Transaction
            </button>
          </section>

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              {message}
              <button
                onClick={() => setMessage("")}
                className="float-right font-semibold"
                aria-label="Dismiss message"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {statCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-slate-500">
                        {stat.title}
                      </p>

                      <h2 className="text-2xl font-bold text-slate-800 mt-3">
                        {stat.value}
                      </h2>
                    </div>

                    <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-4">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Income and Expenses Summary */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Income</p>

              <div className="flex items-center gap-2 mt-3">
                <ArrowUpRight className="text-green-600" />

                <h2 className="text-2xl font-bold text-green-700">
                  {formatCurrency(totals.income)}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Total Expenses</p>

              <div className="flex items-center gap-2 mt-3">
                <ArrowDownRight className="text-red-600" />

                <h2 className="text-2xl font-bold text-red-600">
                  {formatCurrency(totals.expenses)}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">Net Balance</p>

              <div className="flex items-center gap-2 mt-3">
                <IndianRupee className="text-blue-600" />

                <h2
                  className={`text-2xl font-bold ${
                    totals.net >= 0
                      ? "text-blue-700"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(totals.net)}
                </h2>
              </div>
            </div>

          </section>

          {/* Weekly Chart */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-7">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Weekly Earnings Overview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Illustrative income and expense comparison
                </p>
              </div>

              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-green-500" />
                  Income
                </span>

                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-red-400" />
                  Expenses
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 h-48">
              {chartData.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <div className="flex items-end justify-center gap-1 w-full h-40">
                    <div
                      title={`Income: ${formatCurrency(item.income)}`}
                      className="w-1/3 max-w-7 bg-green-500 rounded-t-md"
                      style={{
                        height: `${(item.income / maxChartValue) * 100}%`
                      }}
                    />

                    <div
                      title={`Expenses: ${formatCurrency(item.expense)}`}
                      className="w-1/3 max-w-7 bg-red-400 rounded-t-md"
                      style={{
                        height: `${(item.expense / maxChartValue) * 100}%`
                      }}
                    />
                  </div>

                  <span className="text-xs text-slate-500">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Transaction History */}
          <section className="bg-white border border-slate-200 rounded-xl p-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Transaction History
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Your recorded income and expenses
                </p>
              </div>

              <div className="flex gap-2">
                {["ALL", "INCOME", "EXPENSE"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                      filter === option
                        ? "bg-green-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {option === "ALL"
                      ? "All"
                      : option === "INCOME"
                        ? "Income"
                        : "Expenses"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  No transactions found.
                </p>
              ) : (
                filteredTransactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-3 rounded-lg shrink-0 ${
                          item.type === "INCOME"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.type === "INCOME"
                          ? <ArrowDownRight size={20} />
                          : <ArrowUpRight size={20} />}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {item.title}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {item.category} · {item.date}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-bold whitespace-nowrap ${
                        item.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add Transaction
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Record your income or expenses.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={addTransaction} className="space-y-4">

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Transaction Type
                </label>

                <select
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value;

                    updateForm("type", type);
                    updateForm(
                      "category",
                      type === "INCOME" ? "Delivery" : "Fuel"
                    );
                  }}
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Delivery payment or Petrol refill"
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  {form.type === "INCOME" ? (
                    <>
                      <option value="Delivery">Delivery</option>
                      <option value="Incentive">Incentive</option>
                      <option value="Bonus">Bonus</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Fuel">Fuel</option>
                      <option value="Food">Food</option>
                      <option value="Maintenance">Vehicle Maintenance</option>
                      <option value="Other Expense">Other Expense</option>
                    </>
                  )}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (₹)
                </label>

                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={(event) =>
                    updateForm("amount", event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date
                </label>

                <input
                  type="date"
                  required
                  max={today}
                  value={form.date}
                  onChange={(event) =>
                    updateForm("date", event.target.value)
                  }
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              {/* Form Error */}
              {error && (
                <p className="text-sm text-red-600">
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="flex-1 border border-slate-300 rounded-lg p-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 font-semibold"
                >
                  Save Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Earnings;
