import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import "./App.css";

// Pages
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import OrganizerDashboard from "./pages/OrganizerProfile";
import CreateEvent from "./pages/dashboard/CreateEvent";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DiscoverEvents from "./pages/dashboard/DiscoverEvent";
import Team from "./pages/dashboard/Team";
import EventPage from "./pages/dashboard/EventPage";
import WalletComponent from "./pages/dashboard/Wallet";
import CheckoutFlow from "./checkout/Checkout";
import MyEvents from "./pages/dashboard/MyEvents";
import MyTickets from "./pages/dashboard/MyTickets"; 

// Auth Pages
import SignUp from "./Auths/SignUp";
import Login from "./Auths/Login";
import VerifyEmail from "./Auths/VerifyEmail";
import ResendVerification from "./Auths/ResendVerification";
import ForgotPassword from "./Auths/ForgotPassword";
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
          <RingLoader color="#FF6B35" loading={loading} size={80} />
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <EventProvider>
        <BrowserRouter>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<UserProfile />} />
            <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/wallet" element={<WalletComponent />} />
            <Route path="/dashboard/checkout" element={<CheckoutFlow />} />
            <Route path="/my-tickets" element={<MyTickets />} /> {/* ADD THIS ROUTE */}

            {/* Auth Routes */}
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Email Verification Routes */}
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/resend-verification" element={<ResendVerification />} />

            {/* Event Routes */}
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/discover" element={<DiscoverEvents />} />
            <Route path="/event/:id" element={<EventPage />} />
            
            {/* MyEvents routes */}
            <Route path="/dashboard/organizer/events" element={<MyEvents />} />
            <Route path="/dashboard/events" element={<MyEvents />} />
            <Route path="/organizer/events/create" element={<CreateEvent />} />
          </Routes>
        </BrowserRouter>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;