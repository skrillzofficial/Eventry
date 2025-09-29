import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Image,
  Tag,
  Upload,
  X,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Ticket,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

// Validation schema
const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required("Event title is required")
    .min(5, "Title must be at least 5 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters"),
  category: yup.string().required("Category is required"),
  date: yup.string().required("Event date is required"),
  time: yup.string().required("Event time is required"),
  venue: yup.string().required("Venue is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  ticketPrice: yup
    .number()
    .min(0, "Price cannot be negative")
    .required("Ticket price is required"),
  capacity: yup
    .number()
    .min(1, "Capacity must be at least 1")
    .required("Capacity is required"),
  ticketType: yup.string().required("Ticket type is required"),
});

// Available cities in Nigeria (more will be onboarded later)
const AVAILABLE_CITIES = [
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja" },
  { value: "ibadan", label: "Ibadan" },
  { value: "osun", label: "Osun" },
];

const CreateEvent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm({
    resolver: yupResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      country: "nigeria",
      city: "",
    },
  });

  // Check authentication and organizer status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userRole = localStorage.getItem("userRole");

      if (token) {
        setIsAuthenticated(true);
        if (userRole === "organizer") {
          setIsOrganizer(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate unique event ID (simulate blockchain transaction)
      const eventId = `evt_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Save event data with Nigeria as country
      const eventData = {
        ...data,
        id: eventId,
        country: "nigeria", // Force Nigeria
        organizer: localStorage.getItem("userEmail"),
        organizerName: localStorage.getItem("userName"),
        createdAt: new Date().toISOString(),
        status: "draft",
        image: uploadedImage,
        blockchainHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };

      // Save to localStorage
      const existingEvents = JSON.parse(
        localStorage.getItem("organizerEvents") || "[]"
      );
      localStorage.setItem(
        "organizerEvents",
        JSON.stringify([...existingEvents, eventData])
      );

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/organizer");
      }, 2000);
    } catch (error) {
      setError("root.serverError", {
        message: "Failed to create event. Please try again.",
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen Homeimg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  // Show authentication prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-300 mb-4">
              Authentication Required
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              You need to be logged in as an organizer to create events in
              Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105 inline-flex items-center justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="border-2 border-[#FF6B35] text-[#FF6B35] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors transform hover:scale-105 inline-flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#FF6B35]">
          <Footer />
        </div>
      </div>
    );
  }

  // Show organizer requirement for authenticated non-organizers
  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Organizer Account Required
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              You need an organizer account to create events.
            </p>
            <p className="text-gray-500 mb-8">
              Current account type:{" "}
              <span className="font-semibold">Attendee</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105 inline-flex items-center justify-center"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userRole");
                  navigate("/signup?type=organizer");
                }}
                className="border-2 border-[#FF6B35] text-[#FF6B35] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors transform hover:scale-105 inline-flex items-center justify-center"
              >
                Create Organizer Account
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Event Created Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            Your event has been created and is now live on the blockchain.
          </p>
          <div className="animate-pulse">
            <div className="inline-flex items-center text-sm text-gray-500">
              <span>Redirecting to dashboard</span>
              <span className="ml-2 animate-bounce">...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main create event form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/organizer"
            className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] mb-4 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35]/10 rounded-full text-[#FF6B35] text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Create Amazing Events
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New <span className="text-[#FF6B35]">Event</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your event on our
            blockchain-powered platform.
          </p>
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Event creation is currently available in
              select Nigerian cities. More locations coming soon!
            </p>
          </div>
        </div>

        {/* Server Error */}
        {errors.root?.serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {errors.root.serverError.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Event Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  {...register("category")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                >
                  <option value="">Select category</option>
                  <option value="conference">Conference</option>
                  <option value="workshop">Workshop</option>
                  <option value="concert">Concert</option>
                  <option value="sports">Sports</option>
                  <option value="networking">Networking</option>
                  <option value="festival">Festival</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="cultural">Cultural</option>
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="Describe your event in detail..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                  Event Date *
                </label>
                <input
                  type="date"
                  {...register("date")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                />
                {errors.date && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                  Event Time *
                </label>
                <input
                  type="time"
                  {...register("time")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                />
                {errors.time && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.time.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location - Nigeria Only */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <MapPin className="h-5 w-5 inline mr-2 text-[#FF6B35]" />
              Location (Nigeria)
            </h3>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <strong>Country:</strong> Nigeria 🇳🇬
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  {...register("venue")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="e.g., International Conference Center"
                />
                {errors.venue && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.venue.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  {...register("address")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="Street address, area, landmark"
                />
                {errors.address && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  {...register("city")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                >
                  <option value="">Select your city</option>
                  {AVAILABLE_CITIES.map((city) => (
                    <option key={city.value} value={city.value}>
                      {city.label}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  More cities coming soon!
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  value="Automatically determined from city"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  State will be automatically set based on your city selection
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Ticket className="h-5 w-5 inline mr-2 text-[#FF6B35]" />
              Ticket Information (₦)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                  Ticket Price (₦) *
                </label>
                <input
                  type="number"
                  {...register("ticketPrice")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.ticketPrice && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.ticketPrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                  Capacity *
                </label>
                <input
                  type="number"
                  {...register("capacity")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="Maximum attendees"
                  min="1"
                />
                {errors.capacity && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.capacity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                  Ticket Type *
                </label>
                <select
                  {...register("ticketType")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                >
                  <option value="">Select type</option>
                  <option value="general">General Admission</option>
                  <option value="vip">VIP</option>
                  <option value="early-bird">Early Bird</option>
                  <option value="group">Group (5+ people)</option>
                  <option value="student">Student</option>
                </select>
                {errors.ticketType && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.ticketType.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Image className="h-5 w-5 inline mr-2 text-[#FF6B35]" />
              Event Image
            </h3>
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Event Banner
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x600 pixels, JPEG or PNG format
                </p>
              </div>
              {uploadedImage && (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Event preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to Create Your Event
                </h3>
                <p className="text-gray-600 text-sm">
                  Your event will be stored on the blockchain and visible to
                  attendees.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                <Link
                  to="/dashboard/organizer"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center transform hover:scale-105"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-[#E55A2B]">
        <Footer />
      </div>
    </div>
  );
};

export default CreateEvent;
