import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FadeLoader, PulseLoader, RingLoader } from "react-spinners";
import { AuthProvider } from "./context/AuthContext"; 
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
import EventPage from "./pages/dashboard/EventPage";
import Wallet from "./pages/dashboard/Wallet";
import WalletComponent from "./pages/dashboard/Wallet";
import CheckoutFlow from "./checkout/Checkout";
import VerifyEmail from "./Auths/VerifyEmail";

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
          <RingLoader color="#FF6B35" loading={loading} size={80} />
        </div>
      </div>
    );
  }

  return (
    <AuthProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          {/* Auth pages */}
          <Route path="/dashboard" element={<UserProfile />} />
          <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/wallet" element={<WalletComponent />} />
          <Route path="/dashboard/checkout" element={<CheckoutFlow />} />
          {/* Auth */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Event */}
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/discover" element={<DiscoverEvents />} />
          <Route path="/event/:id" element={<EventPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;