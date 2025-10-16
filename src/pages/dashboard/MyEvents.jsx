import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { eventAPI, apiCall } from "../../services/api";

const  MyEvents = () => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === "organizer") {
      loadMyEvents();
      loadOrganizerStats();
    }
  }, [isAuthenticated, user]);

  const loadMyEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall(eventAPI.getOrganizerEvents);
      
      if (result.success) {
        setEvents(result.data.events || result.data || []);
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
        setStats(result.data);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const result = await apiCall(eventAPI.deleteEvent, eventId);
      
      if (result.success) {
        setEvents(events.filter(event => event.id !== eventId));
        setDeleteConfirm(null);
        // Reload stats to update counts
        loadOrganizerStats();
      } else {
        throw new Error(result.error || "Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert(err?.message || "Failed to delete event");
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this event? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await apiCall(eventAPI.cancelEvent, eventId);
      
      if (result.success) {
        // Update the event status in the local state
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, status: "cancelled" } : event
        ));
        // Reload stats to update counts
        loadOrganizerStats();
      } else {
        throw new Error(result.error || "Failed to cancel event");
      }
    } catch (err) {
      console.error("Error cancelling event:", err);
      alert(err?.message || "Failed to cancel event");
    }
  };

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group events by status for quick filtering
  const eventsByStatus = {
    all: events.length,
    published: events.filter(e => e.status === "published").length,
    draft: events.filter(e => e.status === "draft").length,
    cancelled: events.filter(e => e.status === "cancelled").length,
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

  // Subcomponents
  const StatsCard = ({ title, value, icon, color = "blue" }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-50`}>
          {React.cloneElement(icon, { className: `h-6 w-6 text-${color}-600` })}
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      published: { color: "green", text: "Published" },
      draft: { color: "yellow", text: "Draft" },
      cancelled: { color: "red", text: "Cancelled" },
    };

    const config = statusConfig[status] || { color: "gray", text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const EventCard = ({ event }) => {
    const eventDate = new Date(event.date);
    const isUpcoming = eventDate >= new Date();
    const attendeesCount = event.attendees || event.ticketsSold || 0;
    const capacity = event.capacity || 0;
    const fillPercentage = capacity > 0 ? (attendeesCount / capacity) * 100 : 0;

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
              <span>{event.venue}, {event.city}</span>
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

          {/* Revenue */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                ₦{((event.price || 0) * attendeesCount).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-lg font-semibold text-gray-900">
                {event.price === 0 ? "Free" : `₦${event.price?.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/event/${event.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
            
            <Link
              to={`/organizer/events/edit/${event.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FF6B35] hover:bg-[#FF8535]"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>

            {event.status !== "cancelled" && (
              <button
                onClick={() => handleCancelEvent(event.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
            )}

            <button
              onClick={() => setDeleteConfirm(event.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

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
              to="/organizer/events/create"
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
                icon={<TrendingUp />}
                color="blue"
              />
              <StatsCard
                title="Published"
                value={stats.publishedEvents || 0}
                icon={<CheckCircle />}
                color="green"
              />
              <StatsCard
                title="Total Revenue"
                value={`₦${(stats.totalRevenue || 0).toLocaleString()}`}
                icon={<Users />}
                color="purple"
              />
              <StatsCard
                title="Total Attendees"
                value={stats.totalAttendees || 0}
                icon={<Users />}
                color="orange"
              />
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Status Filter */}
            <div className="flex gap-2">
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
          </div>
        ) : error ? (
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
              to="/organizer/events/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white font-semibold rounded-lg hover:bg-[#FF8535]"
            >
              <Plus className="h-5 w-5" />
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
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
}

export default MyEvents