import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Ticket,
  Wallet,
  ArrowRight,
  Eye,
  MapPin,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { authAPI, eventAPI, transactionAPI, apiCall } from "../services/api";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [likedEvents, setLikedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch current user data
      const userResult = await apiCall(authAPI.getCurrentUser);
      if (!userResult.success) {
        throw new Error(userResult.error || "Failed to fetch user data");
      }

      const userData = userResult.data.data || userResult.data;
      setUser(userData);

      // Load attendee-specific data
      await Promise.all([
        loadBookingsData(),
        loadTransactionsData(),
        loadUpcomingEvents(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");

      if (
        error.message?.includes("log in") ||
        error.message?.includes("authentication")
      ) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsData = async () => {
    try {
      const bookingsResult = await apiCall(eventAPI.getMyBookings);
      console.log("Raw bookings result:", bookingsResult); // Debug log

      // Handle multiple possible response structures
      let bookings = [];

      if (bookingsResult.success) {
        // Try different paths where bookings might be located
        bookings =
          bookingsResult.data?.data?.bookings ||
          bookingsResult.data?.bookings ||
          bookingsResult.data?.data ||
          bookingsResult.data ||
          [];

        // Ensure bookings is an array
        if (!Array.isArray(bookings)) {
          console.warn("Bookings is not an array:", bookings);
          bookings = [];
        }
      }

      console.log("Processed bookings array:", bookings); // Debug log

      const today = new Date();

      // Filter attended events (past events) with null checks
      const attended = bookings
        .filter((booking) => {
          if (!booking || !booking.event) return false;
          const eventDate = new Date(
            booking.event.date || booking.event.startDate
          );
          return eventDate < today;
        })
        .map((b) => b.event);

      // Filter upcoming bookings with null checks
      const upcoming = bookings
        .filter((booking) => {
          if (!booking || !booking.event) return false;
          const eventDate = new Date(
            booking.event.date || booking.event.startDate
          );
          return eventDate >= today;
        })
        .map((b) => b.event);

      setMyBookings(bookings);
      setAttendedEvents(attended);

      // Update stats
      setStats((prev) => ({
        ...prev,
        eventsAttended: attended.length,
        upcomingBookings: upcoming.length,
        totalTickets: bookings.length,
      }));

      // Generate activity from bookings
      generateActivityFromBookings(bookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
      // Set empty arrays on error to prevent crashes
      setMyBookings([]);
      setAttendedEvents([]);
      setStats((prev) => ({
        ...prev,
        eventsAttended: 0,
        upcomingBookings: 0,
        totalTickets: 0,
      }));
    }
  };
  const loadTransactionsData = async () => {
    try {
      const transactionsResult = await apiCall(
        transactionAPI.getMyTransactions
      );
      const transactions = transactionsResult.success
        ? transactionsResult.data.data ||
          transactionsResult.data.transactions ||
          []
        : [];

      // Calculate wallet balance and spending
      const successfulTransactions = transactions.filter(
        (t) => t.status === "success" || t.status === "completed"
      );
      const totalSpent = successfulTransactions.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      );
      const walletBalance = Math.floor(Math.random() * 5000) + 1000;

      setStats((prev) => ({
        ...prev,
        walletBalance: walletBalance,
        totalSpent: totalSpent,
        transactions: transactions.length,
      }));
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  const loadUpcomingEvents = async () => {
    try {
      const result = await apiCall(eventAPI.getUpcomingEvents);
      if (result.success) {
        const events = result.data.data || result.data.events || [];
        setUpcomingEvents(events.slice(0, 4));
      }
    } catch (error) {
      console.error("Error loading upcoming events:", error);
    }
  };

  const generateActivityFromBookings = (bookings) => {
    const activities = [];
    const sortedBookings = [...bookings].sort(
      (a, b) =>
        new Date(b.createdAt || b.bookingDate) -
        new Date(a.createdAt || a.bookingDate)
    );

    // Recent ticket purchase
    if (sortedBookings.length > 0) {
      const recent = sortedBookings[0];
      activities.push({
        id: 1,
        icon: Ticket,
        title: "Ticket Purchased",
        description:
          recent.event?.title || recent.event?.name || "Event Ticket",
        time: formatTimeAgo(recent.createdAt || recent.bookingDate),
        type: "purchase",
      });
    }

    // Recent event attendance
    const attended = sortedBookings.filter(
      (b) => b.event && new Date(b.event.date || b.event.startDate) < new Date()
    );
    if (attended.length > 0) {
      activities.push({
        id: 2,
        icon: CheckCircle,
        title: "Event Attended",
        description: attended[0].event?.title || attended[0].event?.name,
        time: formatTimeAgo(
          attended[0].event?.date || attended[0].event?.startDate
        ),
        type: "attendance",
      });
    }

    // Upcoming event reminder
    const upcoming = sortedBookings.filter(
      (b) => b.event && new Date(b.event.date || b.event.startDate) > new Date()
    );
    if (upcoming.length > 0) {
      activities.push({
        id: 3,
        icon: Calendar,
        title: "Upcoming Event",
        description: `${
          upcoming[0].event?.title || upcoming[0].event?.name
        } is coming soon`,
        time: formatTimeAgo(
          upcoming[0].event?.date || upcoming[0].event?.startDate
        ),
        type: "reminder",
      });
    }

    // Wallet activity
    activities.push({
      id: 4,
      icon: Wallet,
      title: "Wallet Activity",
      description: `₦${(stats.walletBalance || 0).toLocaleString()} available`,
      time: "Current balance",
      type: "wallet",
    });

    setRecentActivity(activities);
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Recently";

    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    if (past > now) {
      const futureDiff = Math.floor((past - now) / 1000);
      if (futureDiff < 86400) return "Today";
      if (futureDiff < 172800) return "Tomorrow";
      return `In ${Math.floor(futureDiff / 86400)} days`;
    }

    return past.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 w-11/12 mx-auto container py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
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
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
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

  const userName = user?.fullName || user?.firstName || user?.name || "User";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 w-11/12 mx-auto container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35]/10 rounded-full text-[#FF6B35] text-sm mb-4">
            Welcome Back!
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, <span className="text-[#FF6B35]">{userName}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Discover amazing events and manage your tickets seamlessly
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Events Attended"
            value={stats.eventsAttended || 0}
            icon={CheckCircle}
            iconColor="bg-green-500"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingBookings || 0}
            icon={Calendar}
            iconColor="bg-blue-500"
          />
          <StatCard
            title="My Tickets"
            value={stats.totalTickets || 0}
            icon={Ticket}
            iconColor="bg-purple-500"
          />
          <StatCard
            title="Wallet Balance"
            value={`₦${(stats.walletBalance || 0).toLocaleString()}`}
            icon={Wallet}
            iconColor="bg-[#FF6B35]"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <QuickActionsSection />

            {/* Recent Activity */}
            <ActivitySection activities={recentActivity} />

            {/* My Event History */}
            <EventHistorySection events={attendedEvents} />
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            <UpcomingBookingsSection bookings={myBookings} />

            {/* Discover New Events */}
            <DiscoverEventsSection events={upcomingEvents} />

            {/* Blockchain Features */}
            <BlockchainFeaturesSection />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, iconColor }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div
        className={`p-3 ${iconColor} rounded-lg group-hover:scale-110 transition-transform`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// Quick Actions Section
const QuickActionsSection = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link
        to="/discover"
        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all group"
      >
        <div className="p-3 bg-[#FF6B35] rounded-lg mr-4 group-hover:scale-110 transition-transform">
          <Eye className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Discover Events</p>
          <p className="text-sm text-gray-600">Find new experiences</p>
        </div>
      </Link>

      <Link
        to="/my-tickets"
        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all group"
      >
        <div className="p-3 bg-purple-500 rounded-lg mr-4 group-hover:scale-110 transition-transform">
          <Ticket className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">My Tickets</p>
          <p className="text-sm text-gray-600">View all tickets</p>
        </div>
      </Link>

      <Link
        to="/dashboard/wallet"
        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all group"
      >
        <div className="p-3 bg-green-500 rounded-lg mr-4 group-hover:scale-110 transition-transform">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Top Up Wallet</p>
          <p className="text-sm text-gray-600">Add funds</p>
        </div>
      </Link>

      <Link
        to="/dashboard/profile"
        className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all group"
      >
        <div className="p-3 bg-blue-500 rounded-lg mr-4 group-hover:scale-110 transition-transform">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Profile Settings</p>
          <p className="text-sm text-gray-600">Update profile</p>
        </div>
      </Link>
    </div>
  </div>
);

// Activity Section
const ActivitySection = ({ activities }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <Link
        to="/activity"
        className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group"
      >
        View all{" "}
        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-3">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <ActivityItem
            key={activity.id}
            icon={activity.icon}
            title={activity.title}
            description={activity.description}
            time={activity.time}
            type={activity.type}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
          <Link
            to="/discover"
            className="text-[#FF6B35] hover:text-[#FF8535] text-sm mt-2 inline-block"
          >
            Start discovering events
          </Link>
        </div>
      )}
    </div>
  </div>
);

// Event History Section
const EventHistorySection = ({ events }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">My Event History</h3>
      <Link
        to="/my-events"
        className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group"
      >
        View all{" "}
        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-3">
      {events.length > 0 ? (
        events
          .slice(0, 3)
          .map((event) => (
            <EventHistoryItem key={event._id || event.id} event={event} />
          ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No events attended yet</p>
          <Link
            to="/discover"
            className="text-[#FF6B35] hover:text-[#FF8535] text-sm mt-2 inline-block"
          >
            Discover events near you
          </Link>
        </div>
      )}
    </div>
  </div>
);

// Upcoming Bookings Section
const UpcomingBookingsSection = ({ bookings }) => {
  const today = new Date();
  const upcomingBookings = bookings
    .filter(
      (booking) =>
        booking.event &&
        new Date(booking.event.date || booking.event.startDate) >= today
    )
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          My Upcoming Events
        </h3>
      </div>
      <div className="space-y-3">
        {upcomingBookings.length > 0 ? (
          upcomingBookings.map((booking, index) => (
            <UpcomingBookingItem
              key={booking._id || booking.id || `booking-${index}`}
              booking={booking}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Ticket className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
            <Link
              to="/discover"
              className="text-[#FF6B35] hover:text-[#FF8535] text-sm mt-2 inline-block"
            >
              Book tickets now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Discover Events Section
const DiscoverEventsSection = ({ events }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Discover Events</h3>
      <Link
        to="/discover"
        className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center group"
      >
        View all{" "}
        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="space-y-3">
      {events.length > 0 ? (
        events.map((event) => (
          <DiscoverEventItem key={event._id || event.id} event={event} />
        ))
      ) : (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No events available</p>
        </div>
      )}
    </div>
  </div>
);

// Blockchain Features Section
const BlockchainFeaturesSection = () => (
  <div className="bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-2xl shadow-sm p-6 text-white">
    <h3 className="text-lg font-semibold mb-4">🔗 Blockchain Features</h3>
    <div className="space-y-3">
      <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm">Secure Digital Wallet</p>
          <p className="text-xs opacity-90">Store & manage funds safely</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm">NFT Tickets</p>
          <p className="text-xs opacity-90">Verified digital ownership</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <CheckCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-sm">Instant Verification</p>
          <p className="text-xs opacity-90">QR code check-in</p>
        </div>
      </div>
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ icon: Icon, title, description, time, type }) => (
  <div className="flex items-start space-x-3 hover:bg-gray-50 p-3 rounded-lg transition-all group">
    <div
      className={`p-2 rounded-lg ${
        type === "purchase"
          ? "bg-green-500/20"
          : type === "attendance"
          ? "bg-blue-500/20"
          : type === "reminder"
          ? "bg-purple-500/20"
          : "bg-orange-500/20"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          type === "purchase"
            ? "text-green-600"
            : type === "attendance"
            ? "text-blue-600"
            : type === "reminder"
            ? "text-purple-600"
            : "text-orange-600"
        }`}
      />
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900 text-sm">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
  </div>
);

// Event History Item Component
const EventHistoryItem = ({ event }) => {
  const imageUrl =
    event.images?.[0] ||
    event.image ||
    event.imageUrl ||
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

  return (
    <Link to={`/event/${event._id || event.id}`}>
      <div className="flex items-center space-x-3 hover:bg-gray-50 p-3 rounded-lg transition-all group">
        <img
          src={imageUrl}
          alt={event.title || event.name}
          className="w-16 h-16 rounded-lg object-cover"
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm group-hover:text-[#FF6B35] transition-colors">
            {event.title || event.name}
          </p>
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(event.date || event.startDate).toLocaleDateString(
              "en-NG",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            )}
          </div>
          <div className="flex items-center text-xs text-green-600 mt-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Attended
          </div>
        </div>
      </div>
    </Link>
  );
};

// Upcoming Booking Item Component
const UpcomingBookingItem = ({ booking }) => {
  const event = booking.event;
  if (!event) return null;

  return (
    <Link to={`/my-tickets/${booking._id || booking.id}`}>
      <div className="p-3 border border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all group">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-gray-900 text-sm group-hover:text-[#FF6B35] transition-colors line-clamp-1">
            {event.title || event.name}
          </p>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            Upcoming
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-600 space-x-3">
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(event.date || event.startDate).toLocaleDateString(
              "en-NG",
              {
                month: "short",
                day: "numeric",
              }
            )}
          </span>
          <span className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {event.city || event.location?.city || event.venue}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {booking.numberOfTickets || 1} ticket(s)
          </span>
          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#FF6B35] group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

// Discover Event Item Component
const DiscoverEventItem = ({ event }) => (
  <Link to={`/event/${event._id || event.id}`}>
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all group">
      <div className="flex-1">
        <p className="font-medium text-gray-900 text-sm group-hover:text-[#FF6B35] transition-colors line-clamp-1">
          {event.title || event.name}
        </p>
        <p className="text-xs text-gray-600 flex items-center mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(event.date || event.startDate).toLocaleDateString("en-NG", {
            month: "short",
            day: "numeric",
          })}
          <span className="mx-1">•</span>
          <MapPin className="h-3 w-3 mr-1" />
          {event.city || event.location?.city || "Lagos"}
        </p>
      </div>
      <span className="text-xs bg-[#FF6B35] text-white px-3 py-1 rounded-full group-hover:bg-[#FF8535] transition-colors">
        View
      </span>
    </div>
  </Link>
);

export default UserProfile;
