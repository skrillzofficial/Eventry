import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// 3D Animated Loading Component
const AnimatedLoading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 blur-xl"
            style={{
              width: Math.random() * 300 + 100 + 'px',
              height: Math.random() * 300 + 100 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center space-y-12">
        {/* 3D Rotating Logo */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div 
            className="w-32 h-32 relative"
            style={{
              animation: 'rotate3d 3s ease-in-out infinite',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Front face */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center"
              style={{ transform: 'translateZ(50px)' }}>
              <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            {/* Back face */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-700 rounded-3xl shadow-2xl"
              style={{ transform: 'translateZ(-50px) rotateY(180deg)' }} />
            
            {/* Side faces */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 to-orange-600/80 rounded-3xl shadow-2xl"
              style={{ transform: 'rotateY(90deg) translateZ(50px)' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 to-orange-700/80 rounded-3xl shadow-2xl"
              style={{ transform: 'rotateY(-90deg) translateZ(50px)' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/60 to-orange-600/60 rounded-3xl shadow-2xl"
              style={{ transform: 'rotateX(90deg) translateZ(50px)' }} />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/60 to-orange-700/60 rounded-3xl shadow-2xl"
              style={{ transform: 'rotateX(-90deg) translateZ(50px)' }} />
          </div>
        </div>

        {/* Animated Text */}
        <div className="relative">
          <h1 className="text-7xl font-bold tracking-wider" style={{
            background: 'linear-gradient(45deg, #FF6B35, #FF8535, #FFA500, #FF8535, #FF6B35)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 3s linear infinite',
          }}>
            {'Eventry'.split('').map((letter, index) => (
              <span
                key={index}
                className="inline-block"
                style={{
                  animation: `wave 1.5s ease-in-out infinite`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
          
          {/* Underline animation */}
          <div 
            className="h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent mt-4 rounded-full"
            style={{
              animation: 'expandContract 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Loading dots */}
        <div className="flex space-x-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg"
              style={{
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <p className="text-gray-400 text-lg font-medium tracking-wide"
          style={{
            animation: 'pulse 2s ease-in-out infinite',
          }}>
          Loading your experience...
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes rotate3d {
          0%, 100% {
            transform: rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: rotateX(180deg) rotateY(0deg);
          }
          50% {
            transform: rotateX(180deg) rotateY(180deg);
          }
          75% {
            transform: rotateX(0deg) rotateY(180deg);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes expandContract {
          0%, 100% {
            width: 0%;
            opacity: 0;
          }
          50% {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(50px, 50px) scale(1.1);
            opacity: 0.6;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

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
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <AnimatedLoading />;
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