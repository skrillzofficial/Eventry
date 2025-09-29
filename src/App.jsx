import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import SignUp from "./Auths/SignUp";
import Login from "./Auths/Login";
import UserProfile from "./pages/UserProfile";
import OrganizerDashboard from "./pages/OrganizerProfile";
import CreateEvent from "./pages/dashboard/CreateEvent";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DiscoverEvents from "./pages/dashboard/DiscoverEvent";
import Team from "./pages/dashboard/Team";
import ResetPassword from "./Auths/ResetPassword";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen Loading Blend-overrlay">
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner */}
          <div className="mt-6 w-40 h-15 border-4 border-[#E55A2B] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/team" element={<Team />} />
        {/* Auth pages */}
        <Route path="/dashboard" element={<UserProfile />} />
        <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        {/* Auth */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ResetPassword />} />
        {/* Event */}
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/discover" element={<DiscoverEvents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
