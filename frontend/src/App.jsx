
import { Routes, Route, Navigate } from "react-router-dom";

// Page imports
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
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}
