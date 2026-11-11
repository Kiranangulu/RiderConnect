
import { Routes, Route, Navigate } from "react-router-dom";

// Page imports
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Navigation from "./pages/Navigation";
import RouteIntelligence from "./pages/RouteIntelligence";
import Earnings from "./pages/Earnings";
import Deliveries from "./pages/Deliveries";
import Community from "./pages/Community";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      {/* Open Dashboard directly */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Authentication pages - optional */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main application pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/navigation" element={<Navigation />} />

      <Route
        path="/route-intelligence"
        element={<RouteIntelligence />}
      />

      <Route path="/deliveries" element={<Deliveries />} />
      <Route path="/earnings" element={<Earnings />} />
      <Route path="/community" element={<Community />} />
      <Route path="/profile" element={<Profile />} />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}
