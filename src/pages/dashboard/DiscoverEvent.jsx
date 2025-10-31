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
  Mic,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
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

// Nigerian States List
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa",
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

// Event Categories
const EVENT_CATEGORIES = [
  "Technology", "Business", "Marketing", "Arts", "Health",
  "Education", "Music", "Food", "Sports", "Entertainment",
  "Networking", "Lifestyle", "Other"
];

const DiscoverEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    state: "",
    date: "",
    priceRange: "",
    sortBy: "date",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);

  // Handle URL search parameters (including voice search)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const isVoiceSearch = searchParams.get('isVoiceSearch') === 'true';
    const originalQuery = searchParams.get('originalQuery');
    
    if (urlSearch) {
      const decodedSearch = decodeURIComponent(urlSearch);
      setSearchTerm(decodedSearch);
      
      if (isVoiceSearch) {
        setVoiceSearchActive(true);
        // Auto-parse voice search for filters
        parseVoiceSearchForFilters(decodedSearch);
        
        // Show notification
        setTimeout(() => {
          setVoiceSearchActive(false);
        }, 3000);
      }
    }
  }, [searchParams]);

  // Parse voice search to auto-apply filters
  const parseVoiceSearchForFilters = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Auto-detect state
    const detectedState = NIGERIAN_STATES.find(state => 
      lowerQuery.includes(state.toLowerCase())
    );
    if (detectedState) {
      setFilters(prev => ({ ...prev, state: detectedState }));
    }
    
    // Auto-detect category
    const detectedCategory = EVENT_CATEGORIES.find(cat => 
      lowerQuery.includes(cat.toLowerCase())
    );
    if (detectedCategory) {
      setFilters(prev => ({ ...prev, category: detectedCategory }));
    }
    
    // Auto-detect price filter
    if (lowerQuery.includes('free')) {
      setFilters(prev => ({ ...prev, priceRange: 'free' }));
    }
    
    // Auto-show filters if any were detected
    if (detectedState || detectedCategory || lowerQuery.includes('free')) {
      setShowFilters(true);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filters]);

  // Re-parse voice filters when categories are loaded
  useEffect(() => {
    const isVoiceSearch = searchParams.get('isVoiceSearch') === 'true';
    if (isVoiceSearch && searchTerm && events.length > 0) {
      parseVoiceSearchForFilters(searchTerm);
    }
  }, [events]);

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
            state: event.state,
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

  // Filter events with enhanced search and state filtering
  const filterEvents = () => {
    const results = events.filter((event) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        event.title?.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.city?.toLowerCase().includes(search) ||
        event.state?.toLowerCase().includes(search) ||
        event.venue?.toLowerCase().includes(search) ||
        event.organizer.name?.toLowerCase().includes(search) ||
        event.category?.toLowerCase().includes(search) ||
        (event.tags &&
          event.tags.some((tag) => tag.toLowerCase().includes(search)));

      const matchesCategory =
        !filters.category || event.category === filters.category;

      const matchesState =
        !filters.state || event.state === filters.state;

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
        matchesState &&
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
      state: "",
      date: "",
      priceRange: "",
      sortBy: "date",
    });
    setSearchTerm("");
    // Clear URL params
    setSearchParams({});
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
        {/* Voice Search Notification */}
        {voiceSearchActive && (
          <div className="mb-6 bg-gradient-to-r from-[#FF6B35] to-[#FF8535] text-white rounded-xl p-4 shadow-lg animate-slideDown">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5" />
              <div>
                <p className="font-semibold">Voice search active</p>
                <p className="text-sm text-white/90">
                  Searching for: "{searchTerm}"
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Discover Events
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
              {searchTerm && (
                <span className="ml-2 text-[#FF6B35]">
                  for "{searchTerm}"
                </span>
              )}
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Clear voice search params when manually typing
                  if (searchParams.get('isVoiceSearch')) {
                    setSearchParams({});
                  }
                }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <select
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* State Filter */}
              <select
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.state}
                onChange={(e) => handleFilterChange("state", e.target.value)}
              >
                <option value="">All States</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />

              {/* Price Filter */}
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

              {/* Sort Filter */}
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
                      loading="lazy"
                      decoding="async"
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
                          {event.city}{event.state && `, ${event.state}`}
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
              {searchTerm 
                ? `No events match "${searchTerm}". Try different search terms or filters.`
                : events.length > 0
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
      
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DiscoverEvents;