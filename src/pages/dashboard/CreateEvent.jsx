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
import { eventsApi } from "../../data/EventsApi";

// Validation schema - updated to match API structure
const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required("Event title is required")
    .min(5, "Title must be at least 5 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters"),
  longDescription: yup
    .string()
    .required("Detailed description is required")
    .min(100, "Detailed description must be at least 100 characters"),
  category: yup.string().required("Category is required"),
  date: yup.string().required("Event date is required"),
  time: yup.string().required("Event time is required"),
  endTime: yup.string().required("End time is required"),
  venue: yup.string().required("Venue is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  price: yup
    .number()
    .min(0, "Price cannot be negative")
    .required("Ticket price is required"),
  capacity: yup
    .number()
    .min(1, "Capacity must be at least 1")
    .required("Capacity is required"),
  tags: yup.array().min(1, "At least one tag is required"),
  includes: yup.array().min(1, "At least one inclusion is required"),
  requirements: yup.array().min(1, "At least one requirement is required"),
});

const CreateEvent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [currentInclude, setCurrentInclude] = useState("");
  const [currentRequirement, setCurrentRequirement] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(eventSchema),
    mode: "onChange",
    defaultValues: {
      tags: [],
      includes: [],
      requirements: [],
      rating: 0,
      reviews: 0,
      attendees: 0,
      featured: false,
      status: "upcoming"
    },
  });

  // Watch form values for dynamic updates
  const tags = watch("tags") || [];
  const includes = watch("includes") || [];
  const requirements = watch("requirements") || [];

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

  // Available options from API structure
  const CATEGORIES = ["Technology", "Business", "Marketing", "Arts", "Health", "Education", "Music", "Food"];
  const CITIES = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Kano", "Benin", "Enugu", "Kaduna"];
  const COMMON_TAGS = ["Blockchain", "Web3", "AI", "Machine Learning", "Startup", "Networking", "Workshop", "Conference"];

  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      const newTags = [...tags, currentTag];
      setValue("tags", newTags);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setValue("tags", newTags);
  };

  const addInclude = () => {
    if (currentInclude && !includes.includes(currentInclude)) {
      const newIncludes = [...includes, currentInclude];
      setValue("includes", newIncludes);
      setCurrentInclude("");
    }
  };

  const removeInclude = (includeToRemove) => {
    const newIncludes = includes.filter(include => include !== includeToRemove);
    setValue("includes", newIncludes);
  };

  const addRequirement = () => {
    if (currentRequirement && !requirements.includes(currentRequirement)) {
      const newRequirements = [...requirements, currentRequirement];
      setValue("requirements", newRequirements);
      setCurrentRequirement("");
    }
  };

  const removeRequirement = (requirementToRemove) => {
    const newRequirements = requirements.filter(req => req !== requirementToRemove);
    setValue("requirements", newRequirements);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 3) {
      setError("images", { message: "Maximum 3 images allowed" });
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data) => {
    try {
      // Get organizer info from localStorage
      const organizerName = localStorage.getItem("userName") || "Tech Innovation NG";
      const userEmail = localStorage.getItem("userEmail") || "organizer@example.com";

      // Generate unique event ID
      const eventId = Math.max(...eventsApi.eventsData.events.map(e => e.id)) + 1;

      // Prepare event data matching API structure
      const eventData = {
        id: eventId,
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        category: data.category,
        date: data.date,
        time: data.time,
        endTime: data.endTime,
        venue: data.venue,
        address: data.address,
        city: data.city,
        price: parseInt(data.price),
        capacity: parseInt(data.capacity),
        attendees: 0, // New event starts with 0 attendees
        images: uploadedImages,
        organizer: {
          name: organizerName,
          verified: true,
          rating: 4.9,
          eventsHosted: 1, // This will be calculated
          joinDate: new Date().toISOString().split('T')[0],
          description: "Event organizer"
        },
        rating: 0, // New event starts with 0 rating
        reviews: 0, // New event starts with 0 reviews
        tags: data.tags,
        includes: data.includes,
        requirements: data.requirements,
        featured: false, // New events are not featured by default
        status: "upcoming"
      };

      // In a real app, you would send this to your backend API
      // For now, we'll simulate adding to the local data
      console.log('Event created:', eventData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setShowSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/organizer");
      }, 2000);

    } catch (error) {
      console.error('Error creating event:', error);
      setError("root.serverError", {
        message: "Failed to create event. Please try again.",
      });
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
              You need to be logged in as an organizer to create events.
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
            Your event has been created and is now live on the platform.
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
            Fill in the details below to create your event on our platform.
          </p>
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
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="Brief description of your event..."
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  {...register("longDescription")}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="Detailed description with agenda, speakers, etc. You can use HTML formatting..."
                />
                {errors.longDescription && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.longDescription.message}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                    Start Time *
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                    End Time *
                  </label>
                  <input
                    type="time"
                    {...register("endTime")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  />
                  {errors.endTime && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.endTime.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <MapPin className="h-5 w-5 inline mr-2 text-[#FF6B35]" />
              Location
            </h3>
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
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Ticket className="h-5 w-5 inline mr-2 text-[#FF6B35]" />
              Ticket Information (₦)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2 text-[#FF6B35]" />
                  Ticket Price (₦) *
                </label>
                <input
                  type="number"
                  {...register("price")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.price.message}
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
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tags & Categories
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Tags *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Add a tag (e.g., Blockchain, AI, Workshop)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-[#E55A2B]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {errors.tags && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.tags.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Included
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Included Items *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentInclude}
                    onChange={(e) => setCurrentInclude(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Add what's included (e.g., Lunch, Certificate, Materials)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclude())}
                  />
                  <button
                    type="button"
                    onClick={addInclude}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {includes.map((include, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm">{include}</span>
                      <button
                        type="button"
                        onClick={() => removeInclude(include)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.includes && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.includes.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Requirements
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Add requirements (e.g., Laptop, ID Card, Basic Knowledge)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(requirement)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {errors.requirements && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.requirements.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Image className="h-5 w-5 inline mr-2 text-[#FF6B35]" />
              Event Images (Max 3)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Event Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x600 pixels, JPEG or PNG format
                </p>
              </div>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Event preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
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
                  Your event will be visible to attendees once created.
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