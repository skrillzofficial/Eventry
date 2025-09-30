import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Ticket,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  User,
  Shield,
  CheckCircle,
  TrendingUp,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// Import sample images (you'll need to adjust these paths)
import eventOne from "../../assets/Vision one.png";
import eventTwo from "../../assets/Vision 2.png";
import eventThree from "../../assets/vision 3.png";

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [relatedEvents, setRelatedEvents] = useState([]);

  useEffect(() => {
    loadEventData();
    loadRelatedEvents();
  }, [id]);

  const loadEventData = async () => {
    // Simulate API call
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample event data - this would typically come from an API
    const eventData = {
      id: parseInt(id),
      title: "Blockchain & Web3 Conference Lagos 2024",
      description: "Join industry leaders exploring the future of blockchain technology and decentralized applications in Africa. This premier conference brings together innovators, developers, investors, and enthusiasts to discuss the latest trends, challenges, and opportunities in the Web3 space.",
      longDescription: `
        <p>The Blockchain & Web3 Conference Lagos 2024 is set to be the largest gathering of blockchain enthusiasts in West Africa. This year's theme focuses on "Building the Future of Decentralized Africa."</p>
        
        <h3>What to Expect:</h3>
        <ul>
          <li>Keynote speeches from industry pioneers</li>
          <li>Technical workshops on smart contracts and dApp development</li>
          <li>Panel discussions on regulation and adoption</li>
          <li>Networking sessions with top projects</li>
          <li>Live coding sessions and hackathons</li>
        </ul>

        <h3>Who Should Attend:</h3>
        <ul>
          <li>Blockchain developers and engineers</li>
          <li>Startup founders and entrepreneurs</li>
          <li>Investors and venture capitalists</li>
          <li>Policy makers and regulators</li>
          <li>Students and blockchain enthusiasts</li>
        </ul>
      `,
      category: "Technology",
      date: "2024-12-15",
      time: "09:00",
      endTime: "18:00",
      venue: "Eko Convention Center",
      address: "Victoria Island, Lagos, Nigeria",
      city: "Lagos",
      price: 25000,
      capacity: 1500,
      attendees: 1247,
      images: [eventOne, eventTwo, eventThree],
      organizer: {
        name: "Tech Innovation NG",
        verified: true,
        rating: 4.9,
        eventsHosted: 47,
        joinDate: "2020-03-15",
        description: "Leading technology event organizers in Africa, specializing in blockchain, AI, and emerging technologies."
      },
      rating: 4.8,
      reviews: 124,
      tags: ["Blockchain", "Web3", "Cryptocurrency", "DeFi", "NFT", "Smart Contracts"],
      includes: [
        "Conference access",
        "Lunch and refreshments",
        "Networking session",
        "Conference materials",
        "Certificate of attendance"
      ],
      requirements: [
        "Basic understanding of blockchain recommended",
        "Laptop for workshops (optional)",
        "Government-issued ID for registration"
      ]
    };

    setEvent(eventData);
    setLoading(false);
  };

  const loadRelatedEvents = async () => {
    // Sample related events
    const related = [
      {
        id: 2,
        title: "AI & Machine Learning Workshop",
        category: "Technology",
        date: "2024-12-10",
        price: 18000,
        image: eventTwo,
        city: "Lagos",
        rating: 4.5
      },
      {
        id: 3,
        title: "Startup Investment Summit",
        category: "Business",
        date: "2024-12-05",
        price: 8000,
        image: eventThree,
        city: "Ibadan",
        rating: 4.9
      },
      {
        id: 4,
        title: "Web3 Developers Meetup",
        category: "Technology",
        date: "2024-11-30",
        price: 5000,
        image: eventOne,
        city: "Lagos",
        rating: 4.7
      }
    ];
    setRelatedEvents(related);
  };

  const handleTicketPurchase = () => {
    // Handle ticket purchase logic
    const totalPrice = event.price * ticketQuantity;
    alert(`Purchasing ${ticketQuantity} ticket(s) for ₦${totalPrice.toLocaleString()}`);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const shareEvent = (platform) => {
    const eventUrl = window.location.href;
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

  if (!event) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <Link to="/discover" className="text-[#FF6B35] hover:text-[#FF8535] transition-colors">
            Return to Discover Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const today = new Date();
  const isUpcoming = eventDate >= today;

  return (
    <div className="min-h-screen Homeimg Blend-overlay">
      <Navbar />
      
      {/* Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link 
          to="/discover" 
          className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Discover Events
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <Sparkles className="w-3 h-3 text-[#FF6B35]" />
                      <span className="text-xs font-medium text-white">Featured</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isUpcoming ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                    }`}>
                      {isUpcoming ? 'Upcoming' : 'Past Event'}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    {event.title}
                  </h1>

                  <div className="flex items-center flex-wrap gap-4 text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#FF6B35]" />
                      <span>{eventDate.toLocaleDateString('en-NG', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-[#FF6B35]" />
                      <span>{event.time} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-[#FF6B35]" />
                      <span>{event.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFavorite}
                    className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-110"
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                  </button>
                  <button className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 hover:scale-110">
                    <Share2 className="h-5 w-5 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Rating and Attendees */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-white font-medium ml-2">{event.rating}</span>
                    <span className="text-gray-300 ml-1">({event.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-[#FF6B35]" />
                    <span className="text-white font-medium ml-2">{event.attendees.toLocaleString()}</span>
                    <span className="text-gray-300 ml-1">attendees</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">₦{event.price.toLocaleString()}</div>
                  <div className="text-sm text-gray-300">per ticket</div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden glass-morphism">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={event.images[0]}
                  alt={event.title}
                  className="w-full h-64 lg:h-96 object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-1 p-1">
                {event.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${event.title} ${index + 2}`}
                    className="h-24 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 glass-morphism">
              {/* Tab Navigation */}
              <div className="border-b border-white/20">
                <nav className="flex space-x-8 px-6">
                  {['details', 'organizer', 'location', 'reviews'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                        activeTab === tab
                          ? 'border-[#FF6B35] text-white scale-105'
                          : 'border-transparent text-gray-300 hover:text-white hover:scale-102'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">About This Event</h3>
                      <div 
                        className="text-gray-300 prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: event.longDescription }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <CheckCircle className="h-5 w-5 text-[#FF6B35] mr-2" />
                          What's Included
                        </h4>
                        <ul className="space-y-2">
                          {event.includes.map((item, index) => (
                            <li key={index} className="flex items-center text-gray-300">
                              <div className="w-2 h-2 bg-[#FF6B35] rounded-full mr-3"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-white mb-3 flex items-center">
                          <Shield className="h-5 w-5 text-[#FF6B35] mr-2" />
                          Requirements
                        </h4>
                        <ul className="space-y-2">
                          {event.requirements.map((item, index) => (
                            <li key={index} className="flex items-center text-gray-300">
                              <div className="w-2 h-2 bg-[#FF6B35] rounded-full mr-3"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-[#FF6B35]/20 text-[#FF6B35] rounded-full text-sm border border-[#FF6B35]/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'organizer' && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {event.organizer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-semibold text-white">{event.organizer.name}</h3>
                          {event.organizer.verified && (
                            <Shield className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-gray-300 mt-1">
                          <span className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            {event.organizer.rating}
                          </span>
                          <span>{event.organizer.eventsHosted} events hosted</span>
                          <span>Since {new Date(event.organizer.joinDate).getFullYear()}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300">{event.organizer.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-white">{event.organizer.eventsHosted}</div>
                        <div className="text-sm text-gray-300">Events</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-white">{event.organizer.rating}</div>
                        <div className="text-sm text-gray-300">Rating</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-white">98%</div>
                        <div className="text-sm text-gray-300">Satisfaction</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-white">4.2K</div>
                        <div className="text-sm text-gray-300">Attendees</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Event Location</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-[#FF6B35] mt-1" />
                        <div>
                          <h4 className="font-semibold text-white">{event.venue}</h4>
                          <p className="text-gray-300">{event.address}</p>
                        </div>
                      </div>

                      {/* Map Placeholder */}
                      <div className="h-64 bg-white/5 rounded-lg flex items-center justify-center border border-white/20">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 text-[#FF6B35] mx-auto mb-2" />
                          <p className="text-gray-300">Interactive Map</p>
                          <p className="text-sm text-gray-400">Map would be integrated here</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h5 className="font-semibold text-white mb-2">Parking Information</h5>
                          <p className="text-gray-300">Ample parking available at the venue. Additional parking at adjacent buildings.</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                          <h5 className="font-semibold text-white mb-2">Public Transport</h5>
                          <p className="text-gray-300">Easily accessible via public transportation. Bus stops within 5-minute walk.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Event Reviews</h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{event.rating}</div>
                        <div className="text-sm text-gray-300">from {event.reviews} reviews</div>
                      </div>
                    </div>

                    {/* Review Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => (
                          <div key={stars} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-300 w-8">{stars}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <div className="flex-1 bg-white/10 rounded-full h-2">
                              <div 
                                className="bg-[#FF6B35] h-2 rounded-full"
                                style={{ width: `${(stars / 5) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-300 w-12">{(stars / 5 * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">What attendees say:</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• "Excellent organization and content"</li>
                          <li>• "Great networking opportunities"</li>
                          <li>• "Knowledgeable speakers"</li>
                          <li>• "Well worth the investment"</li>
                        </ul>
                      </div>
                    </div>

                    {/* Sample Reviews */}
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">Chinedu O.</span>
                          <div className="flex items-center">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">
                          "One of the best blockchain conferences I've attended in Nigeria. The speakers were top-notch and the networking opportunities were incredible."
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
                <h3 className="text-xl font-semibold text-white mb-6">Related Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedEvents.map(relatedEvent => (
                    <Link
                      key={relatedEvent.id}
                      to={`/events/${relatedEvent.id}`}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 hover:scale-102 group"
                    >
                      <img
                        src={relatedEvent.image}
                        alt={relatedEvent.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                          {relatedEvent.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-300 mt-1">
                          <span>{relatedEvent.category}</span>
                          <span>•</span>
                          <span>₦{relatedEvent.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="space-y-6">
            {/* Ticket Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white">₦{event.price.toLocaleString()}</div>
                <div className="text-gray-300">per ticket</div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Tickets
                  </label>
                  <div className="flex items-center border border-white/20 rounded-lg">
                    <button
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="p-3 text-gray-300 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-white font-medium">{ticketQuantity}</span>
                    <button
                      onClick={() => setTicketQuantity(ticketQuantity + 1)}
                      className="p-3 text-gray-300 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Price per ticket</span>
                    <span>₦{event.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Quantity</span>
                    <span>{ticketQuantity}</span>
                  </div>
                  <div className="border-t border-white/20 pt-2">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total</span>
                      <span>₦{(event.price * ticketQuantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleTicketPurchase}
                  className="w-full bg-[#FF6B35] text-white py-4 rounded-lg font-semibold hover:bg-[#FF8535] transition-all duration-200 hover:scale-105 transform"
                >
                  <Ticket className="h-5 w-5 inline mr-2" />
                  Get Tickets Now
                </button>

                <div className="text-center text-xs text-gray-400">
                  Secure payment • Instant confirmation • 24/7 support
                </div>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
              <h4 className="font-semibold text-white mb-4">Share This Event</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => shareEvent('facebook')}
                  className="flex items-center justify-center p-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all duration-200 hover:scale-105"
                >
                  <Facebook className="h-5 w-5 mr-2" />
                  Facebook
                </button>
                <button
                  onClick={() => shareEvent('twitter')}
                  className="flex items-center justify-center p-3 bg-blue-400/20 text-blue-300 rounded-lg hover:bg-blue-400/30 transition-all duration-200 hover:scale-105"
                >
                  <Twitter className="h-5 w-5 mr-2" />
                  Twitter
                </button>
                <button
                  onClick={() => shareEvent('linkedin')}
                  className="flex items-center justify-center p-3 bg-blue-700/20 text-blue-400 rounded-lg hover:bg-blue-700/30 transition-all duration-200 hover:scale-105"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </button>
                <button
                  onClick={() => shareEvent('whatsapp')}
                  className="flex items-center justify-center p-3 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-all duration-200 hover:scale-105"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 glass-morphism">
              <h4 className="font-semibold text-white mb-4">Event Statistics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Capacity</span>
                  <span className="text-white font-medium">{event.capacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Attendees</span>
                  <span className="text-white font-medium">{event.attendees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Available</span>
                  <span className="text-white font-medium">{(event.capacity - event.attendees).toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-[#FF6B35] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    <span>{Math.round((event.attendees / event.capacity) * 100)}% booked</span>
                    <span>Hurry! Only {event.capacity - event.attendees} left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#FF6B35]">
        <Footer />
      </div>
    </div>
  );
};

export default EventPage;