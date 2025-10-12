import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  SlidersHorizontal,
  X,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { eventsApi } from "../../data/EventsApi";

// Local event demo images
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
    loadCategoriesAndCities();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filters]);

  //  Load all events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventsApi.getAllEvents();

      const processed = eventsData.map((event) => {
        const img =
          (event.images && event.images[0]) ||
          (event.image && event.image[0]) ||
          null;

        return {
          ...event,
          image: imageMap[img] || img || eventOne,
          tags: event.tags || [],
          organizer: event.organizer || { name: "Unknown Organizer" },
        };
      });

      setEvents(processed);
      setFilteredEvents(processed);
    } catch (error) {
      console.error(" Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  //  Load categories & cities
  const loadCategoriesAndCities = async () => {
    try {
      const [categoriesData, citiesData] = await Promise.all([
        eventsApi.getCategories(),
        eventsApi.getCities(),
      ]);

      setCategories(["All Categories", ...categoriesData]);
      setCities(["All Cities", ...citiesData]);
    } catch (error) {
      console.error(" Error loading categories/cities:", error);
    }
  };

  //  Filter events
  const filterEvents = () => {
    const results = events.filter((event) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        event.title?.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.organizer.name?.toLowerCase().includes(search) ||
        event.tags.some((tag) => tag.toLowerCase().includes(search));

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

      const matchesPrice =
        !filters.priceRange ||
        (filters.priceRange === "free" && event.price === 0) ||
        (filters.priceRange === "under5k" && event.price <= 5000) ||
        (filters.priceRange === "5k-15k" &&
          event.price > 5000 &&
          event.price <= 15000) ||
        (filters.priceRange === "over15k" && event.price > 15000);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCity &&
        matchesDate &&
        matchesPrice
      );
    });

    //  Sort results
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case "date":
          return new Date(a.date) - new Date(b.date);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popularity":
          return b.attendees - a.attendees;
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

  //  Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  //  Main Layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search and Filter Header */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
           Discover Events
          </h1>

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
              className="flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
            >
              <SlidersHorizontal className="h-5 w-5 text-[#FF6B35]" /> Filters
            </button>
          </div>
        </div>

        {/*  Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                className="border border-gray-300 rounded-xl p-2"
                value={filters.category}
                onChange={(e) =>
                  handleFilterChange("category", e.target.value)
                }
              >
                {categories.map((cat, i) => (
                  <option key={i}>{cat}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-xl p-2"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              >
                {cities.map((c, i) => (
                  <option key={i}>{c}</option>
                ))}
              </select>

              <input
                type="date"
                className="border border-gray-300 rounded-xl p-2"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              />

              <select
                className="border border-gray-300 rounded-xl p-2"
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
                className="border border-gray-300 rounded-xl p-2"
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

            <div className="flex justify-end mt-4">
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
            {filteredEvents.map((event) => (
              <Link
                to={`/event/${event.id}`}
                key={event.id}
                className="relative bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-120 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <h3 className="text-white text-sm font-semibold truncate">
                    {event.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Events Available
            </h3>
            <p className="text-gray-600 mb-4">
              Check back later for new events or create one yourself!
            </p>
            <Link
              to="/create-event"
              className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] font-semibold"
            >
              Create an Event <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
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
