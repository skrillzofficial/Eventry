import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  TrendingUp,
  CheckCircle,
  XCircle,
  MoreVertical,
  Clock,
  AlertCircle,
  RefreshCw,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { eventAPI, apiCall, transactionAPI } from "../../services/api";
// ✅ FIXED: Import the correct function as default export
import createEventAfterPayment, {
  getPendingEventData,
  getPendingServiceFeePayment,
  storePendingEventData,
  clearPendingEventData,
} from "../../services/createEventAfterPayment";
import { toast } from "react-hot-toast";

const MyEvents = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [verifyingPayment, setVerifyingPayment] = useState(null);

  // Helper function to get price display from ticket types
  const getPriceDisplay = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = event.ticketTypes.map((t) => t.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === 0 && maxPrice === 0) {
        return { text: "Free", min: 0, max: 0, range: false };
      }

      if (minPrice === maxPrice) {
        return {
          text: minPrice === 0 ? "Free" : `₦${minPrice.toLocaleString()}`,
          min: minPrice,
          max: maxPrice,
          range: false,
        };
      }

      return {
        text: `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
        min: minPrice,
        max: maxPrice,
        range: true,
      };
    }

    // Legacy single price
    const price = event.price || 0;
    return {
      text: price === 0 ? "Free" : `₦${price.toLocaleString()}`,
      min: price,
      max: price,
      range: false,
    };
  };

  // Helper to calculate actual revenue from ticket types
  const calculateRevenue = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((total, ticket) => {
        const sold = ticket.sold || 0;
        const price = ticket.price || 0;
        return total + sold * price;
      }, 0);
    }

    const attendees =
      event.totalAttendees ||
      (Array.isArray(event.attendees) ? event.attendees.length : 0) ||
      event.ticketsSold ||
      0;
    const price = event.price || 0;
    return attendees * price;
  };

  // Load pending payments from localStorage
  const loadPendingPayments = () => {
    try {
      const pending = getPendingServiceFeePayment();
      if (pending) {
        setPendingPayments([pending]);
      } else {
        setPendingPayments([]);
      }
    } catch (err) {
      console.error("Error loading pending payments:", err);
      setPendingPayments([]);
    }
  };

  // ✅ FIXED: Manual payment verification using createEventAfterPayment
  const handleVerifyPayment = async (reference) => {
    if (!reference) {
      toast.error("No payment reference found");
      return;
    }

    setVerifyingPayment(reference);

    try {
      console.log("🔍 Manually verifying payment:", reference);

      // ✅ FIXED: Use createEventAfterPayment instead
      const result = await createEventAfterPayment(reference);

      if (result.success) {
        toast.success(result.message || "Event created successfully!", {
          duration: 5000,
          icon: "🎉",
        });

        // Remove from pending
        setPendingPayments([]);

        // Reload events
        await loadMyEvents();
        await loadOrganizerStats();

        // Navigate to event
        const eventId = result.event?._id || result.event?.id;
        if (eventId) {
          setTimeout(() => {
            navigate(`/event/${eventId}`);
          }, 1500);
        }
      } else {
        toast.error(result.error || "Failed to create event", {
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Error verifying payment. Please contact support.", {
        duration: 6000,
      });
    } finally {
      setVerifyingPayment(null);
    }
  };

  // ✅ FIXED: Payment callback handler using createEventAfterPayment
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const params = new URLSearchParams(location.search);
      const paymentStatus = params.get("payment");
      const reference = params.get("reference") || params.get("trxref");

      if (paymentStatus === "success" && reference) {
        console.log("🎯 Payment callback detected:", {
          paymentStatus,
          reference,
        });
        setProcessingPayment(true);

        try {
          // ✅ FIXED: Use createEventAfterPayment instead
          const result = await createEventAfterPayment(reference);

          if (result.success) {
            toast.success(
              result.message || "Event created and published successfully!",
              {
                duration: 5000,
                icon: "🎉",
              }
            );

            // Clean URL
            window.history.replaceState({}, "", "/dashboard/organizer/events");

            // Reload data
            await loadMyEvents();
            await loadOrganizerStats();
            loadPendingPayments();

            // Navigate to event
            const eventId = result.event?._id || result.event?.id;
            if (eventId) {
              setTimeout(() => {
                navigate(`/event/${eventId}`);
              }, 2000);
            }
          } else {
            toast.error(result.error || "Failed to create event", {
              duration: 6000,
            });

            window.history.replaceState({}, "", "/dashboard/organizer/events");
          }
        } catch (error) {
          console.error("Payment processing error:", error);
          toast.error(
            "Error creating event. Please use the 'Complete Payment' button below.",
            {
              duration: 8000,
            }
          );
          window.history.replaceState({}, "", "/dashboard/organizer/events");
        } finally {
          setProcessingPayment(false);
        }
      }
    };

    if (isAuthenticated && user?.role === "organizer") {
      handlePaymentCallback();
    }
  }, [location.search, isAuthenticated, user, navigate]);

  // Load events and pending payments
  useEffect(() => {
    if (isAuthenticated && user?.role === "organizer" && !processingPayment) {
      loadMyEvents();
      loadOrganizerStats();
      loadPendingPayments();
    }
  }, [isAuthenticated, user, processingPayment]);

  const loadMyEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(eventAPI.getOrganizerEvents);

      if (result.success) {
        const eventsData = result.data.events || result.data || [];
        setEvents(eventsData);
      } else {
        throw new Error(result.error || "Failed to load your events");
      }
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err?.message || "Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizerStats = async () => {
    try {
      const result = await apiCall(eventAPI.getOrganizerStatistics);
      if (result.success) {
        setStats(result.data.statistics || result.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const result = await apiCall(eventAPI.deleteEvent, eventId);

      if (result.success) {
        setEvents(
          events.filter(
            (event) => event._id !== eventId && event.id !== eventId
          )
        );
        setDeleteConfirm(null);
        loadOrganizerStats();
        toast.success("Event deleted successfully");
      } else {
        throw new Error(result.error || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err?.message || "Failed to delete event");
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await apiCall(eventAPI.cancelEvent, eventId);

      if (result.success) {
        setEvents(
          events.map((event) =>
            event._id === eventId || event.id === eventId
              ? { ...event, status: "cancelled" }
              : event
          )
        );
        loadOrganizerStats();
        toast.success("Event cancelled successfully");
      } else {
        throw new Error(result.error || "Failed to cancel event");
      }
    } catch (err) {
      console.error("Error cancelling event:", err);
      toast.error(err?.message || "Failed to cancel event");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const eventsByStatus = {
    all: events.length,
    published: events.filter((e) => e.status === "published").length,
    draft: events.filter((e) => e.status === "draft").length,
    cancelled: events.filter((e) => e.status === "cancelled").length,
  };

  if (!isAuthenticated || user?.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You need to be signed in as an organizer to view this page.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center text-[#FF6B35] font-semibold"
            >
              Sign in as Organizer
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const StatsCard = ({ title, value, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: { bg: "bg-blue-50", text: "text-blue-600" },
      green: { bg: "bg-green-50", text: "text-green-600" },
      purple: { bg: "bg-purple-50", text: "text-purple-600" },
      orange: { bg: "bg-orange-50", text: "text-orange-600" },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === "object" ? JSON.stringify(value) : value}
            </p>
          </div>
          <div className={`p-3 rounded-full ${colors.bg}`}>
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
        </div>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      published: {
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        text: "Published",
      },
      draft: {
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        text: "Draft",
      },
      cancelled: {
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        text: "Cancelled",
      },
      pending: {
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        text: "Pending Payment",
      },
    };

    const config = statusConfig[status] || {
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      text: status,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
      >
        {config.text}
      </span>
    );
  };

  // Pending Payment Card Component
  const PendingPaymentCard = ({ payment }) => {
    const isVerifying = verifyingPayment === payment.reference;

    return (
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Payment Pending
              </h3>
              <p className="text-sm text-gray-600">
                Complete your event creation
              </p>
            </div>
          </div>
          <StatusBadge status="pending" />
        </div>

        <div className="space-y-3 mb-4">
          <div className="bg-white bg-opacity-60 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Event Title
            </p>
            <p className="text-gray-900 font-semibold">
              {payment.eventData?.title || "Untitled Event"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Service Fee
              </p>
              <p className="text-gray-900 font-semibold flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-orange-600" />₦
                {payment.serviceFee?.toLocaleString() || "0"}
              </p>
            </div>

            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Payment Ref
              </p>
              <p className="text-gray-900 font-mono text-xs truncate">
                {payment.reference || "N/A"}
              </p>
            </div>
          </div>

          {payment.timestamp && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Initiated {new Date(payment.timestamp).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleVerifyPayment(payment.reference)}
            disabled={isVerifying}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Verifying...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Complete Payment
              </>
            )}
          </button>

          <button
            onClick={loadPendingPayments}
            className="px-4 py-3 border border-orange-300 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> Click "Complete Payment" to verify your
            payment and publish your event. If you've already paid, this will
            complete the event creation process.
          </p>
        </div>
      </div>
    );
  };

  const EventCard = ({ event }) => {
    const eventId = event._id || event.id;
    const eventDate = new Date(event.date);

    const priceInfo = getPriceDisplay(event);
    const revenue = calculateRevenue(event);

    const attendeesCount =
      event.totalAttendees ||
      (Array.isArray(event.attendees) ? event.attendees.length : 0) ||
      event.ticketsSold ||
      0;

    const capacity = event.capacity || 0;
    const fillPercentage = capacity > 0 ? (attendeesCount / capacity) * 100 : 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <StatusBadge status={event.status} />
                {event.featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
                {priceInfo.range && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.ticketTypes?.length} Ticket Types
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#FF6B35]" />
              <span>
                {eventDate.toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#FF6B35]" />
              <span className="truncate">
                {event.venue}, {event.city}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Attendance</span>
              <span>
                {attendeesCount} / {capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF6B35] h-2 rounded-full transition-all"
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦{Math.abs(revenue).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {priceInfo.range ? "Price Range" : "Price"}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {priceInfo.text}
              </p>
            </div>
          </div>

          {event.ticketTypes && event.ticketTypes.length > 1 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Ticket Types:
              </p>
              <div className="space-y-1">
                {event.ticketTypes.map((ticket, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs text-gray-600"
                  >
                    <span>{ticket.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        {ticket.sold || 0} sold
                      </span>
                      <span className="font-medium">
                        {ticket.price === 0
                          ? "Free"
                          : `₦${ticket.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Link
              to={`/event/${eventId}`}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>

            <Link
              to={`/organizer/events/edit/${eventId}`}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF6B35] hover:bg-[#FF8535]"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>

            {event.status !== "cancelled" && (
              <button
                onClick={() => handleCancelEvent(eventId)}
                className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}

            <button
              onClick={() => setDeleteConfirm(eventId)}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading || processingPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mb-4"></div>
          <p className="text-gray-900 font-medium">
            {processingPayment
              ? "Processing your payment and creating event..."
              : "Loading your events..."}
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
              <p className="text-gray-600 mt-2">
                Manage and track your events in one place
              </p>
            </div>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white font-semibold rounded-lg hover:bg-[#FF8535] transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create New Event
            </Link>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Events"
                value={stats.totalEvents || 0}
                icon={TrendingUp}
                color="blue"
              />
              <StatsCard
                title="Published"
                value={stats.publishedEvents || 0}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Total Revenue"
                value={`₦${(stats.totalRevenue || 0).toLocaleString()}`}
                icon={Users}
                color="purple"
              />
              <StatsCard
                title="Total Attendees"
                value={stats.totalAttendees || 0}
                icon={Users}
                color="orange"
              />
            </div>
          )}
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Pending Payments
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingPayments.map((payment, index) => (
                <PendingPaymentCard key={index} payment={payment} />
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: "All", count: eventsByStatus.all },
                {
                  key: "published",
                  label: "Published",
                  count: eventsByStatus.published,
                },
                { key: "draft", label: "Draft", count: eventsByStatus.draft },
                {
                  key: "cancelled",
                  label: "Cancelled",
                  count: eventsByStatus.cancelled,
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === filter.key
                      ? "bg-[#FF6B35] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {error ? (
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load events
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadMyEvents}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535]"
            >
              Try Again
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0
                ? "You haven't created any events yet. Get started by creating your first event!"
                : "No events match your current filters."}
            </p>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white font-semibold rounded-lg hover:bg-[#FF8535]"
            >
              <Plus className="h-5 w-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Event
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone and all associated data will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyEvents;