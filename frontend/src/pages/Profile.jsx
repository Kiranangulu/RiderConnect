
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import {
  User,
  Mail,
  Phone,
  Bike,
  MapPin,
  Calendar,
  ShieldCheck,
  Bell,
  Lock,
  Save,
  Camera,
  Clock,
  CheckCircle
} from "lucide-react";

function Profile() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({
    fullName: savedUser.fullName || savedUser.name || "",
    email: savedUser.email || "",
    phone: savedUser.phone || "",
    platform: savedUser.platform || "BLINKIT",
    city: savedUser.city || "Visakhapatnam",
    vehicle: savedUser.vehicle || "Two Wheeler"
  });

  const [settings, setSettings] = useState({
    notifications: true,
    routeHistory: true,
    locationSharing: false
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSettingChange = (event) => {
    const { name, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: checked
    }));
  };

  const saveProfile = (event) => {
    event.preventDefault();

    const updatedUser = {
      ...savedUser,
      ...profile
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setMessage("Profile updated successfully.");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <div className="p-5 md:p-8 space-y-7">

          {/* Page heading */}
          <section>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
              My Profile
            </h1>

            <p className="text-slate-500 mt-2">
              Manage your personal information and account preferences.
            </p>
          </section>

          {/* Profile summary */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">

              <div className="w-24 h-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <User size={48} />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-slate-800">
                  {profile.fullName || "Rider Name"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {profile.email || "Your email address"}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    <CheckCircle size={13} className="inline mr-1" />
                    Registered Rider
                  </span>

                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {profile.platform}
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* Profile information */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Personal Information
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Update your account details.
              </p>
            </div>

            {message && (
              <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {message}
              </div>
            )}

            <form onSubmit={saveProfile} className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3.5 text-slate-400" />

                    <input
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />

                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>

                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-slate-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Delivery Platform
                  </label>

                  <div className="relative">
                    <Bike size={18} className="absolute left-3 top-3.5 text-slate-400" />

                    <select
                      name="platform"
                      value={profile.platform}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3 bg-white"
                    >
                      <option value="BLINKIT">Blinkit</option>
                      <option value="ZEPTO">Zepto</option>
                      <option value="SWIGGY_INSTAMART">Swiggy Instamart</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>

                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3.5 text-slate-400" />

                    <input
                      name="city"
                      value={profile.city}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vehicle Type
                  </label>

                  <div className="relative">
                    <Bike size={18} className="absolute left-3 top-3.5 text-slate-400" />

                    <select
                      name="vehicle"
                      value={profile.vehicle}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-3 bg-white"
                    >
                      <option value="Two Wheeler">Two Wheeler</option>
                      <option value="Electric Scooter">Electric Scooter</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>

            </form>
          </section>

          {/* Privacy settings */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">

            <h2 className="text-lg font-bold text-slate-800">
              Privacy and Preferences
            </h2>

            <p className="text-sm text-slate-500 mt-1 mb-6">
              Control how RiderConnect uses your information.
            </p>

            <div className="space-y-6">

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <Bell className="text-green-600 mt-1" />

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Notifications
                    </h3>
                    <p className="text-sm text-slate-500">
                      Receive navigation and community notifications.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleSettingChange}
                  className="w-5 h-5 accent-green-600"
                />
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <Clock className="text-blue-600 mt-1" />

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Route History Contribution
                    </h3>
                    <p className="text-sm text-slate-500">
                      Allow opted-in return journeys to contribute to route intelligence.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="routeHistory"
                  checked={settings.routeHistory}
                  onChange={handleSettingChange}
                  className="w-5 h-5 accent-green-600"
                />
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-3">
                  <MapPin className="text-orange-600 mt-1" />

                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Location Sharing
                    </h3>
                    <p className="text-sm text-slate-500">
                      Allow temporary location sharing when you explicitly choose to share it.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  name="locationSharing"
                  checked={settings.locationSharing}
                  onChange={handleSettingChange}
                  className="w-5 h-5 accent-green-600"
                />
              </div>

            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <ShieldCheck className="text-amber-700 shrink-0" />

                <p className="text-sm text-amber-800">
                  These are currently frontend demonstration preferences.
                  Real GPS collection must require explicit consent and
                  must stop when permission is withdrawn.
                </p>
              </div>
            </div>

          </section>

          {/* Account information */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">

            <h2 className="text-lg font-bold text-slate-800 mb-5">
              Account Information
            </h2>

            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <ShieldCheck className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Account Security
                  </p>
                  <p className="text-xs text-slate-500">
                    Authentication will be managed by the backend.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Lock className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Password Protection
                  </p>
                  <p className="text-xs text-slate-500">
                    Your password must never be stored in this profile page.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Account Type
                  </p>
                  <p className="text-xs text-slate-500">
                    Delivery Partner
                  </p>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Profile;
