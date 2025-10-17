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
  Upload,
  X,
  Save,
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  Tag,
  FileText,
  Shield,
  Gift,
  Loader,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventAPI, apiCall } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

// Validation schema
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
  longDescription: yup
    .string()
    .optional()
    .max(5000, "Long description must be less than 5000 characters"),
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

const EditEvent = () => {
  const { id } = useParams();
  const { isAuthenticated, isOrganizer, user } = useAuth(); // ADDED user here
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Dynamic fields
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [includes, setIncludes] = useState([]);
  const [includeInput, setIncludeInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(eventSchema),
    mode: "onChange",
  });

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

  // Debug user info
  useEffect(() => {
    console.log("EditEvent - Current User:", {
      userId: user?.id,
      userRole: user?.role,
      userName: user?.name,
      eventId: id,
    });
  }, [user, id]);

  // Load event data
  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const result = await apiCall(eventAPI.getEventById, id);

      if (result.success) {
        const eventData = result.data.event || result.data;
        setEvent(eventData);

        // Debug event organizer info
        console.log("Event Data - Organizer Info:", {
          eventOrganizer: eventData.organizer,
          eventOrganizerId: eventData.organizer?._id || eventData.organizer,
          currentUserId: user?.id,
        });

        // Populate form fields
        setValue("title", eventData.title);
        setValue("description", eventData.description);
        setValue("longDescription", eventData.longDescription || "");
        setValue("category", eventData.category);
        setValue("date", eventData.date?.split("T")[0]);
        setValue("time", eventData.time);
        setValue("endTime", eventData.endTime);
        setValue("venue", eventData.venue);
        setValue("address", eventData.address);
        setValue("city", eventData.city);
        setValue("price", eventData.price);
        setValue("capacity", eventData.capacity);

        // Set dynamic fields
        setTags(eventData.tags || []);
        setIncludes(eventData.includes || []);
        setRequirements(eventData.requirements || []);

        // Set existing images
        const images = eventData.images || [];
        setExistingImages(
          images.map((img, index) => ({
            url: typeof img === "object" ? img.url : img,
            id: typeof img === "object" ? img.public_id : `existing-${index}`,
          }))
        );
      } else {
        setError("root.serverError", {
          message: "Failed to load event data",
        });
      }
    } catch (error) {
      console.error("Error loading event:", error);
      setError("root.serverError", {
        message: "Failed to load event data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tag management
  const addTag = () => {
    if (
      tagInput.trim() &&
      !tags.includes(tagInput.trim()) &&
      tags.length < 10
    ) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Includes management
  const addInclude = () => {
    if (includeInput.trim() && includes.length < 10) {
      setIncludes([...includes, includeInput.trim()]);
      setIncludeInput("");
    }
  };

  const removeInclude = (index) => {
    setIncludes(includes.filter((_, i) => i !== index));
  };

  // Requirements management
  const addRequirement = () => {
    if (requirementInput.trim() && requirements.length < 10) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput("");
    }
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  // Image management
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages =
      existingImages.length + uploadedImages.length + files.length;

    if (totalImages > 3) {
      setError("images", { message: "Maximum 3 images allowed in total" });
      return;
    }

    const newImageFiles = [...imageFiles];
    const newUploadedImages = [...uploadedImages];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("images", { message: "Only image files are allowed" });
        return;
      }

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

  const removeNewImage = (indexToRemove) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append basic event data
      formData.append("title", data.title);
      formData.append("description", data.description);

      if (data.longDescription) {
        formData.append("longDescription", data.longDescription);
      }

      formData.append("category", data.category);
      formData.append("date", data.date);
      formData.append("time", data.time);
      formData.append("endTime", data.endTime);
      formData.append("venue", data.venue);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("price", data.price);
      formData.append("capacity", data.capacity);

      // Append dynamic fields
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      if (includes.length > 0) {
        formData.append("includes", JSON.stringify(includes));
      }

      if (requirements.length > 0) {
        formData.append("requirements", JSON.stringify(requirements));
      }

      // Append existing images that weren't deleted
      if (existingImages.length > 0) {
        formData.append(
          "existingImages",
          JSON.stringify(existingImages.map((img) => img.url))
        );
      }

      // Append images to delete
      if (imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      // Append new images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      console.log("Updating event:", {
        ...data,
        tags,
        includes,
        requirements,
        newImages: imageFiles.length,
        existingImages: existingImages.length,
      });

      const result = await apiCall(eventAPI.updateEvent, id, formData);

      if (result.success) {
        console.log("Event updated successfully:", result.data);
        setShowSuccess(true);

        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2000);
      } else {
        console.error("Event update failed:", result.error);
        setError("root.serverError", {
          message: result.error || "Failed to update event. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError("root.serverError", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  if (!isAuthenticated || !isOrganizer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-11/12 mx-auto container py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              You need to be logged in as an organizer to edit events.
            </p>
            <Link
              to="/login"
              className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Loader className="h-12 w-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading event data...</p>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-11/12 mx-auto container">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Event Updated Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your event changes have been saved.
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
            Edit <span className="text-[#FF6B35]">Event</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Update your event information below.
          </p>
        </div>

        {/* Server Error */}
        {errors.root?.serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{errors.root.serverError.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Event Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                  Short Description *
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder="Brief description of your event (50-2000 characters)"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description (Optional)
                </label>
                <textarea
                  {...register("longDescription")}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  placeholder="Provide a more detailed description of your event"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed in the "About this event" section
                </p>
                {errors.longDescription && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.longDescription.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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

          {/* What's Included */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-gray-900">
                What's Included
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              List what attendees will get with their ticket
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addInclude())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="e.g., Refreshments and meals"
              />
              <button
                type="button"
                onClick={addInclude}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {includes.length > 0 && (
              <div className="space-y-2">
                {includes.map((item, index) => (
                  <div
                    key={`include-${index}-${item}`}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeInclude(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-gray-900">
                Requirements
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              List what attendees need to bring or have
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addRequirement())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="e.g., Valid government-issued ID"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {requirements.length > 0 && (
              <div className="space-y-2">
                {requirements.map((item, index) => (
                  <div
                    key={`include-${index}-${item}`}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-gray-900">
                Event Tags
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add tags to help people discover your event (max 10 tags)
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                placeholder="e.g., startup, innovation, AI"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 10}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={`tag-${tag}`}
                    className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {tags.length}/10 tags added
            </p>
          </div>

          {/* Event Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Event Images (Max 3 total)
            </h3>
            <div className="space-y-4">
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Images
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt="Event"
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {uploadedImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Images to Upload
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`New event preview ${index + 1}`}
                          className="h-32 w-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {existingImages.length + uploadedImages.length < 3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x600 pixels, JPEG or PNG format. Max 5MB
                    per image.
                  </p>
                  {errors.images && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.images.message}
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Total images: {existingImages.length + uploadedImages.length}/3
              </p>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to Update Your Event
                </h3>
                <p className="text-gray-600 text-sm">
                  Your changes will be saved and visible to attendees.
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
                      Updating Event...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Event
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

export default EditEvent;
