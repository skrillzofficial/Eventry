import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  MapPin,
  Users,
  Plus,
  Search,
  PartyPopper,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
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

  // How it works steps
  const steps = [
    {
      number: "01",
      icon: <Plus className="h-10 w-10" />,
      title: "Create Your Event",
      description: "Set up your event in minutes with our easy-to-use form. Add details, upload images, and set ticket prices.",
      image: eventOne,
    },
    {
      number: "02",
      icon: <Search className="h-10 w-10" />,
      title: "Discover Events",
      description: "Browse through thousands of exciting events tailored to your interests. Filter by location, category, and date.",
      image: eventTwo,
    },
    {
      number: "03",
      icon: <PartyPopper className="h-10 w-10" />,
      title: "Attend & Enjoy",
      description: "Book your tickets seamlessly and get ready to experience unforgettable moments at amazing events.",
      image: eventThree,
    },
  ];

  // Check if event is in the past
  const isEventInPast = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  };

  // Get past events
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
                to="/events/create"
                className="duration-300 transform hover:scale-105 shadow-lg border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#FF6B35] transition-all flex items-center group"
              >
                Create Your First Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="w-11/12 mx-auto container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-[#FF6B35]">Works</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started with Eventry is simple and straightforward. Follow these three easy steps.
            </p>
          </div>

          <div className="space-y-20">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-12 items-center`}
              >
                {/* Image Side */}
                <div className="flex-1 relative group">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Floating Number Badge */}
                  <div className={`absolute -top-6 ${index % 2 === 0 ? '-left-6' : '-right-6'} w-24 h-24 bg-[#FF6B35] rounded-2xl shadow-xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform`}>
                    <span className="text-4xl font-bold text-white">{step.number}</span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-6">
                  <div className="w-16 h-16 bg-[#FF6B35] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  <Link
                    to={index === 0 ? "/events/create" : index === 1 ? "/discover" : "/signup"}
                    className="inline-flex items-center bg-[#FF6B35] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#FF8535] hover:shadow-lg transform hover:scale-105 transition-all group"
                  >
                    {index === 0 ? "Create Event" : index === 1 ? "Explore Events" : "Get Started"}
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="w-11/12 mx-auto container">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Past <span className="text-[#FF6B35]">Events</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Relive the amazing moments from our successfully hosted events across Africa
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden group relative"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Past Event
                      </span>
                    </div>
                    
                    {/* Overlay for past events */}
                    <div className="absolute inset-0 bg-black/20"></div>
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
                          {event.location || event.venue}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#FF6B35]" />
                        <span>{event.attendees} attended</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-[#FF6B35] bg-orange-50 px-2 py-1 rounded-full font-medium">
                        {event.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default Home;