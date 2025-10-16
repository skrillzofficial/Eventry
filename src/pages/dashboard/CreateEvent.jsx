import React, { useState } from "react";
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
  Upload,
  X,
  Save,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventAPI, apiCall } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

// Enhanced validation schema to match backend requirements
const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required("Event title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: yup.string().required("Category is required"),
  date: yup.string().required("Event date is required"),
  time: yup.string().required("Event time is required"),
  endTime: yup.string().required("End time is required"),
  venue: yup.string().required("Venue is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .required("Ticket price is required"),
  capacity: yup
    .number()
    .typeError("Capacity must be a number")
    .min(1, "Capacity must be at least 1")
    .max(100000, "Capacity cannot exceed 100,000")
    .required("Capacity is required"),
});

const CreateEvent = () => {
  const { isAuthenticated, isOrganizer, user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); 
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(eventSchema),
    mode: "onChange",
  });

  // Available options
  const CATEGORIES = [
    "Technology",
    "Business",
    "Marketing",
    "Arts",
    "Health",
    "Education",
    "Music",
    "Food",
    "Sports",
    "Entertainment",
    "Networking",
    "Other",
  ];
  const CITIES = [
    "Lagos",
    "Abuja",
    "Ibadan",
    "Port Harcourt",
    "Kano",
    "Benin",
    "Enugu",
    "Kaduna",
    "Owerri",
    "Jos",
    "Calabar",
    "Abeokuta",
    "Other",
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + uploadedImages.length > 3) {
      setError("images", { message: "Maximum 3 images allowed" });
      return;
    }

    const newImageFiles = [...imageFiles];
    const newUploadedImages = [...uploadedImages];

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("images", { message: "Only image files are allowed" });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("images", { message: "Image size must be less than 5MB" });
        return;
      }

      newImageFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        newUploadedImages.push(e.target.result);
        setUploadedImages([...newUploadedImages]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(newImageFiles);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (data) => {
    try {
      // Prepare form data for file upload
      const formData = new FormData();

      // Append basic event data
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("date", data.date);
      formData.append("time", data.time);
      formData.append("endTime", data.endTime);
      formData.append("venue", data.venue);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("price", data.price);
      formData.append("capacity", data.capacity);

      // Append images
      imageFiles.forEach((file, index) => {
        formData.append("images", file);
      });

      console.log("Submitting event data:", {
        ...data,
        imageCount: imageFiles.length,
      });

      // Call the backend API
      const result = await apiCall(eventAPI.createEvent, formData);

      if (result.success) {
        console.log("Event created successfully:", result.data);
        setShowSuccess(true);

        // Redirect to organizer dashboard after success
        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2000);
      } else {
        // Handle API errors
        console.error("Event creation failed:", result.error);
        setError("root.serverError", {
          message: result.error || "Failed to create event. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError("root.serverError", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Show authentication prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-11/12 mx-auto container py-16">
          <div className="text-center">
            <p className="text-xl text-gray-900 mb-8">
              You need to be logged in as an organizer to create events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="border-2 border-[#FF6B35] text-[#FF6B35] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show organizer requirement for authenticated non-organizers
  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-11/12 mx-auto container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Organizer Account Required
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              You need an organizer account to create events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => navigate("/signup?type=organizer")}
                className="border-2 border-[#FF6B35] text-[#FF6B35] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors"
              >
                Create Organizer Account
              </button>
            </div>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-11/12 mx-auto container">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto">
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
      </div>
    );
  }

  // Main create event form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-11/12 mx-auto container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/organizer"
            className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New <span className="text-[#FF6B35]">Event</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your event on our platform.
          </p>
        </div>

        {/* Server Error */}
        {errors.root?.serverError && (
          <div className="w-11/12 mx-auto container mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{errors.root.serverError.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Event Basic Information */}
          <div className="w-11/12 mx-auto container bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
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
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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
          <div className="w-11/12 mx-auto container bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  {...register("date")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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
                    Start Time *
                  </label>
                  <input
                    type="time"
                    {...register("time")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                  {errors.time && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.time.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    {...register("endTime")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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
          <div className="w-11/12 mx-auto container bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                >
                  <option value="">Select your city</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
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
          <div className="w-11/12 mx-auto container bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ticket Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price (₦) *
                </label>
                <input
                  type="number"
                  {...register("price")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  {...register("capacity")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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

          {/* Event Images */}
          <div className="w-11/12 mx-auto container bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x600 pixels, JPEG or PNG format. Max 5MB per
                  image.
                </p>
                {errors.images && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.images.message}
                  </p>
                )}
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
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
          <div className="w-11/12 mx-auto container bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default CreateEvent;
