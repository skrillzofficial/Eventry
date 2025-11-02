import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  Wallet,
  ArrowRight,
  MapPin,
  AlertCircle,
  Clock,
  Settings,
  Heart,
  Search,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { authAPI, eventAPI, bookingAPI, transactionAPI, apiCall } from "../services/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userResult = await apiCall(authAPI.getCurrentUser);
      
      if (!userResult.success) {
        throw new Error(userResult.error || "Failed to load your profile");
      }

      // Handle multiple possible data structures
      const userData = userResult.data?.data || 
                      userResult.data?.user || 
                      userResult.data || null;
      
      if (!userData) {
        throw new Error("No user data received");
      }
      
      setUser(userData);

      // Load all other data in parallel
      await Promise.all([
        loadBookings(),
        loadUpcomingEvents(),
        loadWalletBalance(),
      ]);
    } catch (error) {
      console.error("Error loading user data:", error);
      setError(error.message || "Failed to load your profile");

      // Redirect to login if authentication error
      if (
        error.message?.includes("log in") ||
        error.message?.includes("authentication") ||
        error.message?.includes("token")
      ) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      // ✅ FIX: Use bookingAPI instead of eventAPI
      const bookingsResult = await apiCall(bookingAPI.getMyBookings);
      let bookings = [];

      if (bookingsResult.success) {
        // Try multiple possible data structures
        bookings = bookingsResult.data?.data?.bookings || 
                   bookingsResult.data?.bookings || 
                   bookingsResult.data || [];
        
        if (!Array.isArray(bookings)) {
          console.warn("Bookings is not an array:", bookings);
          bookings = [];
        }
        
        // Process bookings to handle event images properly
        bookings = bookings.map(booking => {
          if (booking.event) {
            let eventImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';
            
            const rawImages = booking.event.images || [];
            
            if (rawImages.length > 0) {
              const img = rawImages[0];
              
              // If img is an object with url property (Cloudinary format)
              if (img && typeof img === "object" && img.url) {
                eventImage = img.url;
              }
              // If img is already a string URL
              else if (typeof img === "string") {
                eventImage = img;
              }
            }
            
            // Also check for direct image/imageUrl fields
            if (!eventImage || eventImage.includes('data:image/svg')) {
              eventImage = booking.event.image || booking.event.imageUrl || eventImage;
            }
            
            return {
              ...booking,
              event: {
                ...booking.event,
                image: eventImage,
              }
            };
          }
          return booking;
        });
      }

      console.log("✅ Loaded bookings:", bookings.length);
      setMyBookings(bookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setMyBookings([]);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const result = await apiCall(eventAPI.getAllEvents);
      
      if (result.success) {
        // Try multiple possible data structures (matching DiscoverEvents pattern)
        const eventsData = result.data?.events || 
                          result.data?.data || 
                          result.data || [];
        
        // Process events to handle images properly
        const processedEvents = eventsData.map((event) => {
          let eventImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';
          
          const rawImages = event.images || [];
          
          if (rawImages.length > 0) {
            const img = rawImages[0];
            
            // If img is an object with url property (Cloudinary format)
            if (img && typeof img === "object" && img.url) {
              eventImage = img.url;
            }
            // If img is already a string URL
            else if (typeof img === "string") {
              eventImage = img;
            }
          }
          
          // Also check for direct image/imageUrl fields
          if (!eventImage || eventImage.includes('data:image/svg')) {
            eventImage = event.image || event.imageUrl || eventImage;
          }
          
          return {
            ...event,
            image: eventImage,
          };
        });
        
        // Filter for upcoming events only
        const today = new Date();
        const upcoming = processedEvents.filter(event => {
          const eventDate = new Date(event.date || event.startDate);
          return eventDate >= today;
        });
        
        setUpcomingEvents(upcoming.slice(0, 6));
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setUpcomingEvents([]);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const transactionsResult = await apiCall(transactionAPI.getMyTransactions);
      
      if (transactionsResult.success) {
        // Try multiple possible data structures
        const transactions = transactionsResult.data?.data || 
                            transactionsResult.data?.transactions || 
                            transactionsResult.data || [];
        
        // Calculate balance from successful transactions
        const successfulTransactions = transactions.filter(
          t => t.status === "success" || t.status === "completed"
        );
        
        const totalSpent = successfulTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );
        
        // For now, use a mock balance (replace with actual wallet balance from API)
        const balance = Math.floor(Math.random() * 5000) + 1000;
        setWalletBalance(balance);
      }
    } catch (error) {
      console.error("Error loading wallet:", error);
      setWalletBalance(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 w-11/12 mx-auto container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 w-11/12 mx-auto container py-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadUserData}
              className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const userName = user?.fullName || user?.firstName || user?.name || "Guest";
  const today = new Date();
  
  const upcomingBookings = myBookings.filter(
    (booking) =>
      booking.event &&
      new Date(booking.event.date || booking.event.startDate) >= today
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 w-11/12 mx-auto container py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {userName} 
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to discover your next event?
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* My Tickets */}
          <Link
            to="/my-tickets"
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-[#FF6B35] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Ticket className="h-8 w-8 text-purple-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              My Tickets
            </h3>
            <p className="text-gray-600 mb-4">
              View and manage all your event tickets
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium text-[#FF6B35]">
                {upcomingBookings.length} upcoming
              </span>
            </div>
          </Link>

          {/* Wallet */}
          <Link
            to="/dashboard/wallet"
            className="bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-2xl shadow-sm p-8 hover:shadow-lg transition-all group text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <ArrowRight className="h-5 w-5 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold mb-2">My Wallet</h3>
            <p className="text-white/90 mb-4">Secure digital payments</p>
            <div className="text-2xl font-bold">
              ₦{walletBalance.toLocaleString()}
            </div>
          </Link>

          {/* Settings */}
          <Link
            to="/dashboard/profile"
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-[#FF6B35] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Settings
            </h3>
            <p className="text-gray-600 mb-4">
              Manage your account preferences
            </p>
            <div className="text-sm text-gray-500">Profile & Security</div>
          </Link>
        </div>

        {/* Upcoming Events Section */}
        {upcomingBookings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Upcoming Events
              </h2>
              <Link
                to="/my-tickets"
                className="text-[#FF6B35] hover:text-[#FF8535] font-medium flex items-center group"
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingBookings.slice(0, 4).map((booking, index) => {
                const event = booking.event;
                if (!event) return null;

                const imageUrl =
                  event.image ||
                  event.images?.[0]?.url ||
                  event.images?.[0] ||
                  event.imageUrl ||
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';

                return (
                  <Link
                    key={booking._id || booking.id || `booking-${index}`}
                    to={`/my-tickets/${booking._id || booking.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#FF6B35] transition-all group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={event.title || event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                        {event.title || event.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-[#FF6B35]" />
                          {new Date(
                            event.date || event.startDate
                          ).toLocaleDateString("en-NG", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-[#FF6B35]" />
                          {event.city ||
                            event.location?.city ||
                            event.venue ||
                            "Location TBA"}
                        </div>
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-[#FF6B35]" />
                          {booking.numberOfTickets || 1} ticket(s)
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Discover New Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Discover Events
            </h2>
            <Link
              to="/discover"
              className="text-[#FF6B35] hover:text-[#FF8535] font-medium flex items-center group"
            >
              Browse all
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const imageUrl =
                  event.image ||
                  event.images?.[0]?.url ||
                  event.images?.[0] ||
                  event.imageUrl ||
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';

                return (
                  <Link
                    key={event._id || event.id}
                    to={`/event/${event._id || event.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#FF6B35] transition-all group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={event.title || event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FF6B35] transition-colors">
                        {event.title || event.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#FF6B35]" />
                        {new Date(
                          event.date || event.startDate
                        ).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-[#FF6B35]" />
                        {event.city || event.location?.city || "Lagos"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No events available
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for exciting events!
              </p>
              <Link
                to="/discover"
                className="inline-block px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
              >
                Explore All Events
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;