import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  Sparkles,
  Ticket,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import EventSlider from "../pages/EventSlider";
import { eventAPI, apiCall } from "../services/api";

// Local images for fallback
import eventOne from "../assets/Vision one.png";
import eventTwo from "../assets/Vision 2.png";
import eventThree from "../assets/vision 3.png";

// Map potential stored paths to actual imports
const imageMap = {
  "/src/assets/Vision one.png": eventOne,
  "/src/assets/Vision 2.png": eventTwo,
  "/src/assets/vision 3.png": eventThree,
  "/assets/Vision one.png": eventOne,
  "/assets/Vision 2.png": eventTwo,
  "/assets/vision 3.png": eventThree,
};

const fallbackImage = eventOne;

const Home = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // FAQ data
  const faqs = [
    {
      question: "Who can use Eventry?",
      answer: "Anyone! Eventry is built for event organizers, hosts, and attendees. Organizers can plan and manage events efficiently, while attendees can discover and book events that interest them. Our platform is designed to be user-friendly for all experience levels."
    },
    {
      question: "How do I create an event on Eventry?",
      answer: "Creating an event is simple! Click on 'Create Event' in the navigation menu, fill in your event details including title, date, venue, and ticket information. You can upload images, set ticket prices, and publish your event instantly. Our platform guides you through each step."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely! We use blockchain technology and industry-standard encryption to protect all transactions. Your payment information is never stored on our servers, and all transactions are processed through secure, verified payment gateways."
    },
    {
      question: "Can I get a refund if I can't attend an event?",
      answer: "Refund policies vary by event organizer. Each event page displays the specific refund policy. Generally, refunds are available up to 7 days before the event. For special circumstances, please contact the event organizer directly through the platform."
    },
    {
      question: "How do I receive my tickets after purchase?",
      answer: "After completing your purchase, you'll receive an instant confirmation email with your digital tickets. You can also access your tickets anytime from your account dashboard. Simply show the QR code on your phone at the event entrance."
    },
    {
      question: "What types of events can I host on Eventry?",
      answer: "Eventry supports all types of events including conferences, concerts, workshops, webinars, networking events, festivals, sports events, and more. Whether it's a small meetup or a large-scale conference, our platform scales to meet your needs."
    },
    {
      question: "How much does it cost to use Eventry?",
      answer: "Creating an account and browsing events is completely free! For event organizers, we charge a small service fee per ticket sold. There are no upfront costs or hidden fees. You only pay when you successfully sell tickets."
    },
    {
      question: "What happens if an event is cancelled?",
      answer: "If an event is cancelled by the organizer, all ticket holders are automatically notified via email. Refunds are processed within 5-7 business days. The organizer can also choose to reschedule the event and transfer existing tickets to the new date."
    },
    {
      question: "How do I contact event organizers?",
      answer: "Each event page has a 'Contact Organizer' button. You can send messages directly through the platform, and organizers typically respond within 24-48 hours. For urgent matters, check if the organizer has provided additional contact information on their event page."
    },
    {
      question: "Can I track my event's performance?",
      answer: "Yes! Our real-time analytics dashboard gives you insights into ticket sales, revenue, attendee demographics, and engagement metrics. You can track your event's performance and make data-driven decisions to improve attendance."
    }
  ];

  // Fetch all events from backend
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(eventAPI.getAllEvents);

      if (result.success) {
        // Handle different possible response structures
        let eventsData = [];
        
        if (Array.isArray(result.data)) {
          eventsData = result.data;
        } else if (result.data && Array.isArray(result.data.events)) {
          eventsData = result.data.events;
        } else if (result.data && Array.isArray(result.data.data)) {
          eventsData = result.data.data;
        } else if (result.events && Array.isArray(result.events)) {
          eventsData = result.events;
        } else if (Array.isArray(result)) {
          eventsData = result;
        } else {
          eventsData = [];
        }

        const processed = eventsData.map((event) => {
          const rawImages = event.images || [];
          let eventImage = fallbackImage;

          if (rawImages.length > 0) {
            const img = rawImages[0];

            if (img && typeof img === "object" && img.url) {
              eventImage = img.url;
            } else if (typeof img === "string") {
              eventImage = img;
            } else {
              eventImage = imageMap[img] || fallbackImage;
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

        setAllEvents(processed);
      } else {
        setError(result.error || "Failed to load events");
      }
    } catch (error) {
      setError("An unexpected error occurred while loading events");
    } finally {
      setLoading(false);
    }
  };

  // Features data
  const features = [
    {
      icon: <Ticket className="h-8 w-8" />,
      title: "Easy Ticket Management",
      description:
        "Create, manage, and sell tickets seamlessly with our intuitive platform.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Blockchain Security",
      description:
        "Your events and transactions are secured with cutting-edge blockchain technology.",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Real-time Analytics",
      description:
        "Track your event performance with detailed insights and analytics.",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Smart Recommendations",
      description:
        "Discover events tailored to your interests with AI-powered suggestions.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Check if event is in the past
  const isEventInPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  };

  // Separate events into upcoming and past
  const upcomingEvents = allEvents
    .filter(event => !isEventInPast(event.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  const pastEvents = allEvents
    .filter(event => isEventInPast(event.date))
    .map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: `${event.city}${event.state ? `, ${event.state}` : ''}`,
      attendees: event.attendees || event.ticketsSold || Math.floor(Math.random() * 1000) + 100,
      image: event.image,
      category: event.category,
      venue: event.venue
    }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="Homeimg Blend-overlay relative">
        <Navbar />
        <div className="w-11/12 mx-auto container py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white leading-tight">
              Discover Events That{" "}
              <span className="text-[#FF6B35]">Ignite</span> and Connect
            </h1>

            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Your Complete Destination for Discovering and Booking the Events
              That Inspire, Connect, and Truly Matter to You.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/discover"
                className="duration-300 transform hover:scale-105 shadow-lg bg-[#FF6B35] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#FF8535] transition-all flex items-center group"
              >
                <Calendar className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Events
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/create-event"
                className="duration-300 transform hover:scale-105 shadow-lg border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#FF6B35] transition-all flex items-center group"
              >
                Create Your First Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="w-11/12 mx-auto container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-[#FF6B35]">Eventry</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing event management in Africa with cutting-edge
              technology and user-friendly features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all group hover:border-[#FF6B35]/20"
              >
                <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#FF6B35] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Events Section */}
      <section className="bg-white py-20">
        <div className="w-11/12 mx-auto container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Trending <span className="text-[#FF6B35]">Events</span>
              </h2>
              <p className="text-gray-600">
                Discover upcoming events that are creating buzz
              </p>
            </div>
            <Link
              to="/discover"
              className="hidden md:flex items-center bg-[#FF6B35] px-6 py-3 rounded-full text-white font-semibold hover:bg-[#FF8535] transition-colors group"
            >
              SEE ALL
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
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
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                // Get price display inline
                const getPriceDisplay = () => {
                  if (event.ticketTypes && event.ticketTypes.length > 0) {
                    const prices = event.ticketTypes.map(t => t.price);
                    const minPrice = Math.min(...prices);
                    return minPrice === 0 ? "Free" : `₦${minPrice.toLocaleString()}`;
                  }
                  return event.price === 0 ? "Free" : `₦${event.price.toLocaleString()}`;
                };

                // Get available tickets inline
                const getAvailableTickets = () => {
                  if (event.ticketTypes && event.ticketTypes.length > 0) {
                    return event.ticketTypes.reduce((sum, tt) => sum + (tt.availableTickets || 0), 0);
                  }
                  return event.availableTickets || event.capacity || 0;
                };

                const priceDisplay = getPriceDisplay();
                const availableTickets = getAvailableTickets();
                const isSoldOut = availableTickets === 0;
                
                return (
                  <Link
                    to={`/event/${event.id}`}
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
                          priceDisplay === "Free" ? "bg-green-500" : "bg-[#FF6B35]"
                        }`}>
                          {priceDisplay}
                        </span>
                      </div>
                      
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
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
                          <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
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
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-[#FF6B35] bg-orange-50 px-2 py-1 rounded-full font-medium">
                          {event.category}
                        </span>
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
                No Upcoming Events
              </h3>
              <p className="text-gray-600 mb-4">
                Check back later for new events or create one yourself!
              </p>
              <Link
                to="/create-event"
                className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] font-semibold"
              >
                Create an Event
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/discover"
              className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] font-semibold group"
            >
              View All Events
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="w-11/12 mx-auto container text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Event Experience?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who trust Eventry
            for seamless event management and discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-[#FF6B35] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/team"
              className="border-2 border-[#FF6B35] text-[#FF6B35] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors transform hover:scale-105"
            >
              Meet Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Past Events Slider Section */}
      {pastEvents.length > 0 && (
        <section className="bg-white py-20">
          <div className="w-11/12 mx-auto container">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Past <span className="text-[#FF6B35]">Events</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Relive the amazing moments from our successfully hosted events across Africa
              </p>
            </div>
            
            <EventSlider events={pastEvents} />
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="bg-white py-20">
        <div className="w-11/12 mx-auto container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-[#FF6B35]">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Got questions? We've got answers. Find everything you need to know about using Eventry.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#FF6B35]/30 transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-[#FF6B35] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center text-[#FF6B35] hover:text-[#FF8535] font-semibold transition-colors"
            >
              Contact our support team
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default Home;