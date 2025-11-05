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
  UserCheck,
  Clock,
  UserX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import apiClient from "../../services/api"; // Import axios instance directly
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
  
  // Approval system states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [approvalFilter, setApprovalFilter] = useState("all");

  // Helper function to get price display from ticket types
  const getPriceDisplay = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = event.ticketTypes.map(t => t.price);
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
          range: false
        };
      }
      
      return { 
        text: `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
        min: minPrice,
        max: maxPrice,
        range: true
      };
    }
    
    // Legacy single price
    const price = event.price || 0;
    return { 
      text: price === 0 ? "Free" : `₦${price.toLocaleString()}`,
      min: price,
      max: price,
      range: false
    };
  };

  // Helper to calculate actual revenue from ticket types
  const calculateRevenue = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((total, ticket) => {
        const sold = ticket.sold || 0;
        const price = ticket.price || 0;
        return total + (sold * price);
      }, 0);
    }
    
    const attendees = event.totalAttendees || 
                     (Array.isArray(event.attendees) ? event.attendees.length : 0) || 
                     event.ticketsSold || 
                     0;
    const price = event.price || 0;
    return attendees * price;
  };

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

  // Payment callback handler
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const params = new URLSearchParams(location.search);
      const paymentStatus = params.get("payment");
      const reference = params.get("reference") || params.get("trxref");

      if (paymentStatus === "success" && reference) {
        setProcessingPayment(true);
        try {
          const result = await completeEventAfterPayment(reference);
          if (result.success) {
            toast.success(result.message || "Event created and published successfully!", {
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
                loadMyEvents();
                loadOrganizerStats();
              }
            }, 2000);
          } else {
            toast.error(result.error || "Failed to create event", { duration: 6000 });
            window.history.replaceState({}, "", "/dashboard/organizer/events");
            setProcessingPayment(false);
            loadMyEvents();
            loadOrganizerStats();
          }
        } catch (error) {
          toast.error("Error creating event. Please contact support.", { duration: 6000 });
          window.history.replaceState({}, "", "/dashboard/organizer/events");
          setProcessingPayment(false);
          loadMyEvents();
          loadOrganizerStats();
        }
      }
    };

    if (isAuthenticated && user?.role === "organizer") {
      handlePaymentCallback();
    }
  }, [location.search, isAuthenticated, user, navigate]);

  // 🚀 DIRECT API CALL - Load events
  const loadMyEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events/organizer/my-events');
      const eventsData = response.data.events || response.data || [];
      setEvents(eventsData);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(err.response?.data?.message || "Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 DIRECT API CALL - Load organizer stats
  const loadOrganizerStats = async () => {
    try {
      const response = await apiClient.get('/events/organizer/statistics');
      setStats(response.data.statistics || response.data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  // 🚀 DIRECT API CALL - Load attendees for approval management
  const loadEventAttendees = async (eventId) => {
    setLoadingAttendees(true);
    try {
      const response = await apiClient.get(`/events/${eventId}/attendees`);
      setAttendees(response.data.attendees || response.data || []);
      setSelectedEvent(events.find(e => e._id === eventId || e.id === eventId));
    } catch (err) {
      console.error("Error loading attendees:", err);
      toast.error(err.response?.data?.message || "Failed to load attendees");
    } finally {
      setLoadingAttendees(false);
    }
  };

  // 🚀 DIRECT API CALL - Handle attendee approval
  const handleApproveAttendee = async (attendeeId) => {
    try {
      const response = await apiClient.post(`/events/${selectedEvent._id}/attendees/${attendeeId}/approve`);
      setAttendees(attendees.map(attendee => 
        attendee._id === attendeeId ? { ...attendee, status: 'approved' } : attendee
      ));
      toast.success("Attendee approved successfully");
    } catch (err) {
      console.error("Error approving attendee:", err);
      toast.error(err.response?.data?.message || "Failed to approve attendee");
    }
  };

  // 🚀 DIRECT API CALL - Handle attendee rejection
  const handleRejectAttendee = async (attendeeId) => {
    try {
      const response = await apiClient.post(`/events/${selectedEvent._id}/attendees/${attendeeId}/reject`);
      setAttendees(attendees.map(attendee => 
        attendee._id === attendeeId ? { ...attendee, status: 'rejected' } : attendee
      ));
      toast.success("Attendee rejected successfully");
    } catch (err) {
      console.error("Error rejecting attendee:", err);
      toast.error(err.response?.data?.message || "Failed to reject attendee");
    }
  };

  // 🚀 DIRECT API CALL - Bulk approve attendees
  const handleBulkApprove = async () => {
    const pendingAttendees = attendees.filter(a => a.status === 'pending');
    if (pendingAttendees.length === 0) {
      toast.error("No pending attendees to approve");
      return;
    }

    try {
      const response = await apiClient.post(`/events/${selectedEvent._id}/attendees/bulk-approve`);
      setAttendees(attendees.map(attendee => 
        attendee.status === 'pending' ? { ...attendee, status: 'approved' } : attendee
      ));
      toast.success(`Approved ${pendingAttendees.length} attendees`);
    } catch (err) {
      console.error("Error bulk approving:", err);
      toast.error(err.response?.data?.message || "Failed to approve attendees");
    }
  };

  // 🚀 DIRECT API CALL - Delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      await apiClient.delete(`/events/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId && event.id !== eventId));
      setDeleteConfirm(null);
      loadOrganizerStats();
      toast.success("Event deleted successfully");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  // 🚀 DIRECT API CALL - Cancel event
  const handleCancelEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this event? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.patch(`/events/${eventId}/cancel`);
      setEvents(events.map(event => 
        (event._id === eventId || event.id === eventId) ? { ...event, status: "cancelled" } : event
      ));
      loadOrganizerStats();
      toast.success("Event cancelled successfully");
    } catch (err) {
      console.error("Error cancelling event:", err);
      toast.error(err.response?.data?.message || "Failed to cancel event");
    }
  };

  // Load events on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === "organizer" && !processingPayment) {
      loadMyEvents();
      loadOrganizerStats();
    }
  }, [isAuthenticated, user, processingPayment]);

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter attendees for approval modal
  const filteredAttendees = attendees.filter(attendee => {
    if (approvalFilter === "all") return true;
    return attendee.status === approvalFilter;
  });

  const eventsByStatus = {
    all: events.length,
    published: events.filter(e => e.status === "published").length,
    draft: events.filter(e => e.status === "draft").length,
    cancelled: events.filter(e => e.status === "cancelled").length,
  };

  // Get pending approvals count for an event
  const getPendingApprovalsCount = (event) => {
    if (!event.attendees) return 0;
    return event.attendees.filter(a => a.status === 'pending').length;
  };

  // Check if event requires approval
  const requiresApproval = (event) => {
    const priceInfo = getPriceDisplay(event);
    return priceInfo.min === 0 && priceInfo.max === 0 && event.requiresApproval;
  };

  if (!isAuthenticated || user?.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-20">
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
      blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof value === 'object' ? JSON.stringify(value) : value}
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
      published: { bgColor: "bg-green-100", textColor: "text-green-800", text: "Published" },
      draft: { bgColor: "bg-yellow-100", textColor: "text-yellow-800", text: "Draft" },
      cancelled: { bgColor: "bg-red-100", textColor: "text-red-800", text: "Cancelled" },
    };

    const config = statusConfig[status] || { bgColor: "bg-gray-100", textColor: "text-gray-800", text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.text}
      </span>
    );
  };

  const ApprovalBadge = ({ event }) => {
    const pendingCount = getPendingApprovalsCount(event);
    if (!requiresApproval(event) || pendingCount === 0) return null;

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
        <Clock className="h-3 w-3 mr-1" />
        {pendingCount} pending
      </span>
    );
  };

  const EventCard = ({ event }) => {
    const eventId = event._id || event.id;
    const eventDate = new Date(event.date);
    const priceInfo = getPriceDisplay(event);
    const revenue = calculateRevenue(event);
    const attendeesCount = event.totalAttendees || 
                          (Array.isArray(event.attendees) ? event.attendees.length : 0) || 
                          event.ticketsSold || 
                          0;
    const capacity = event.capacity || 0;
    const fillPercentage = capacity > 0 ? (attendeesCount / capacity) * 100 : 0;
    const hasPendingApprovals = requiresApproval(event) && getPendingApprovalsCount(event) > 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
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
                <ApprovalBadge event={event} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {event.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {event.description}
              </p>
            </div>
            
            <div className="relative">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
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
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          </div>

          {/* Attendance Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Attendance</span>
              <span>{attendeesCount} / {capacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#FF6B35] h-2 rounded-full transition-all"
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Revenue and Price */}
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

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <Link
              to={`/event/${eventId}`}
              className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
            
            {hasPendingApprovals && (
              <button
                onClick={() => loadEventAttendees(eventId)}
                className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600"
              >
                <UserCheck className="h-4 w-4" />
                Approve
              </button>
            )}
            
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

  // Show processing state
  if (loading || processingPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto w-11/12 py-8 flex flex-col items-center justify-center h-96">
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
      
      <div className="container mx-auto w-11/12 py-8">
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
                { key: "published", label: "Published", count: eventsByStatus.published },
                { key: "draft", label: "Draft", count: eventsByStatus.draft },
                { key: "cancelled", label: "Cancelled", count: eventsByStatus.cancelled },
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

      {/* Approval Management Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Attendee Approvals
                  </h3>
                  <p className="text-gray-600 mt-1">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setAttendees([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Approval Filters */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { key: "all", label: "All", icon: Users },
                  { key: "pending", label: "Pending", icon: Clock },
                  { key: "approved", label: "Approved", icon: CheckCircle },
                  { key: "rejected", label: "Rejected", icon: UserX },
                ].map((filter) => {
                  const Icon = filter.icon;
                  const count = attendees.filter(a => 
                    filter.key === "all" ? true : a.status === filter.key
                  ).length;
                  
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setApprovalFilter(filter.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        approvalFilter === filter.key
                          ? "bg-[#FF6B35] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {filter.label} ({count})
                    </button>
                  );
                })}
                
                {attendees.filter(a => a.status === 'pending').length > 0 && (
                  <button
                    onClick={handleBulkApprove}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 ml-auto"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve All Pending
                  </button>
                )}
              </div>

              {/* Attendees List */}
              {loadingAttendees ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF6B35] border-t-transparent"></div>
                </div>
              ) : filteredAttendees.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attendees found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAttendees.map((attendee) => (
                    <div
                      key={attendee._id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {attendee.user?.name || attendee.user?.email || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendee.user?.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied: {new Date(attendee.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          attendee.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : attendee.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {attendee.status}
                        </span>

                        {attendee.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveAttendee(attendee._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectAttendee(attendee._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Reject"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Event
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this event? This action cannot be undone and all associated data will be lost.
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