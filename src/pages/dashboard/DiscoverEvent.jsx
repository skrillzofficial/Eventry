import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  SlidersHorizontal,
  X,
  ArrowRight,
  MapPin,
  Users,
  Clock,
  Ticket,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { eventAPI, apiCall } from "../../services/api";

// Local event demo images (fallback)
import eventOne from "../../assets/Vision one.png";
import eventTwo from "../../assets/Vision 2.png";
import eventThree from "../../assets/vision 3.png";

// Map local paths to imported images
const imageMap = {
  "/assets/Vision one.png": eventOne,
  "/assets/Vision 2.png": eventTwo,
  "/assets/vision 3.png": eventThree,
};

const DiscoverEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    city: "",
    date: "",
    priceRange: "",
    sortBy: "date",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      loadCategoriesAndCities();
    }
  }, [events]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filters]);

  //  Helper function to get price display for ticket types
  const getPriceDisplay = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const prices = event.ticketTypes.map(t => t.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === 0 && maxPrice === 0) {
        return { text: "Free", range: false };
      }
      
      if (minPrice === maxPrice) {
        return { 
          text: minPrice === 0 ? "Free" : `₦${minPrice.toLocaleString()}`,
          range: false
        };
      }
      
      return { 
        text: `₦${minPrice.toLocaleString()} - ₦${maxPrice.toLocaleString()}`,
        range: true
      };
    }
    
    // Legacy single price
    return { 
      text: event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`,
      range: false
    };
  };

  //  Helper to get minimum price for filtering
  const getMinPrice = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return Math.min(...event.ticketTypes.map(t => t.price));
    }
    return event.price || 0;
  };

  //  Helper to get available tickets count
  const getAvailableTickets = (event) => {
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      return event.ticketTypes.reduce((sum, tt) => sum + (tt.availableTickets || 0), 0);
    }
    return event.availableTickets || event.capacity || 0;
  };

  // Load all events from backend
  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(eventAPI.getAllEvents);

      if (result.success) {
        const eventsData = result.data.events || result.data || [];

        const processed = eventsData.map((event) => {
          const rawImages = event.images || [];
          let eventImage = eventOne;

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
            // Check if it matches a local image path
            else {
              eventImage = imageMap[img] || eventOne;
            }
          }

          return {
            id: event._id || event.id,
            title: event.title || "Untitled Event",
            description: event.description || "",
            category: event.category || "General",
            date: event.date,
            time: event.time,
            endTime: event.endTime,
            venue: event.venue,
            address: event.address,
            city: event.city,
            price: event.price || 0,
            capacity: event.capacity || 0,
            ticketsSold: event.ticketsSold || 0,
            availableTickets: event.availableTickets || 0,
            image: eventImage,
            images: event.images || [],
            tags: event.tags || [event.category].filter(Boolean),
            organizer: event.organizer || { name: "Unknown Organizer" },
            rating: event.rating || 4.5,
            attendees: event.totalAttendees || event.attendees || 0,
            status: event.status || "active",
            createdAt: event.createdAt,
            ticketTypes: Array.isArray(event.ticketTypes) && event.ticketTypes.length > 0 
              ? event.ticketTypes 
              : null,
            isFeatured: event.isFeatured || false,
          };
        });

        setEvents(processed);
        setFilteredEvents(processed);
      } else {
        setError(result.error || "Failed to load events");
        console.error("API Error:", result.error);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setError("An unexpected error occurred while loading events");
    } finally {
      setLoading(false);
    }
  };

  // Load categories & cities from events data
  const loadCategoriesAndCities = () => {
    try {
      const uniqueCategories = [
        ...new Set(events.map((event) => event.category).filter(Boolean)),
      ];
      const uniqueCities = [
        ...new Set(events.map((event) => event.city).filter(Boolean)),
      ];

      setCategories(["All Categories", ...uniqueCategories]);
      setCities(["All Cities", ...uniqueCities]);
    } catch (error) {
      console.error("Error loading categories/cities:", error);

      // Fallback categories and cities
      setCategories([
        "All Categories",
        "Technology",
        "Business",
        "Arts",
        "Music",
        "Food",
        "Sports",
      ]);
      setCities([
        "All Cities",
        "Lagos",
        "Abuja",
        "Port Harcourt",
        "Ibadan",
        "Kano",
      ]);
    }
  };

  // Filter events with ticket type price support
  const filterEvents = () => {
    const results = events.filter((event) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        event.title?.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.organizer.name?.toLowerCase().includes(search) ||
        (event.tags &&
          event.tags.some((tag) => tag.toLowerCase().includes(search)));

      const matchesCategory =
        !filters.category ||
        filters.category === "All Categories" ||
        event.category === filters.category;

      const matchesCity =
        !filters.city ||
        filters.city === "All Cities" ||
        event.city === filters.city;

      const matchesDate =
        !filters.date ||
        new Date(event.date).toDateString() ===
          new Date(filters.date).toDateString();

      //  Price filtering with ticket types
      const minPrice = getMinPrice(event);
      const matchesPrice =
        !filters.priceRange ||
        (filters.priceRange === "free" && minPrice === 0) ||
        (filters.priceRange === "under5k" && minPrice <= 5000) ||
        (filters.priceRange === "5k-15k" &&
          minPrice > 5000 &&
          minPrice <= 15000) ||
        (filters.priceRange === "over15k" && minPrice > 15000);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCity &&
        matchesDate &&
        matchesPrice
      );
    });

    //  Sort results with ticket type price support
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case "date":
          return new Date(a.date) - new Date(b.date);
        case "price-low":
          return getMinPrice(a) - getMinPrice(b);
        case "price-high":
          return getMinPrice(b) - getMinPrice(a);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "popularity":
          return (b.attendees || 0) - (a.attendees || 0);
        default:
          return 0;
      }
    });

    setFilteredEvents(results);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      city: "",
      date: "",
      priceRange: "",
      sortBy: "date",
    });
    setSearchTerm("");
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error State
  if (error && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Events
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadEvents}
              className="inline-flex items-center bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Main Layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search and Filter Header */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Discover Events
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5 text-[#FF6B35]" /> Filters
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.filter(c => c !== "All Categories").map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.filter(c => c !== "All Cities").map((city, i) => (
                  <option key={i} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />

              <select
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.priceRange}
                onChange={(e) =>
                  handleFilterChange("priceRange", e.target.value)
                }
              >
                <option value="">Price Range</option>
                <option value="free">Free</option>
                <option value="under5k">Under ₦5,000</option>
                <option value="5k-15k">₦5,000 - ₦15,000</option>
                <option value="over15k">Above ₦15,000</option>
              </select>

              <select
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="price-low">Price (Low → High)</option>
                <option value="price-high">Price (High → Low)</option>
                <option value="rating">Rating</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredEvents.length} of {events.length} events
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-[#FF6B35] hover:underline"
              >
                <X className="h-4 w-4" /> Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Event Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => {
              const priceDisplay = getPriceDisplay(event);
              const availableTickets = getAvailableTickets(event);
              const isSoldOut = availableTickets === 0;
              
              return (
                <Link
                  to={`/event/${event.id}`}
                  key={event.id}
                  className="bg-white rounded-2xl shadow hover:shadow-xl transition-all overflow-hidden group relative"
                >
                  {/* Featured Badge */}
                  {event.isFeatured && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white/90 backdrop-blur-sm text-[#FF6B35] px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Featured
                      </span>
                    </div>
                  )}

                  <div className="relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/*  Price badge with range support */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
                        priceDisplay.text === "Free" ? "bg-green-500" : "bg-[#FF6B35]"
                      }`}>
                        {priceDisplay.text}
                      </span>
                    </div>
                    
                    {/* Ticket type indicator */}
                    {event.ticketTypes && event.ticketTypes.length > 1 && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                          {event.ticketTypes.length} ticket types
                        </span>
                      </div>
                    )}

                    {/* Sold Out Overlay */}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                          SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#FF6B35]" />
                        <span>{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#FF6B35]" />
                        <span className="truncate">
                          {event.venue}, {event.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#FF6B35]" />
                        <span>{event.attendees} attending</span>
                      </div>

                      {/* Available tickets display */}
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-[#FF6B35]" />
                        <span className={availableTickets <= 10 && availableTickets > 0 ? "text-orange-600 font-medium" : ""}>
                          {isSoldOut ? "Sold out" : `${availableTickets} tickets left`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-[#FF6B35] bg-orange-50 px-2 py-1 rounded-full font-medium">
                        {event.category}
                      </span>
                      
                      {priceDisplay.range && (
                        <span className="text-xs text-gray-500">
                          Multiple prices
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600 mb-4">
              {events.length > 0
                ? "Try adjusting your filters to see more events."
                : "No events available yet. Check back later!"}
            </p>
            {events.length === 0 && (
              <Link
                to="/create-event"
                className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] font-semibold"
              >
                Create an Event <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default DiscoverEvents;