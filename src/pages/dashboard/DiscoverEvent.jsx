import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Ticket,
  Star,
  Heart,
  Share2,
  ArrowRight,
  Grid,
  List,
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { eventsApi } from '../../data/EventsApi';

// Import sample images (you'll need to adjust these paths)
import eventOne from "../../assets/Vision one.png"
import eventTwo from "../../assets/Vision 2.png"
import eventThree from "../../assets/vision 3.png"

// Image mapping for demo purposes
const imageMap = {
  "/assets/Vision one.png": eventOne,
  "/assets/Vision 2.png": eventTwo,
  "/assets/vision 3.png": eventThree
};

const DiscoverEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    date: '',
    priceRange: '',
    sortBy: 'date'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadEvents();
    loadCategoriesAndCities();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventsApi.getAllEvents();
      
      // Map image paths to actual imports
      const eventsWithImages = eventsData.map(event => ({
        ...event,
        image: imageMap[event.images[0]] || event.images[0]
      }));
      
      setEvents(eventsWithImages);
      setFilteredEvents(eventsWithImages);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndCities = async () => {
    try {
      const [categoriesData, citiesData] = await Promise.all([
        eventsApi.getCategories(),
        eventsApi.getCities()
      ]);
      
      setCategories(['All Categories', ...categoriesData]);
      setCities(['All Cities', ...citiesData]);
    } catch (error) {
      console.error('Error loading categories and cities:', error);
    }
  };

  const filterEvents = () => {
    let results = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !filters.category || filters.category === 'All Categories' || 
                             event.category === filters.category;
      
      const matchesCity = !filters.city || filters.city === 'All Cities' || 
                         event.city === filters.city;
      
      const matchesDate = !filters.date || event.date === filters.date;
      
      const matchesPrice = !filters.priceRange || (
        filters.priceRange === 'free' ? event.price === 0 :
        filters.priceRange === 'under5k' ? event.price <= 5000 :
        filters.priceRange === '5k-15k' ? event.price > 5000 && event.price <= 15000 :
        filters.priceRange === 'over15k' ? event.price > 15000 : true
      );

      return matchesSearch && matchesCategory && matchesCity && matchesDate && matchesPrice;
    });

    // Sort results
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.attendees - a.attendees;
        default:
          return 0;
      }
    });

    setFilteredEvents(results);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      date: '',
      priceRange: '',
      sortBy: 'date'
    });
    setSearchTerm('');
  };

  const toggleFavorite = (eventId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const getPriceRangeLabel = (priceRange) => {
    switch (priceRange) {
      case 'free': return 'Free';
      case 'under5k': return 'Under ₦5,000';
      case '5k-15k': return '₦5,000 - ₦15,000';
      case 'over15k': return 'Over ₦15,000';
      default: return 'Any Price';
    }
  };

  const shareEvent = (event, platform) => {
    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const text = `Check out this amazing event: ${event.title}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + eventUrl)}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen Homeimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35]/10 rounded-full text-[#FF6B35] text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Discover Amazing Events
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Find Your Next <span className="text-[#FF6B35]">Experience</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Explore the best events happening across Nigeria. From tech conferences to cultural festivals.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-8 glass-morphism">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events, categories, organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent bg-white/5 text-white placeholder-gray-400"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-3 border border-white/20 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              {Object.values(filters).some(Boolean) && (
                <span className="ml-2 bg-[#FF6B35] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-[#FF6B35] text-white' 
                    : 'text-gray-400 hover:text-gray-300 bg-white/5'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-[#FF6B35] text-white' 
                    : 'text-gray-400 hover:text-gray-300 bg-white/5'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#FF6B35] hover:text-[#FF8535] transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white/5 text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white/5 text-white"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white/5 text-white"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white/5 text-white"
                  >
                    <option value="">Any Price</option>
                    <option value="free">Free</option>
                    <option value="under5k">Under ₦5,000</option>
                    <option value="5k-15k">₦5,000 - ₦15,000</option>
                    <option value="over15k">Over ₦15,000</option>
                  </select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'date', label: 'Date' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'popularity', label: 'Most Popular' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('sortBy', option.value)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        filters.sortBy === option.value
                          ? 'bg-[#FF6B35] text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {filteredEvents.length} Events Found
            </h2>
            {Object.values(filters).some(Boolean) && (
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-sm text-gray-300">Active filters:</span>
                {filters.category && (
                  <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm">
                    {filters.category}
                  </span>
                )}
                {filters.city && filters.city !== 'All Cities' && (
                  <span className="bg-[#FF8535] text-white px-3 py-1 rounded-full text-sm">
                    {filters.city}
                  </span>
                )}
                {filters.priceRange && (
                  <span className="bg-[#E55A2B] text-white px-3 py-1 rounded-full text-sm">
                    {getPriceRangeLabel(filters.priceRange)}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center space-x-4">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] bg-white/5 text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-300 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#FF8535] transition-colors transform hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
          }>
            {filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                viewMode={viewMode}
                isFavorite={favorites.has(event.id)}
                onToggleFavorite={() => toggleFavorite(event.id)}
                onShareEvent={shareEvent}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-[#E55A2B]">
        <Footer />
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, viewMode, isFavorite, onToggleFavorite, onShareEvent }) => {
  const eventDate = new Date(event.date);
  const today = new Date();
  const isUpcoming = eventDate >= today;

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:shadow-xl transition-all duration-300 group overflow-hidden ${
      viewMode === 'list' ? 'flex' : ''
    } hover:scale-105 hover:border-[#FF6B35]/30`}>
      {/* Event Image */}
      <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className={`w-full object-cover ${
              viewMode === 'list' ? 'h-full' : 'h-48'
            } group-hover:scale-110 transition-transform duration-300`}
          />
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              isUpcoming ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
            }`}>
              {isUpcoming ? 'Upcoming' : 'Past Event'}
            </span>
          </div>
          {event.featured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-[#FF6B35] text-white rounded-full text-xs font-medium flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </span>
            </div>
          )}
          <button
            onClick={onToggleFavorite}
            className="absolute top-12 right-3 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors border border-white/20"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
      </div>

      {/* Event Content */}
      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-medium">
            {event.category}
          </span>
          <span className="text-lg font-bold text-white">₦{event.price.toLocaleString()}</span>
        </div>

        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#FF6B35] transition-colors">{event.title}</h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-[#FF6B35]" />
            {eventDate.toLocaleDateString('en-NG', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-[#FF6B35]" />
            {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <MapPin className="h-4 w-4 mr-2 text-[#FF6B35]" />
            {event.venue}, {event.city}
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <Users className="h-4 w-4 mr-2 text-[#FF6B35]" />
            {event.attendees.toLocaleString()} attendees
          </div>
        </div>

        {/* Rating and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-white ml-1">{event.rating}</span>
            <span className="text-sm text-gray-300 ml-1">({event.reviews})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onShareEvent(event, 'twitter')}
              className="p-2 text-gray-300 hover:text-white transition-colors hover:scale-110"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <Link
              to={`/event/${event.id}`}
              className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-all duration-200 transform hover:scale-105 text-sm font-medium group"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverEvents;