import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  TrendingUp,
  Ticket,
  Wallet,
  ArrowRight,
  Plus,
  BarChart3,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import apiClient  from "../services/api"; // Import axios instance directly
import { toast } from "react-hot-toast";

const OrganizerDashboard = () => {
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // 🚀 DIRECT API CALL - Complete event after payment
  const completeEventAfterPayment = async (reference) => {
    try {
      const response = await apiClient.post(`/transactions/${reference}/complete-draft-event`);
      return {
        success: true,
        event: response.data.event,
        message: "Event created and published successfully!"
      };
    } catch (error) {
      console.error("Error completing event after payment:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create event after payment"
      };
    }
  };

  // Handle payment callback on mount
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const params = new URLSearchParams(location.search);
      const paymentStatus = params.get("payment");
      const reference = params.get("reference");

      if (paymentStatus === "success" && reference) {
        setProcessingPayment(true);
        try {
          const result = await completeEventAfterPayment(reference);
          if (result.success) {
            toast.success(result.message || "Event created successfully!", {
              duration: 5000,
              icon: "🎉",
            });
            window.history.replaceState({}, "", "/dashboard/organizer/events");
            setTimeout(() => {
              const eventId = result.event?._id || result.event?.id;
              if (eventId) {
                navigate(`/event/${eventId}`);
              } else {
                setProcessingPayment(false);
                loadOrganizerData();
              }
            }, 2000);
          } else {
            toast.error(result.error || "Failed to create event", { duration: 6000 });
            window.history.replaceState({}, "", "/dashboard/organizer/events");
            setProcessingPayment(false);
            loadOrganizerData();
          }
        } catch (error) {
          toast.error("Error creating event. Please contact support.", { duration: 6000 });
          window.history.replaceState({}, "", "/dashboard/organizer/events");
          setProcessingPayment(false);
          loadOrganizerData();
        }
      }
    };

    if (isAuthenticated && isOrganizer) {
      handlePaymentCallback();
    }
  }, [location.search, isAuthenticated, isOrganizer, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isOrganizer) {
      navigate("/discover");
      return;
    }

    if (!processingPayment) {
      loadOrganizerData();
    }
  }, [isAuthenticated, isOrganizer, navigate, processingPayment]);

  // 🚀 DIRECT API CALL - Load organizer data
  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load events
      const eventsResponse = await apiClient.get('/events/organizer/my-events');
      const events = eventsResponse.data?.events || eventsResponse.data || [];
      
      processAndDisplayEvents(events);
      calculateStatistics(events);
      
    } catch (error) {
      console.error("Error loading organizer data:", error);
      setError(error.response?.data?.message || "Failed to load dashboard data");
      setStats({
        totalEvents: 0,
        activeEvents: 0,
        totalAttendees: 0,
        totalRevenue: 0,
        walletBalance: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const processAndDisplayEvents = (events) => {
    const processedEvents = events.map((event) => {
      const ticketsSold = event.totalAttendees || 0;
      const revenue = event.totalRevenue || (event.price || 0) * ticketsSold;
      const capacity = event.capacity || 100;

      return {
        ...event,
        id: event._id || event.id,
        attendees: ticketsSold,
        revenue: revenue,
        ticketsSold: ticketsSold,
        capacity: capacity,
        location: `${event.venue || "TBA"}, ${event.city || "Nigeria"}`,
        status: determineEventStatus(event),
      };
    });

    setRecentEvents(processedEvents.slice(0, 5));
    const monthlyRevenue = generateMonthlyRevenue(processedEvents);
    setRevenueData(monthlyRevenue);
  };

  const calculateStatistics = (events) => {
    const totalEvents = events.length;
    const publishedEvents = events.filter(
      (event) => event.status === "published"
    ).length;

    const today = new Date();
    const activeEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && event.status === "published";
    }).length;

    const totalAttendees = events.reduce(
      (sum, event) => sum + (event.totalAttendees || 0),
      0
    );

    const totalRevenue = events.reduce(
      (sum, event) => sum + (event.totalRevenue || 0),
      0
    );

    const totalCapacity = events.reduce(
      (sum, event) => sum + (event.capacity || 0),
      0
    );
    const conversionRate =
      totalCapacity > 0
        ? Math.round((totalAttendees / totalCapacity) * 100)
        : 0;

    // Calculate pending approvals
    const pendingApprovals = events.filter(
      (event) => event.status === 'draft' || event.status === 'pending' || event.approvalStatus === 'pending'
    ).length;

    const statsData = {
      totalEvents: totalEvents,
      activeEvents: activeEvents,
      publishedEvents: publishedEvents,
      totalAttendees: totalAttendees,
      totalRevenue: totalRevenue,
      conversionRate: conversionRate,
      walletBalance: Math.round(totalRevenue * 0.85),
      pendingApprovals: pendingApprovals,
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
    if ((event.totalAttendees || 0) >= (event.capacity || 100))
      return "sold-out";
    return "active";
  };

  const generateMonthlyRevenue = (events) => {
    const monthlyData = {};
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
        event.totalRevenue || (event.price || 0) * (event.totalAttendees || 0);

      if (monthlyData.hasOwnProperty(monthYear)) {
        monthlyData[monthYear] += revenue;
      }
    });

    return {
      labels: Object.keys(monthlyData),
      values: Object.values(monthlyData),
    };
  };

  if (!isAuthenticated || !isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You need to be an organizer to access this dashboard.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A2B] transition"
            >
              Back to Discover
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading || processingPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-8 flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mb-4"></div>
          <p className="text-gray-900 font-medium">
            {processingPayment
              ? "Processing your payment and creating event..."
              : "Loading your dashboard..."}
          </p>
          {processingPayment && (
            <p className="text-gray-600 text-sm mt-2">
              Please wait, this may take a moment...
            </p>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto w-11/12 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <span className="px-3 py-1 bg-[#FF6B35] text-white text-xs font-medium rounded-full">
                  Organizer
                </span>
              </div>
              <p className="text-gray-600">
                Welcome back, {user?.name || user?.fullName || "Organizer"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
              <Link
                to="/events/create"
                className="bg-[#FF6B35] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#E55A2B] transition flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Events</span>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalEvents || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeEvents || 0} active
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Attendees</span>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalAttendees || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.conversionRate || 0}% conversion
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₦{(stats.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Wallet Balance</span>
              <Wallet className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₦{(stats.walletBalance || 0).toLocaleString()}
            </p>
            <Link
              to="/dashboard/wallet"
              className="text-xs text-[#FF6B35] hover:underline mt-1 inline-block"
            >
              Withdraw funds
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/events/create"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition group"
                >
                  <Plus className="h-6 w-6 text-[#FF6B35] group-hover:scale-110 transition" />
                  <span className="font-medium text-gray-900">Create Event</span>
                </Link>
                <Link
                  to="/dashboard/organizer/events"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition group"
                >
                  <Calendar className="h-6 w-6 text-[#FF6B35] group-hover:scale-110 transition" />
                  <span className="font-medium text-gray-900">My Events</span>
                </Link>
                <Link
                  to="/dashboard/wallet"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition group"
                >
                  <Wallet className="h-6 w-6 text-[#FF6B35] group-hover:scale-110 transition" />
                  <span className="font-medium text-gray-900">Wallet</span>
                </Link>
                <Link
                  to="/dashboard/approvals"
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition group relative"
                >
                  <CheckCircle className="h-6 w-6 text-[#FF6B35] group-hover:scale-110 transition" />
                  <span className="font-medium text-gray-900">Approvals</span>
                  {stats.pendingApprovals > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-3">
            {/* Simplified Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200 px-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                      activeTab === "overview"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                      activeTab === "analytics"
                        ? "border-[#FF6B35] text-[#FF6B35]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Analytics
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
                      <Link
                        to="/dashboard/organizer/events"
                        className="text-sm text-[#FF6B35] hover:text-[#E55A2B] flex items-center"
                      >
                        View all <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentEvents.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 mb-4">No events created yet</p>
                          <Link
                            to="/events/create"
                            className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] font-medium"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Create your first event
                          </Link>
                        </div>
                      ) : (
                        recentEvents.map((event) => (
                          <EventRow
                            key={event.id}
                            event={event}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    {/* Revenue Chart */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Revenue Over Time
                      </h3>
                      {revenueData.values &&
                      revenueData.values.length > 0 &&
                      revenueData.values.some((v) => v > 0) ? (
                        <div className="space-y-3">
                          {revenueData.labels.map((label, index) => {
                            const value = revenueData.values[index];
                            const maxValue = Math.max(...revenueData.values);
                            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

                            return (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">{label}</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    ₦{value.toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#FF6B35] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 mb-2">No revenue data available</p>
                          <Link
                            to="/events/create"
                            className="text-[#FF6B35] hover:underline text-sm"
                          >
                            Create your first event
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const EventRow = ({ event }) => {
  const getStatusStyle = () => {
    switch (event.status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "sold-out":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  const capacityPercentage = (event.ticketsSold / event.capacity) * 100;
  
  const needsApproval = event.status === 'draft' || event.status === 'pending' || event.approvalStatus === 'pending';

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-[#FF6B35] transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link to={`/event/${event.id}`}>
              <h4 className="font-semibold text-gray-900 hover:text-[#FF6B35] transition truncate">
                {event.title}
              </h4>
            </Link>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyle()}`}
            >
              {event.status}
            </span>
            {needsApproval && (
              <span
                className="px-2 py-1 rounded-md text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-200"
                title="Approval needed"
              >
                Needs Approval
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
              {event.location}
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-gray-400" />
              {event.ticketsSold} / {event.capacity} tickets
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Capacity</span>
              <span className="font-medium text-gray-700">
                {Math.round(capacityPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  capacityPercentage >= 80
                    ? "bg-green-500"
                    : capacityPercentage >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              ₦{(event.revenue || 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>

          <Link
            to={`/event/${event.id}`}
            className="px-4 py-2 text-sm font-medium text-[#FF6B35] hover:text-white hover:bg-[#FF6B35] border border-[#FF6B35] rounded-lg transition"
          >
            Manage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;