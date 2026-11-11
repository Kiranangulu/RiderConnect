import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    platform: "BLINKIT"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-5">

      <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center">
          Join RiderConnect
        </h1>

        <p className="text-slate-500 text-center mt-2 mb-7">
          Create your delivery partner account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className="w-full border p-3 rounded-lg"
          />

          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          >
            <option value="BLINKIT">Blinkit</option>
            <option value="ZEPTO">Zepto</option>
            <option value="SWIGGY_INSTAMART">Swiggy Instamart</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create Password"
            minLength={8}
            required
            className="w-full border p-3 rounded-lg"
          />

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <p className="text-center mt-6 text-sm">
          Already registered?{" "}
          <Link to="/login" className="text-green-700 font-semibold">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}