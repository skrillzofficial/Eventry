import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ArrowRight,
  Sparkles,
  Ticket,
  Shield,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { eventsApi } from "../data/EventsApi";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const allEvents = await eventsApi.getAllEvents();
        setEvents(allEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trending <span className="text-[#FF6B35]">Events</span>
            </h2>
            <Link
              to="/discover"
              className="hidden md:flex items-center bg-[#FF6B35] px-4 py-2 rounded-full text-white font-semibold group"
            >
              SEE ALL
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-120 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 6).map((event) => {
                const imageSrc = event.image
                  ? event.image[0]
                  : event.images
                  ? event.images[0]
                  : "/default.jpg";

                return (
                  <Link
                    to={`/event/${event.id}`}
                    key={event.id}
                    className="relative group h-120 rounded-xl overflow-hidden"
                  >
                    <img
                      src={imageSrc}
                      alt={event.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 py-2">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {event.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
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
                Create an Event
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
              className="bg-[#FF6B35] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 hover:text-[#FF6B35] transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/team"
              className="border-2 border-white bg-[#FF6B35] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#FF6B35] transition-colors transform hover:scale-105"
            >
              Meet Our Team
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
