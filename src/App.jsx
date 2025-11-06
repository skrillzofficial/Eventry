import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RingLoader } from "react-spinners";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";
import { NotificationProvider } from "./context/NotificationContext";
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
import MyTickets from "./pages/ticket/MyTickets";
import PaymentVerification from "./checkout/PaymentVerification";
import NotificationsPage from "./pages/notification/NotificationPage";

// Auth Pages
import SignUp from "./Auths/SignUp";
import Login from "./Auths/Login";
import VerifyEmail from "./Auths/VerifyEmail";
import ResendVerification from "./Auths/ResendVerification";
import ForgotPassword from "./Auths/ForgotPassword";
import ResetPassword from "./Auths/ResetPassword";
import EditEvent from "./pages/dashboard/EditEvent";
import Contact from "./pages/Contact";
import EventPreview from "./modals/EventPreview";
import ApprovalsDashboard from "./pages/dashboard/ApprovalsDashboard";

// Google OAuth Client ID
const GOOGLE_CLIENT_ID =
  "826217156762-hvf3gphuoiah9kkbbo59tlnr2m2517as.apps.googleusercontent.com";

// Separate component for routes to ensure providers are ready
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
          <Route path="/contact" element={<Contact />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<UserProfile />} />
          <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/wallet" element={<WalletComponent />} />
          <Route path="/dashboard/approvals" element={<ApprovalsDashboard/>} />

          {/* Notifications Route */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Checkout route with eventId parameter */}
          <Route path="/checkout/:eventId" element={<CheckoutFlow />} />

          {/* Payment Verification */}
          <Route path="/payment-verification" element={<PaymentVerification />} />
          
          {/* Tickets */}
          <Route path="/my-tickets" element={<MyTickets />} />

          {/* Auth Routes */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Email Verification Routes */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          {/* Event Routes */}
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/preview" element={<EventPreview/>} />
          <Route path="/discover" element={<DiscoverEvents />} />
          <Route path="/event/:id" element={<EventPage />} />

          {/* Organizer Event Routes */}
          <Route path="/dashboard/organizer/events" element={<MyEvents />} />
          <Route path="/dashboard/events" element={<MyEvents />} />
          <Route path="/organizer/events/create" element={<CreateEvent />} />

          {/* EditEvent route with ID parameter */}
          <Route path="/organizer/events/edit/:id" element={<EditEvent />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Reduced from 5000 to 2000ms for faster load
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-6">
          <RingLoader color="#FF6B35" loading={loading} size={80} />
          <p className="text-gray-600 font-medium">Loading Eventry...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <EventProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </EventProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;