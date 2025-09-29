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
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import eventOne from "../../assets/Vision one.png"
import eventTwo from "../../assets/Vision 2.png"
import eventThree from "../../assets/vision 3.png"
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

  // Available categories and cities
  const categories = [
    'All Categories',
    'Technology',
    'Business',
    'Music',
    'Arts',
    'Sports',
    'Food & Drink',
    'Health & Wellness',
    'Education',
    'Networking',
    'Conference',
    'Workshop'
  ];

  const cities = [
    'All Cities',
    'Lagos',
    'Abuja',
    'Ibadan',
    'Osun',
    'Port Harcourt',
    'Kano',
    'Benin City',
    'Aba'
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filters]);

  const loadEvents = async () => {
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample events data
    const sampleEvents = [
      {
        id: 1,
        title: "Blockchain & Web3 Conference Lagos 2024",
        description: "Join industry leaders exploring the future of blockchain technology and decentralized applications in Africa.",
        category: "Technology",
        date: "2024-12-15",
        time: "09:00",
        venue: "Eko Convention Center",
        city: "Lagos",
        price: 25000,
        capacity: 1500,
        attendees: 1247,
        image: eventOne,
        organizer: "Tech Innovation NG",
        rating: 4.8,
        reviews: 124
      },
      {
        id: 2,
        title: "Afrobeat Music Festival Abuja",
        description: "Experience the best of Nigerian music with top artists performing live in the heart of Abuja.",
        category: "Music",
        date: "2024-11-20",
        time: "18:00",
        venue: "Eagle Square",
        city: "Abuja",
        price: 15000,
        capacity: 5000,
        attendees: 3200,
        image: eventTwo,
        organizer: "Naija Entertainment",
        rating: 4.6,
        reviews: 89
      },
      {
        id: 3,
        title: "Startup Investment Summit Ibadan",
        description: "Connect with investors and pitch your startup idea to potential funding partners.",
        category: "Business",
        date: "2024-12-05",
        time: "10:00",
        venue: "University of Ibadan",
        city: "Ibadan",
        price: 8000,
        capacity: 300,
        attendees: 247,
        image: eventThree,
        organizer: "Startup Nigeria",
        rating: 4.9,
        reviews: 67
      },
      {
        id: 4,
        title: "Yoga & Wellness Retreat Osun",
        description: "Rejuvenate your mind and body with expert-led yoga sessions in a serene environment.",
        category: "Health & Wellness",
        date: "2024-11-25",
        time: "07:00",
        venue: "Osun Grove Resort",
        city: "Osun",
        price: 12000,
        capacity: 100,
        attendees: 78,
        image: eventOne,
        organizer: "Wellness Nigeria",
        rating: 4.7,
        reviews: 45
      },
      {
        id: 5,
        title: "AI & Machine Learning Workshop",
        description: "Hands-on workshop covering the latest developments in artificial intelligence.",
        category: "Technology",
        date: "2024-12-10",
        time: "13:00",
        venue: "Tech Hub Lagos",
        city: "Lagos",
        price: 18000,
        capacity: 200,
        attendees: 156,
        image: eventTwo,
        organizer: "AI Nigeria",
        rating: 4.5,
        reviews: 34
      },
      {
        id: 6,
        title: "Nigerian Food & Culture Festival",
        description: "Celebrate Nigerian cuisine and cultural heritage with food tasting and performances.",
        category: "Food & Drink",
        date: "2025-12-01",
        time: "12:00",
        venue: "Tafawa Balewa Square",
        city: "Lagos",
        price: 5000,
        capacity: 2000,
        attendees: 1890,
        image: eventThree,
        organizer: "Culture NG",
        rating: 4.4,
        reviews: 156
      }
    ];

    setEvents(sampleEvents);
    setFilteredEvents(sampleEvents);
    setLoading(false);
  };

  const filterEvents = () => {
    let results = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006F6A]"></div>
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
          <h1 className="text-4xl font-bold text-gray-300 mb-4">
            Discover Amazing Events in Nigeria
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Find and attend the best events happening across Nigeria. From tech conferences to cultural festivals.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events, categories, organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A] focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
              {Object.values(filters).some(Boolean) && (
                <span className="ml-2 bg-[#006F6A] text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-[#006F6A] text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-[#006F6A] text-white' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#006F6A] hover:text-[#005a55]"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A]"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A]"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A]"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A]"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
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
                      className={`px-3 py-1 rounded-full text-sm ${
                        filters.sortBy === option.value
                          ? 'bg-[#006F6A] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredEvents.length} Events Found
            </h2>
            {Object.values(filters).some(Boolean) && (
              <div className="flex items-center mt-2 space-x-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {filters.category && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                    Category: {filters.category}
                  </span>
                )}
                {filters.city && filters.city !== 'All Cities' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    City: {filters.city}
                  </span>
                )}
                {filters.priceRange && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                    {getPriceRangeLabel(filters.priceRange)}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A]"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-[#006F6A] text-white px-6 py-2 rounded-lg hover:bg-[#005a55] transition-colors"
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
              />
            ))}
          </div>
        )}
      </div>
      
     <div className="bg-[#005a55]">
        <Footer />
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, viewMode, isFavorite, onToggleFavorite }) => {
  const eventDate = new Date(event.date);
  const today = new Date();
  const isUpcoming = eventDate >= today;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      {/* Event Image */}
      <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
        <div className="relative">
          <img
            src={event.image}
            alt={event.title}
            className={`w-full object-cover ${
              viewMode === 'list' ? 'h-full rounded-l-xl' : 'h-48 rounded-t-xl'
            }`}
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isUpcoming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isUpcoming ? 'Upcoming' : 'Past Event'}
            </span>
          </div>
          <button
            onClick={onToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>

      {/* Event Content */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {event.category}
          </span>
          <span className="text-lg font-bold text-gray-900">₦{event.price.toLocaleString()}</span>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {eventDate.toLocaleDateString('en-NG', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {event.venue}, {event.city}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2" />
            {event.attendees.toLocaleString()} attendees
          </div>
        </div>

        {/* Rating and Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900 ml-1">{event.rating}</span>
            <span className="text-sm text-gray-600 ml-1">({event.reviews})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <Link
              to={`/events/${event.id}`}
              className="flex items-center px-3 py-2 bg-[#006F6A] text-white rounded-lg hover:bg-[#005a55] transition-colors text-sm"
            >
              View Details
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverEvents;