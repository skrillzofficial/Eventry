import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  TrendingUp,
  Ticket,
  Wallet,
  ArrowRight,
  Plus,
  Eye,
  BarChart3,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Sparkles,
  Loader,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { eventAPI, organizerAPI, apiCall } from "../services/api";

const OrganizerDashboard = () => {
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isOrganizer) {
      navigate("/discover");
      return;
    }

    loadOrganizerData();
  }, [isAuthenticated, isOrganizer, navigate]);

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get organizer statistics first (if your backend supports it)
      const statsResult = await apiCall(eventAPI.getOrganizerStatistics);

      if (statsResult.success && statsResult.data) {
        // Backend provides statistics directly
        const backendStats = statsResult.data;
        setStats({
          totalEvents: backendStats.totalEvents || 0,
          activeEvents: backendStats.activeEvents || 0,
          totalAttendees: backendStats.totalAttendees || 0,
          totalRevenue: backendStats.totalRevenue || 0,
          ticketsSold: backendStats.ticketsSold || 0,
          conversionRate: backendStats.conversionRate || 0,
          walletBalance:
            backendStats.availableBalance ||
            Math.round((backendStats.totalRevenue || 0) * 0.85),
          averageTicketPrice: backendStats.averageTicketPrice || 0,
          capacityUsage: backendStats.capacityUsage || 0,
        });

        // Also load events for display
        const eventsResult = await apiCall(organizerAPI.getMyEvents);
        if (eventsResult.success) {
          const events = eventsResult.data?.events || eventsResult.data || [];
          processAndDisplayEvents(events);
        }
      } else {
        // Fallback: Calculate statistics from events
        const result = await apiCall(organizerAPI.getMyEvents);

        if (result.success) {
          const events = result.data?.events || result.data || [];
          processAndDisplayEvents(events);
          calculateStatistics(events);
        } else {
          throw new Error(result.error || "Failed to load events");
        }
      }
    } catch (error) {
      console.error("Error loading organizer data:", error);
      setError(error.message || "Failed to load dashboard data");
      setStats({
        totalEvents: 0,
        activeEvents: 0,
        totalAttendees: 0,
        totalRevenue: 0,
        ticketsSold: 0,
        conversionRate: 0,
        walletBalance: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const processAndDisplayEvents = (events) => {
    const processedEvents = events.map((event) => ({
      ...event,
      id: event._id || event.id,
      attendees: event.ticketsSold || event.attendees || 0,
      revenue: (event.price || 0) * (event.ticketsSold || event.attendees || 0),
      ticketsSold: event.ticketsSold || event.attendees || 0,
      capacity: event.capacity || 100,
      location: `${event.venue || "TBA"}, ${event.city || "Nigeria"}`,
      status: determineEventStatus(event),
    }));

    setAllEvents(processedEvents);

    const today = new Date();
    const activeEvents = processedEvents.filter(
      (event) => new Date(event.date) >= today && event.status !== "cancelled"
    );

    setRecentEvents(processedEvents.slice(0, 5));
    setUpcomingEvents(activeEvents.slice(0, 3));

    const monthlyRevenue = generateMonthlyRevenue(processedEvents);
    setRevenueData(monthlyRevenue);
  };

  const calculateStatistics = (events) => {
    const processedEvents = events.map((event) => ({
      ...event,
      attendees: event.ticketsSold || event.attendees || 0,
      revenue: (event.price || 0) * (event.ticketsSold || event.attendees || 0),
    }));

    const today = new Date();
    const activeEvents = processedEvents.filter(
      (event) => new Date(event.date) >= today && event.status !== "cancelled"
    );

    const totalAttendees = processedEvents.reduce(
      (sum, event) => sum + (event.attendees || 0),
      0
    );
    const totalRevenue = processedEvents.reduce(
      (sum, event) => sum + (event.revenue || 0),
      0
    );

    const statsData = {
      totalEvents: processedEvents.length,
      activeEvents: activeEvents.length,
      completedEvents: processedEvents.length - activeEvents.length,
      totalAttendees: totalAttendees,
      totalRevenue: totalRevenue,
      ticketsSold: totalAttendees,
      conversionRate: calculateConversionRate(processedEvents),
      walletBalance: Math.round(totalRevenue * 0.85),
      averageTicketPrice:
        totalRevenue > 0 ? Math.round(totalRevenue / totalAttendees) : 0,
      capacityUsage: calculateAverageCapacity(processedEvents),
    };

    setStats(statsData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrganizerData();
    setRefreshing(false);
  };

  const determineEventStatus = (event) => {
    const eventDate = new Date(event.date);
    const today = new Date();

    if (event.status === "cancelled") return "cancelled";
    if (eventDate < today) return "completed";
    if ((event.ticketsSold || 0) >= (event.capacity || 100)) return "sold-out";
    return "active";
  };

  const calculateConversionRate = (events) => {
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity || 0), 0);
    const totalSold = events.reduce(
      (sum, e) => sum + (e.ticketsSold || e.attendees || 0),
      0
    );
    return totalCapacity > 0
      ? Math.round((totalSold / totalCapacity) * 100)
      : 0;
  };

  const calculateAverageCapacity = (events) => {
    if (events.length === 0) return 0;
    const avgCapacity =
      events.reduce((sum, e) => {
        const capacity = e.capacity || 100;
        const sold = e.ticketsSold || e.attendees || 0;
        return sum + (sold / capacity) * 100;
      }, 0) / events.length;
    return Math.round(avgCapacity);
  };

  const generateMonthlyRevenue = (events) => {
    const monthlyData = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[key] = 0;
    }

    events.forEach((event) => {
      const date = new Date(event.date);
      const monthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
      const revenue =
        (event.price || 0) * (event.ticketsSold || event.attendees || 0);

      if (monthlyData.hasOwnProperty(monthYear)) {
        monthlyData[monthYear] += revenue;
      }
    });

    return {
      labels: Object.keys(monthlyData),
      values: Object.values(monthlyData),
    };
  };

  const shareEvent = (event) => {
    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const text = `Check out my event: ${event.title}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(eventUrl)}`,
    };

    window.open(shareUrls.twitter, "_blank", "width=600,height=400");
  };

  const downloadEventReport = (event) => {
    const reportData = `
EVENT REPORT

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString()}
Location: ${event.location}

PERFORMANCE METRICS
-------------------------------------------
Tickets Sold: ${event.ticketsSold}
Capacity: ${event.capacity}
Capacity Usage: ${Math.round((event.ticketsSold / event.capacity) * 100)}%
Total Revenue: ₦${event.revenue?.toLocaleString()}
Ticket Price: ₦${event.price?.toLocaleString()}

STATUS: ${event.status.toUpperCase()}

Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([reportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `event-report-${event.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || !isOrganizer) {
    return (
      <div className="min-h-screen Organizerimg Blend-overlay">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center glass-morphism">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-300 mb-4">
              You need to be an organizer to access this dashboard.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition"
            >
              Back to Discover
            </Link>
          </div>
        </div>
        <div className="bg-[#FF6B35]">
          <Footer />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen Organizerimg Blend-overlay">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
        <div className="bg-[#FF6B35]">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen Organizerimg Blend-overlay">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-red-200 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  Organizer Dashboard
                </h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-xs font-medium text-white">
                    Pro Organizer
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                  title="Refresh data"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-white ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
              <p className="text-gray-300">
                Welcome back, {user?.name || user?.fullName || "Organizer"}!
                Manage your events and track performance.
              </p>
            </div>
            <Link
              to="/create-event"
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A2B] transition-all duration-200 hover:scale-105 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={stats.totalEvents || 0}
            icon={Calendar}
            change={
              stats.activeEvents > 0 ? `${stats.activeEvents} active` : null
            }
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents || 0}
            icon={Eye}
          />
          <StatCard
            title="Total Attendees"
            value={(stats.totalAttendees || 0).toLocaleString()}
            icon={Users}
            change={stats.totalAttendees > 0 ? "All time" : null}
          />
          <StatCard
            title="Total Revenue"
            value={`₦${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            change={
              stats.walletBalance > 0
                ? `₦${stats.walletBalance.toLocaleString()} available`
                : null
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <QuickActionsSection />
            <RevenueSection
              revenueData={revenueData}
              totalRevenue={stats.totalRevenue}
            />
            <EventsManagementSection
              events={recentEvents}
              onShareEvent={shareEvent}
              onDownloadReport={downloadEventReport}
            />
          </div>

          <div className="space-y-6">
            <UpcomingEventsSection events={upcomingEvents} />
            <BlockchainWalletSection
              balance={stats.walletBalance}
              totalEarned={stats.totalRevenue}
            />
            <PerformanceMetricsSection stats={stats} />
          </div>
        </div>
      </div>

      <div className="bg-[#FF6B35]">
        <Footer />
      </div>
    </div>
  );
};


const StatCard = ({ title, value, icon: Icon, change }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism hover:scale-105 transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {change && (
          <p className="text-sm text-green-400 flex items-center mt-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-[#FF6B35]/20 rounded-lg">
        <Icon className="h-6 w-6 text-[#FF6B35]" />
      </div>
    </div>
  </div>
);

const QuickActionsSection = () => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Link
        to="/create-event"
        className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Plus className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Create Event</span>
      </Link>
      <Link
        to="/dashboard/organizer/events"
        className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Calendar className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">My Events</span>
      </Link>
      <Link
        to="/discover"
        className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Users className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Browse Events</span>
      </Link>
      <Link
        to="/profile"
        className="flex flex-col items-center p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/20 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <BarChart3 className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-white">Profile</span>
      </Link>
    </div>
  </div>
);

const RevenueSection = ({ revenueData, totalRevenue }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <h3 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h3>
    {revenueData.values &&
    revenueData.values.length > 0 &&
    revenueData.values.some((v) => v > 0) ? (
      <>
        <div className="h-48 flex items-end space-x-2">
          {revenueData.values.map((value, index) => {
            const maxValue = Math.max(...revenueData.values, 1);
            const height = (value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group"
              >
                <div
                  className="w-full bg-[#FF6B35] rounded-t transition-all duration-300 hover:bg-[#FF8535] group-hover:scale-105 relative"
                  style={{
                    height: `${height}%`,
                    minHeight: value > 0 ? "10%" : "0",
                  }}
                  title={`₦${value.toLocaleString()}`}
                />
                <span className="text-xs text-gray-300 mt-2 group-hover:text-white transition-colors">
                  {revenueData.labels[index]}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-300">
            Monthly revenue distribution
          </span>
          <span className="text-sm font-semibold text-[#FF6B35]">
            Total: ₦{(totalRevenue || 0).toLocaleString()}
          </span>
        </div>
      </>
    ) : (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400">
        <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
        <p>No revenue data available yet</p>
        <Link
          to="/create-event"
          className="text-[#FF6B35] text-sm mt-2 hover:underline"
        >
          Create your first event
        </Link>
      </div>
    )}
  </div>
);

const EventsManagementSection = ({
  events,
  onShareEvent,
  onDownloadReport,
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Recent Events</h3>
      <Link
        to="/my-events"
        className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center transition-all duration-200 hover:scale-105"
      >
        View all <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onShare={() => onShareEvent(event)}
          onDownload={() => onDownloadReport(event)}
        />
      ))}
      {events.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">No events created yet</p>
          <Link
            to="/create-event"
            className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] text-sm font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create your first event
          </Link>
        </div>
      )}
    </div>
  </div>
);

const EventCard = ({ event, onShare, onDownload }) => {
  const getStatusColor = () => {
    switch (event.status) {
      case "active":
        return "bg-green-400/20 text-green-400";
      case "completed":
        return "bg-gray-400/20 text-gray-400";
      case "cancelled":
        return "bg-red-400/20 text-red-400";
      case "sold-out":
        return "bg-blue-400/20 text-blue-400";
      default:
        return "bg-[#FF6B35]/20 text-[#FF6B35]";
    }
  };

  const getStatusIcon = () => {
    switch (event.status) {
      case "active":
        return <Eye className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      case "sold-out":
        return <Ticket className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const capacityPercentage = (event.ticketsSold / event.capacity) * 100;

  return (
    <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-102">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <Link to={`/event/${event.id}`}>
              <h4 className="font-semibold text-white hover:text-[#FF6B35] transition-colors">
                {event.title}
              </h4>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-300 mt-1">
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-[#FF6B35]" />
                {event.location}
              </span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  capacityPercentage >= 80
                    ? "bg-green-400/20 text-green-400"
                    : capacityPercentage >= 50
                    ? "bg-yellow-400/20 text-yellow-400"
                    : "bg-red-400/20 text-red-400"
                }`}
              >
                {Math.round(capacityPercentage)}% full
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <div className="font-semibold text-white">
              {event.ticketsSold} tickets
            </div>
            <div className="text-gray-300">
              ₦{(event.revenue || 0).toLocaleString()}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onShare}
              className="p-2 text-gray-400 hover:text-[#FF6B35] transition-all duration-200 hover:scale-110"
              title="Share event"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 text-gray-400 hover:text-[#FF6B35] transition-all duration-200 hover:scale-110"
              title="Download report"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpcomingEventsSection = ({ events }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
      <Link
        to="/my-events"
        className="text-sm text-[#FF6B35] hover:text-[#FF8535] flex items-center transition-all duration-200 hover:scale-105"
      >
        View all <ArrowRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
    <div className="space-y-3">
      {events.map((event) => (
        <Link key={event.id} to={`/event/${event.id}`}>
          <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-all duration-200 hover:scale-102">
            <div className="flex-1">
              <p className="font-medium text-white text-sm">{event.title}</p>
              <p className="text-xs text-gray-300">
                {new Date(event.date).toLocaleDateString()} • {event.city}
              </p>
            </div>
            <span className="text-xs bg-[#FF6B35]/20 text-[#FF6B35] px-2 py-1 rounded-full">
              {event.ticketsSold} sold
            </span>
          </div>
        </Link>
      ))}
      {events.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p className="text-sm">No upcoming events</p>
          <Link
            to="/create-event"
            className="text-[#FF6B35] text-xs mt-1 inline-block hover:underline"
          >
            Create one now
          </Link>
        </div>
      )}
    </div>
  </div>
);

const BlockchainWalletSection = ({ balance, totalEarned }) => (
  <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl shadow-lg p-6 text-white">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold">Wallet Balance</h3>
      <Wallet className="h-6 w-6" />
    </div>
    <div className="mb-4">
      <p className="text-3xl font-bold">₦{(balance || 0).toLocaleString()}</p>
      <p className="text-white/80 text-sm">Available to withdraw</p>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/80">Total Earned</span>
        <span>₦{(totalEarned || 0).toLocaleString()}</span>
      </div>
    </div>
    <button className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg transition-all duration-200 hover:scale-105 font-medium flex items-center justify-center">
      <Download className="h-4 w-4 mr-2" />
      Withdraw Funds
    </button>
  </div>
);

const PerformanceMetricsSection = ({ stats }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
    <h3 className="text-lg font-semibold text-white mb-4">
      Performance Metrics
    </h3>
    <div className="space-y-4">
      <MetricItem
        label="Conversion Rate"
        value={`${stats.conversionRate || 0}%`}
        trend={stats.conversionRate > 50 ? "up" : "stable"}
      />
      <MetricItem
        label="Avg Ticket Price"
        value={`₦${(stats.averageTicketPrice || 0).toLocaleString()}`}
        trend="stable"
      />
      <MetricItem
        label="Capacity Usage"
        value={`${stats.capacityUsage || 0}%`}
        trend={stats.capacityUsage > 70 ? "up" : "stable"}
      />
      <MetricItem
        label="Total Events"
        value={stats.totalEvents || 0}
        trend={stats.activeEvents > 0 ? "up" : "stable"}
      />
    </div>
  </div>
);

const MetricItem = ({ label, value, trend }) => (
  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
    <span className="text-sm text-gray-300">{label}</span>
    <div className="flex items-center space-x-2">
      <span className="font-semibold text-white">{value}</span>
      <div
        className={`p-1 rounded ${
          trend === "up"
            ? "bg-green-400/20 text-green-400"
            : trend === "down"
            ? "bg-red-400/20 text-red-400"
            : "bg-gray-400/20 text-gray-400"
        }`}
      >
        <TrendingUp
          className={`h-3 w-3 ${trend === "down" ? "rotate-180" : ""} ${
            trend === "stable" ? "rotate-90" : ""
          }`}
        />
      </div>
    </div>
  </div>
);

export default OrganizerDashboard;
