import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  ArrowRight,
  Ticket,
  Shield,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const Home = () => {
  const features = [
    {
      icon: <Ticket className="h-8 w-8" />,
      title: "Easy Ticket Management",
      description:
        "Create, manage, and sell tickets seamlessly with our intuitive platform",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Blockchain Security",
      description:
        "Your events and transactions are secured with cutting-edge blockchain technology",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Real-time Analytics",
      description:
        "Track your event performance with detailed insights and analytics",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Smart Recommendations",
      description:
        "Discover events tailored to your interests with AI-powered suggestions",
    },
  ];

  const stats = [
    { number: "50K+", label: "Events Hosted" },
    { number: "1M+", label: "Happy Attendees" },
    { number: "200+", label: "Cities Covered" },
    { number: "98%", label: "Satisfaction Rate" },
  ];

  const upcomingEvents = [
    {
      title: "Tech Innovation Summit",
      date: "Dec 15, 2024",
      location: "Lagos",
      attendees: "1.2K",
      price: "₦25,000",
    },
    {
      title: "Afrobeat Music Festival",
      date: "Nov 20, 2024",
      location: "Abuja",
      attendees: "3.2K",
      price: "₦15,000",
    },
    {
      title: "Startup Investment Forum",
      date: "Dec 5, 2024",
      location: "Ibadan",
      attendees: "500",
      price: "₦8,000",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="Homeimg Blend-overlay relative">
        <Navbar />

        {/* Hero Content */}
        <div className="w-11/12 mx-auto container py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm mb-4">
                <Sparkles className="h-4 w-4 mr-2" />
                Africa's First Blockchain-Powered Event Ecosystem
              </div>

              <h1 className="text-6xl font-bold text-white leading-tight">
                Discover Events That{" "}
                <span className="text-[#FF6B35]">Ignite</span> and Connect
              </h1>

              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Your Complete Destination for Discovering and Booking the Events That Inspire, Connect, and Truly Matter to You..
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/discover"
                className="duration-300 transform hover:scale-105 shadow-lg bg-[#FF6B35] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#FF8535] hover:shadow-xl transition-all flex items-center group"
              >
                <Calendar className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Events
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/create-event"
                className="duration-300 transform hover:scale-105 shadow-lg border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#FF6B35] transition-all flex items-center group"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Create Your First Event
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="bg-gray-50 py-20">
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
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg">
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
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-white py-20">
        <div className="w-11/12 mx-auto container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Trending <span className="text-[#FF6B35]">Events</span>
              </h2>
              <p className="text-xl text-gray-600">
                Don't miss out on these amazing events happening across Nigeria
              </p>
            </div>
            <Link
              to="/discover"
              className="hidden md:flex items-center text-[#FF6B35] hover:text-[#E55A2B] font-semibold group"
            >
              View All Events
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all group hover:border-[#FF6B35]/30 hover:translate-y-[-4px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    {event.price}
                  </span>
                  <span className="bg-orange-100 text-[#FF6B35] px-3 py-1 rounded-full text-sm font-medium flex items-center shadow">
                    <Users className="h-3 w-3 mr-1" />
                    {event.attendees}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#FF6B35] transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                </div>

                <button className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#E55A2B] transition-colors flex items-center justify-center shadow-lg hover:shadow-xl group">
                  <Ticket className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Get Tickets
                </button>
              </div>
            ))}
          </div>

          {/* Mobile View All Button */}
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
      </div>

      {/* CTA Section */}
      <div className="Homeimg Blend-overlay py-20">
        <div className="w-11/12 mx-auto container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Event Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who trust Eventry
            for seamless event management and discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-[#FF6B35] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/team"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#FF6B35] transition-colors transform hover:scale-105"
            >
              Meet Our Team
            </Link>
          </div>
        </div>
      </div>
      <div className="bg-[#E55A2B]">
        <Footer />
      </div>
    </div>
  );
};

export default Home;