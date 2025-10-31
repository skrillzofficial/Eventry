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
  Eye,
  BarChart3,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  RefreshCw,
  Loader,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { eventAPI, apiCall } from "../services/api";
import { createEventAfterPayment } from "../services/createEventAfterPayment";
import { toast } from "react-hot-toast";

const OrganizerDashboard = () => {
  const { user, isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [revenueData, setRevenueData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Handle payment callback on mount
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const params = new URLSearchParams(location.search);
      const paymentStatus = params.get("payment");
      const reference = params.get("reference");

      if (paymentStatus === "success" && reference) {
        console.log("🎯 Payment callback detected:", { paymentStatus, reference });
        console.log("📦 Full URL params:", Object.fromEntries(params.entries()));
        setProcessingPayment(true);

        try {
          console.log("🚀 Calling createEventAfterPayment with reference:", reference);
          
          // Call the utility function to create event after payment
          const result = await createEventAfterPayment(reference);

          console.log("✅ createEventAfterPayment result:", result);

          if (result.success) {
            console.log("🎉 Event created successfully:", result.event);
            
            toast.success(result.message || "Event created successfully!", {
              duration: 5000,
              icon: "🎉",
            });

            // Clean URL
            window.history.replaceState({}, "", "/dashboard/organizer/events");

            // Wait a moment for user to see success message
            setTimeout(() => {
              // Redirect to the new event page
              const eventId = result.event?._id || result.event?.id;
              console.log("🔄 Redirecting to event:", eventId);
              
              if (eventId) {
                navigate(`/event/${eventId}`);
              } else {
                console.warn("⚠️ No event ID found, reloading dashboard");
                setProcessingPayment(false);
                loadOrganizerData();
              }
            }, 2000);
          } else {
            console.error("❌ Event creation failed:", result.error);
            
            toast.error(result.error || "Failed to create event", {
              duration: 6000,
            });
            
            // Clean URL even on error
            window.history.replaceState({}, "", "/dashboard/organizer/events");
            setProcessingPayment(false);
            
            // Still try to load dashboard
            loadOrganizerData();
          }
        } catch (error) {
          console.error("💥 Error processing payment callback:", error);
          console.error("Error stack:", error.stack);
          
          toast.error("Error creating event. Please contact support.", {
            duration: 6000,
          });
          
          window.history.replaceState({}, "", "/dashboard/organizer/events");
          setProcessingPayment(false);
          
          // Still try to load dashboard
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

    // Only load data if not processing payment
    if (!processingPayment) {
      loadOrganizerData();
    }
  }, [isAuthenticated, isOrganizer, navigate, processingPayment]);

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📊 Starting to load organizer data...");

      const result = await apiCall(eventAPI.getOrganizerEvents);
      console.log("✅ API Response:", result);

      if (result.success) {
        const events = result.data?.events || result.data || [];
        console.log("📅 Events loaded:", events.length);

        if (events.length > 0) {
          console.log("📋 Events status breakdown:");
          events.forEach((event, index) => {
            console.log(
              `  ${index + 1}. "${event.title}" - Status: "${event.status}" - Date: ${event.date}`
            );
          });
        }

        processAndDisplayEvents(events);
        calculateStatistics(events);
      } else {
        console.log("❌ API call failed:", result.error);
        throw new Error(result.error || "Failed to load events");
      }
    } catch (error) {
      console.error("💥 Error loading organizer data:", error);
      setError(error.message || "Failed to load dashboard data");
      setStats({
        totalEvents: 0,
        activeEvents: 0,
        publishedEvents: 0,
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
    console.log("🔄 Processing events for display:", events.length, "events");

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

    console.log("✨ Processed events:", processedEvents);

    setAllEvents(processedEvents);
    setRecentEvents(processedEvents.slice(0, 5));

    const monthlyRevenue = generateMonthlyRevenue(processedEvents);
    setRevenueData(monthlyRevenue);
  };

  const calculateStatistics = (events) => {
    console.log("🧮 Calculating statistics from", events.length, "events");

    const totalEvents = events.length;

    const publishedEvents = events.filter(
      (event) => event.status === "published"
    ).length;

    const today = new Date();
    const activeEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && event.status === "published";
    }).length;

    const completedEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate < today && event.status === "published";
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
      totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 0;

    const capacityUsage =
      events.length > 0
        ? Math.round(
            events.reduce((sum, event) => {
              const capacity = event.capacity || 100;
              const sold = event.totalAttendees || 0;
              return sum + (sold / capacity) * 100;
            }, 0) / events.length
          )
        : 0;

    const averageTicketPrice =
      totalAttendees > 0 ? Math.round(totalRevenue / totalAttendees) : 0;

    const statsData = {
      totalEvents: totalEvents,
      activeEvents: activeEvents,
      publishedEvents: publishedEvents,
      completedEvents: completedEvents,
      totalAttendees: totalAttendees,
      totalRevenue: totalRevenue,
      ticketsSold: totalAttendees,
      conversionRate: conversionRate,
      walletBalance: Math.round(totalRevenue * 0.85),
      averageTicketPrice: averageTicketPrice,
      capacityUsage: capacityUsage,
    };

    console.log("📈 Final statistics:", statsData);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
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

  if (loading || processingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center h-96">
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
        <div className="bg-[#FF6B35]">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 flex items-center">
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
                <h1 className="text-3xl font-bold text-gray-900">
                  Organizer Dashboard
                </h1>
                <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] rounded-full">
                  <span className="text-xs font-medium text-white">
                    Organizer
                  </span>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition shadow-sm"
                  title="Refresh data"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-gray-700 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
              <p className="text-gray-600">
                Welcome back, {user?.name || user?.fullName || "Organizer"}!
                Manage your events and track performance.
              </p>
            </div>
            <Link
              to="/create-event"
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E55A2B] transition-all duration-200 hover:scale-105 flex items-center shadow-lg"
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
              stats.publishedEvents > 0
                ? `${stats.publishedEvents} published`
                : null
            }
          />
          <StatCard
            title="Published Events"
            value={stats.publishedEvents || 0}
            icon={CheckCircle}
            change={
              stats.totalEvents > 0
                ? `${Math.round(
                    (stats.publishedEvents / stats.totalEvents) * 100
                  )}% published`
                : null
            }
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents || 0}
            icon={Eye}
            change={
              stats.publishedEvents > 0
                ? `${Math.round(
                    (stats.activeEvents / stats.publishedEvents) * 100
                  )}% active`
                : null
            }
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
            <EventsManagementSection
              events={recentEvents}
              onShareEvent={shareEvent}
              onDownloadReport={downloadEventReport}
            />
          </div>

          <div className="space-y-6">
            <BlockchainWalletSection
              balance={stats.walletBalance}
              totalEarned={stats.totalRevenue}
            />
            <RevenueSection
              revenueData={revenueData}
              totalRevenue={stats.totalRevenue}
            />
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
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-[#FF6B35]/10 rounded-lg">
        <Icon className="h-6 w-6 text-[#FF6B35]" />
      </div>
    </div>
  </div>
);

const QuickActionsSection = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Link
        to="/create-event"
        className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Plus className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-gray-900">Create Event</span>
      </Link>
      <Link
        to="/dashboard/organizer/events"
        className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Calendar className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-gray-900">My Events</span>
      </Link>
      <Link
        to="/discover"
        className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Users className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-gray-900">
          Browse Events
        </span>
      </Link>
      <Link
        to="/dashboard/wallet"
        className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-105 group"
      >
        <div className="p-3 bg-[#FF6B35]/10 rounded-lg mb-2 group-hover:scale-110 transition-transform">
          <Wallet className="h-6 w-6 text-[#FF6B35]" />
        </div>
        <span className="text-sm font-medium text-gray-900">Wallet</span>
      </Link>
    </div>
  </div>
);

const RevenueSection = ({ revenueData, totalRevenue }) => {
  const colors = [
    "#FF6B35",
    "#FF8535",
    "#FFA059",
    "#FFBA7D",
    "#FFD5A1",
    "#FFE8C8",
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue Analytics
      </h3>
      {revenueData.values &&
      revenueData.values.length > 0 &&
      revenueData.values.some((v) => v > 0) ? (
        <>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="transform -rotate-90">
                {(() => {
                  const total = revenueData.values.reduce(
                    (sum, val) => sum + val,
                    0
                  );
                  let currentAngle = 0;

                  return revenueData.values.map((value, index) => {
                    if (value === 0) return null;

                    const percentage = (value / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const radius = 80;
                    const centerX = 100;
                    const centerY = 100;

                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;

                    const x1 =
                      centerX + radius * Math.cos((Math.PI * startAngle) / 180);
                    const y1 =
                      centerY + radius * Math.sin((Math.PI * startAngle) / 180);
                    const x2 =
                      centerX + radius * Math.cos((Math.PI * endAngle) / 180);
                    const y2 =
                      centerY + radius * Math.sin((Math.PI * endAngle) / 180);

                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const pathData = [
                      `M ${centerX} ${centerY}`,
                      `L ${x1} ${y1}`,
                      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      "Z",
                    ].join(" ");

                    currentAngle += angle;

                    return (
                      <path
                        key={index}
                        d={pathData}
                        fill={colors[index % colors.length]}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        title={`${
                          revenueData.labels[index]
                        }: ₦${value.toLocaleString()}`}
                      />
                    );
                  });
                })()}
                <circle cx="100" cy="100" r="50" fill="white" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₦{(totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {revenueData.labels.map((label, index) => {
              if (revenueData.values[index] === 0) return null;
              const percentage = (
                (revenueData.values[index] /
                  revenueData.values.reduce((sum, val) => sum + val, 0)) *
                100
              ).toFixed(1);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <span className="text-gray-600">{label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      ₦{revenueData.values[index].toLocaleString()}
                    </span>
                    <span className="text-gray-500 ml-2">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
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
};

const EventsManagementSection = ({
  events,
  onShareEvent,
  onDownloadReport,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
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
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "sold-out":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-orange-100 text-orange-700";
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
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:shadow-md">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <Link to={`/event/${event.id}`}>
              <h4 className="font-semibold text-gray-900 hover:text-[#FF6B35] transition-colors">
                {event.title}
              </h4>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-[#FF6B35]" />
                {event.location}
              </span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  capacityPercentage >= 80
                    ? "bg-green-100 text-green-700"
                    : capacityPercentage >= 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
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
            <div className="font-semibold text-gray-900">
              {event.ticketsSold} tickets
            </div>
            <div className="text-gray-600">
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

export default OrganizerDashboard;