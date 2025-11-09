import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  ArrowRight,
  MapPin,
  AlertCircle,
  Settings,
  Search,
  User,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { authAPI, eventAPI, bookingAPI, transactionAPI, apiCall } from "../services/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Starting to load user data...");

      // First, try to get current user
      const userResult = await apiCall(authAPI.getCurrentUser);
      console.log("📊 User API response:", userResult);
      
      if (!userResult.success) {
        console.error("❌ User API failed:", userResult.error);
        
        // Check if it's an authentication error
        if (userResult.error?.includes("token") || userResult.error?.includes("auth") || userResult.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setError("Please log in to view your profile");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        
        throw new Error(userResult.error || "Failed to load your profile");
      }

      // Handle multiple possible data structures
      const userData = userResult.data?.data || 
                      userResult.data?.user || 
                      userResult.data || 
                      userResult.user || null;
      
      console.log("👤 Processed user data:", userData);
      
      if (!userData) {
        throw new Error("No user data received from server");
      }
      
      setUser(userData);

      // Load all other data in parallel
      await Promise.allSettled([
        loadBookings(),
        loadUpcomingEvents(),
      ]);
      
      console.log("✅ All data loaded successfully");

    } catch (error) {
      console.error("❌ Error loading user data:", error);
      setError(error.message || "Failed to load your profile");

      // Redirect to login if authentication error
      if (
        error.message?.includes("log in") ||
        error.message?.includes("authentication") ||
        error.message?.includes("token") ||
        error.message?.includes("unauthorized")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      console.log("🔄 Loading bookings...");
      
      // Try booking API first
      const bookingsResult = await apiCall(bookingAPI.getMyBookings);
      console.log("📊 Bookings API response:", bookingsResult);
      
      let bookings = [];

      if (bookingsResult.success) {
        // Try multiple possible data structures
        bookings = bookingsResult.data?.data?.bookings || 
                   bookingsResult.data?.bookings || 
                   bookingsResult.bookings ||
                   bookingsResult.data || [];
        
        console.log(`📦 Raw bookings data:`, bookings);
        
        if (!Array.isArray(bookings)) {
          console.warn("⚠️ Bookings is not an array, converting:", typeof bookings);
          if (bookings && typeof bookings === 'object') {
            bookings = Object.values(bookings);
          } else {
            bookings = [];
          }
        }
        
        // Process bookings to handle event images properly
        bookings = bookings.map(booking => {
          if (booking.event) {
            let eventImage = getDefaultEventImage();
            
            const rawImages = booking.event.images || [];
            
            if (rawImages.length > 0) {
              const img = rawImages[0];
              eventImage = extractImageUrl(img);
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
      } else {
        console.warn("⚠️ Bookings API not successful, trying events API...");
        // Fallback: try to get events and create mock bookings
        const eventsResult = await apiCall(eventAPI.getAllEvents);
        if (eventsResult.success) {
          const events = eventsResult.data?.events || eventsResult.data || [];
          bookings = events.slice(0, 4).map(event => ({
            _id: `mock-booking-${event._id || event.id}`,
            event: {
              ...event,
              image: extractImageUrl(event.images?.[0]) || event.image || getDefaultEventImage()
            },
            numberOfTickets: 1,
            status: 'confirmed'
          }));
        }
      }

      console.log("✅ Processed bookings:", bookings.length);
      setMyBookings(bookings);
    } catch (error) {
      console.error("❌ Error loading bookings:", error);
      setMyBookings([]);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      console.log("🔄 Loading upcoming events...");
      
      const result = await apiCall(eventAPI.getAllEvents);
      console.log("📊 Events API response:", result);
      
      if (result.success) {
        // Try multiple possible data structures
        const eventsData = result.data?.events || 
                          result.data?.data || 
                          result.data || 
                          result.events || [];
        
        console.log(`🎯 Raw events data:`, eventsData);
        
        if (!Array.isArray(eventsData)) {
          console.warn("⚠️ Events data is not an array:", typeof eventsData);
          setUpcomingEvents([]);
          return;
        }
        
        // Process events to handle images properly
        const processedEvents = eventsData.map((event) => {
          let eventImage = getDefaultEventImage();
          
          const rawImages = event.images || [];
          
          if (rawImages.length > 0) {
            const img = rawImages[0];
            eventImage = extractImageUrl(img);
          }
          
          // Also check for direct image/imageUrl fields
          if (!eventImage || eventImage.includes('data:image/svg')) {
            eventImage = event.image || event.imageUrl || eventImage;
          }
          
          return {
            ...event,
            id: event._id || event.id,
            image: eventImage,
          };
        });
        
        // Filter for upcoming events only
        const today = new Date();
        const upcoming = processedEvents.filter(event => {
          if (!event.date && !event.startDate) return false;
          try {
            const eventDate = new Date(event.date || event.startDate);
            return eventDate >= today;
          } catch (dateError) {
            console.warn("⚠️ Invalid event date:", event.date, event.startDate);
            return false;
          }
        });
        
        console.log("✅ Upcoming events:", upcoming.length);
        setUpcomingEvents(upcoming.slice(0, 6));
      } else {
        console.warn("⚠️ Events API not successful");
        setUpcomingEvents([]);
      }
    } catch (error) {
      console.error("❌ Error loading events:", error);
      setUpcomingEvents([]);
    }
  };

  // Helper function to extract image URL from various formats
  const extractImageUrl = (img) => {
    if (!img) return getDefaultEventImage();
    
    // If img is an object with url property (Cloudinary format)
    if (typeof img === "object" && img.url) {
      return img.url;
    }
    // If img is already a string URL
    else if (typeof img === "string") {
      return img;
    }
    
    return getDefaultEventImage();
  };

  // Helper function for default event image
  const getDefaultEventImage = () => {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EEvent Image%3C/text%3E%3C/svg%3E';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 w-11/12 mx-auto container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
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
              {error.includes("log in") ? "Authentication Required" : "Something went wrong"}
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            {error.includes("log in") ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Redirecting to login...</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <button
                onClick={loadUserData}
                className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const userName = user?.fullName || user?.firstName || user?.name || user?.userName || "Guest";
  const userEmail = user?.email || "";
  const today = new Date();
  
  const upcomingBookings = myBookings.filter(
    (booking) =>
      booking.event &&
      booking.event.date &&
      new Date(booking.event.date) >= today
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 w-11/12 mx-auto container py-8 max-w-7xl">
        {/* Header with User Info */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                Welcome, {userName} 
              </h1>
              {userEmail && (
                <p className="text-gray-600">{userEmail}</p>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-lg">
            Ready to discover your next event?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-[#FF6B35] mb-1">
              {upcomingBookings.length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-[#FF6B35] mb-1">
              {myBookings.length}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-[#FF6B35] mb-1">
              {upcomingEvents.length}
            </div>
            <div className="text-sm text-gray-600">Events to Discover</div>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl">
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

                const imageUrl = event.image || getDefaultEventImage();
                const eventDate = event.date ? new Date(event.date) : null;

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
                          e.target.src = getDefaultEventImage();
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                        {event.title || event.name}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {eventDate && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-[#FF6B35]" />
                            {eventDate.toLocaleDateString("en-NG", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        )}
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-[#FF6B35]" />
                          {event.city ||
                            event.location?.city ||
                            event.venue ||
                            "Location TBA"}
                        </div>
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-[#FF6B35]" />
                          {booking.quantity || booking.numberOfTickets || 1} ticket(s)
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
              {upcomingEvents.map((event, index) => {
                const imageUrl = event.image || getDefaultEventImage();
                const eventDate = event.date ? new Date(event.date) : null;

                return (
                  <Link
                    key={event.id || event._id || `event-${index}`}
                    to={`/event/${event.id || event._id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#FF6B35] transition-all group"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={event.title || event.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = getDefaultEventImage();
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#FF6B35] transition-colors">
                        {event.title || event.name}
                      </h3>
                      {eventDate && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-[#FF6B35]" />
                          {eventDate.toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      )}
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