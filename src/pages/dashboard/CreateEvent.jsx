import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Calendar,
  Users,
  Ticket,
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  Tag,
  FileText,
  Shield,
  Eye,
  AlertCircle,
  X,
  Loader,
  MapPin,
  Clock,
  Image,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { eventAPI, apiCall } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import PaymentAgreement from "../../pages/dashboard/PaymentAgreement";

// Validation schema
const eventSchema = yup.object().shape({
  title: yup
    .string()
    .required("Event title is required")
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: yup
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),
  longDescription: yup
    .string()
    .max(5000, "Long description must be less than 5000 characters"),
  category: yup.string(),
  date: yup.string(),
  time: yup.string(),
  endTime: yup.string(),
  venue: yup.string(),
  address: yup.string(),
  city: yup.string(),
});

const CreateEvent = () => {
  const { isAuthenticated, isOrganizer, user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [savingAs, setSavingAs] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [showPaymentAgreement, setShowPaymentAgreement] = useState(false);
  const [publishData, setPublishData] = useState(null);

  // Form and data management
  const [ticketTypes, setTicketTypes] = useState([
    { name: "Regular", price: "", capacity: "", description: "", benefits: [] },
  ]);
  const [useLegacyPricing, setUseLegacyPricing] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState("");

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

  // Constants
  const CATEGORIES = [
    "Technology", "Business", "Marketing", "Arts", "Health", "Education", 
    "Music", "Food", "Sports", "Entertainment", "Networking", "Lifestyle", "Other",
  ];

  const CITIES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara",
  ];

  const TICKET_TYPES = ["Regular", "VIP", "VVIP"];

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Ticket type management
  const addTicketType = () => {
    if (ticketTypes.length < 3) {
      const availableTypes = TICKET_TYPES.filter(
        (type) => !ticketTypes.find((t) => t.name === type)
      );
      if (availableTypes.length > 0) {
        setTicketTypes([
          ...ticketTypes,
          {
            name: availableTypes[0],
            price: "",
            capacity: "",
            description: "",
            benefits: [],
          },
        ]);
      }
    }
  };

  const removeTicketType = (index) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_, i) => i !== index));
    }
  };

  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const addTicketBenefit = (ticketIndex, benefit) => {
    if (benefit.trim()) {
      const updated = [...ticketTypes];
      updated[ticketIndex].benefits = [
        ...updated[ticketIndex].benefits,
        benefit.trim(),
      ];
      setTicketTypes(updated);
    }
  };

  const removeTicketBenefit = (ticketIndex, benefitIndex) => {
    const updated = [...ticketTypes];
    updated[ticketIndex].benefits = updated[ticketIndex].benefits.filter(
      (_, i) => i !== benefitIndex
    );
    setTicketTypes(updated);
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
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

  // Image handling
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + uploadedImages.length > 3) {
      setError("images", { message: "Maximum 3 images allowed" });
      return;
    }

    setImageUploading(true);

    try {
      const newImageFiles = [...imageFiles];
      const newUploadedImages = [...uploadedImages];

      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("images", { message: "Only image files are allowed" });
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("images", { message: "Image size must be less than 5MB" });
          continue;
        }

        newImageFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e) => {
          newUploadedImages.push(e.target.result);
          setUploadedImages([...newUploadedImages]);
        };
        reader.readAsDataURL(file);
      }

      setImageFiles(newImageFiles);
    } catch (error) {
      setError("images", { message: "Failed to upload images" });
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Validation for publishing
  const validateForPublish = (data) => {
    const requiredFields = {
      description: "Description is required to publish",
      category: "Category is required to publish",
      date: "Event date is required to publish",
      time: "Start time is required to publish",
      endTime: "End time is required to publish",
      venue: "Venue is required to publish",
      address: "Address is required to publish",
      city: "City/State is required to publish",
    };

    const errors = [];
    for (const [field, message] of Object.entries(requiredFields)) {
      if (!data[field]) {
        errors.push(message);
      }
    }

    // Validate ticket pricing
    if (!useLegacyPricing) {
      const invalidTickets = ticketTypes.filter(
        (t) =>
          !t.price ||
          !t.capacity ||
          parseFloat(t.price) < 0 ||
          parseInt(t.capacity) < 1
      );
      if (invalidTickets.length > 0) {
        errors.push("All ticket types must have valid price and capacity");
      }
    } else {
      if (!data.price || !data.capacity) {
        errors.push("Price and capacity are required to publish");
      }
    }

    return errors;
  };

  // Form submission handlers
  const handlePublishClick = (data) => {
    const validationErrors = validateForPublish(data);
    if (validationErrors.length > 0) {
      setError("root.serverError", {
        message: `Cannot publish event: ${validationErrors.join(", ")}`,
      });
      return;
    }

    setPublishData(data);
    setShowPaymentAgreement(true);
  };

  const handleAgreementConfirm = async (agreementData) => {
    try {
      setSavingAs("published");
      
      const formData = new FormData();
      
      // Append basic event data
      formData.append("title", publishData.title);
      formData.append("status", "published");
      formData.append("description", publishData.description);
      if (publishData.longDescription) formData.append("longDescription", publishData.longDescription);
      formData.append("category", publishData.category);
      formData.append("date", publishData.date);
      formData.append("time", publishData.time);
      formData.append("endTime", publishData.endTime);
      formData.append("venue", publishData.venue);
      formData.append("address", publishData.address);
      formData.append("city", publishData.city);

      // Append ticket types or legacy pricing
      if (!useLegacyPricing) {
        const validTicketTypes = ticketTypes
          .filter((t) => t.price && t.capacity)
          .map((t) => ({
            name: t.name,
            price: parseFloat(t.price),
            capacity: parseInt(t.capacity),
            description: t.description || "",
            benefits: t.benefits || [],
          }));

        if (validTicketTypes.length > 0) {
          formData.append("ticketTypes", JSON.stringify(validTicketTypes));
        }
      } else {
        if (publishData.price) formData.append("price", publishData.price);
        if (publishData.capacity) formData.append("capacity", publishData.capacity);
      }

      // Append dynamic fields
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
      if (requirements.length > 0) formData.append("requirements", JSON.stringify(requirements));
      
      // Append agreement data
      formData.append("agreement", JSON.stringify(agreementData));

      // Append images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await apiCall(eventAPI.createEvent, formData);

      if (result.success) {
        setSuccessMessage("Event published successfully with payment agreement!");
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2500);
      } else {
        setError("root.serverError", {
          message: result.error || "Failed to publish event"
        });
      }
    } catch (error) {
      setError("root.serverError", {
        message: "An unexpected error occurred. Please try again."
      });
    } finally {
      setSavingAs(null);
    }
  };

  const onSubmit = async (data, status = "draft") => {
    try {
      setSavingAs(status);

      if (status === "published") {
        handlePublishClick(data);
        return;
      }

      // Draft submission
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("status", status);

      if (data.description) formData.append("description", data.description);
      if (data.longDescription) formData.append("longDescription", data.longDescription);
      if (data.category) formData.append("category", data.category);
      if (data.date) formData.append("date", data.date);
      if (data.time) formData.append("time", data.time);
      if (data.endTime) formData.append("endTime", data.endTime);
      if (data.venue) formData.append("venue", data.venue);
      if (data.address) formData.append("address", data.address);
      if (data.city) formData.append("city", data.city);

      if (!useLegacyPricing) {
        const validTicketTypes = ticketTypes
          .filter((t) => t.price && t.capacity)
          .map((t) => ({
            name: t.name,
            price: parseFloat(t.price),
            capacity: parseInt(t.capacity),
            description: t.description || "",
            benefits: t.benefits || [],
          }));

        if (validTicketTypes.length > 0) {
          formData.append("ticketTypes", JSON.stringify(validTicketTypes));
        }
      } else {
        if (data.price) formData.append("price", data.price);
        if (data.capacity) formData.append("capacity", data.capacity);
      }

      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));
      if (requirements.length > 0) formData.append("requirements", JSON.stringify(requirements));

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await apiCall(eventAPI.createEvent, formData);

      if (result.success) {
        setSuccessMessage(
          "Event saved as draft! You can edit and publish it later from your dashboard."
        );
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2500);
      } else {
        setError("root.serverError", {
          message: result.error || `Failed to save as draft`
        });
      }
    } catch (error) {
      setError("root.serverError", {
        message: "An unexpected error occurred. Please try again."
      });
    } finally {
      setSavingAs(null);
    }
  };

  // Loading and authentication states
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="w-11/12 mx-auto container py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Event Creator
              </h3>
              <p className="text-gray-600">Preparing your event creation workspace...</p>
            </div>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

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

  if (showPaymentAgreement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <PaymentAgreement
          eventData={publishData}
          ticketTypes={ticketTypes}
          onAgree={handleAgreementConfirm}
          onCancel={() => navigate('/dashboard/organizer')}
          onBack={() => setShowPaymentAgreement(false)}
        />
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
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">{successMessage}</p>
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
            Create New <span className="text-[#FF6B35]">Event</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your event. You can save as
            draft and publish later.
          </p>
        </div>

        {/* Server Error */}
        {errors.root?.serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {errors.root.serverError.message}
            </p>
          </div>
        )}

        <form className="space-y-8">
          {/* Basic Information */}
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
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category {!watch("category") && <span className="text-gray-400">(Required to publish)</span>}
                </label>
                <select
                  {...register("category")}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description {!watch("description") && <span className="text-gray-400">(Required to publish)</span>}
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  placeholder="Brief description of your event (50-2000 characters)"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description (Optional)
                </label>
                <textarea
                  {...register("longDescription")}
                  rows={6}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  placeholder="Provide a more detailed description of your event, including agenda, speakers, activities, etc."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed in the "About this event" section
                </p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Date & Time {(!watch("date") || !watch("time") || !watch("endTime")) && (
                <span className="text-sm text-gray-400 font-normal">(Required to publish)</span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  {...register("date")}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    {...register("time")}
                    disabled={savingAs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    {...register("endTime")}
                    disabled={savingAs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Location {(!watch("venue") || !watch("address") || !watch("city")) && (
                <span className="text-sm text-gray-400 font-normal">(Required to publish)</span>
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name
                </label>
                <input
                  type="text"
                  {...register("venue")}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  placeholder="e.g., International Conference Center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <input
                  type="text"
                  {...register("address")}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  placeholder="Street address, area, landmark"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  {...register("city")}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select your state</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Types & Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[#FF6B35]" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Ticket Types & Pricing
                </h3>
                {ticketTypes.every((t) => !t.price || !t.capacity) && (
                  <span className="text-sm text-gray-400">(Required to publish)</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setUseLegacyPricing(!useLegacyPricing)}
                disabled={savingAs}
                className="text-sm text-[#FF6B35] hover:underline disabled:opacity-50"
              >
                {useLegacyPricing ? "Use Multiple Ticket Types" : "Use Single Price"}
              </button>
            </div>

            {!useLegacyPricing ? (
              <div className="space-y-6">
                {ticketTypes.map((ticket, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <select
                        value={ticket.name}
                        onChange={(e) => updateTicketType(index, "name", e.target.value)}
                        disabled={savingAs}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold disabled:opacity-50"
                      >
                        {TICKET_TYPES.map((type) => (
                          <option
                            key={type}
                            value={type}
                            disabled={ticketTypes.some((t, i) => i !== index && t.name === type)}
                          >
                            {type}
                          </option>
                        ))}
                      </select>
                      {ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          disabled={savingAs}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₦)
                        </label>
                        <input
                          type="number"
                          value={ticket.price}
                          onChange={(e) => updateTicketType(index, "price", e.target.value)}
                          disabled={savingAs}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacity
                        </label>
                        <input
                          type="number"
                          value={ticket.capacity}
                          onChange={(e) => updateTicketType(index, "capacity", e.target.value)}
                          disabled={savingAs}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                          placeholder="Number of tickets"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={ticket.description}
                        onChange={(e) => updateTicketType(index, "description", e.target.value)}
                        disabled={savingAs}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                        placeholder="e.g., Includes front row seating"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefits (Optional)
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          id={`benefit-input-${index}`}
                          disabled={savingAs}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                          placeholder="e.g., VIP lounge access"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.target;
                              addTicketBenefit(index, input.value);
                              input.value = "";
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`benefit-input-${index}`);
                            addTicketBenefit(index, input.value);
                            input.value = "";
                          }}
                          disabled={savingAs}
                          className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {ticket.benefits.length > 0 && (
                        <div className="space-y-1">
                          {ticket.benefits.map((benefit, benefitIndex) => (
                            <div
                              key={benefitIndex}
                              className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                            >
                              <span className="text-sm text-gray-700">• {benefit}</span>
                              <button
                                type="button"
                                onClick={() => removeTicketBenefit(index, benefitIndex)}
                                disabled={savingAs}
                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {ticketTypes.length < 3 && (
                  <button
                    type="button"
                    onClick={addTicketType}
                    disabled={savingAs}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Ticket Type
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Price (₦)
                  </label>
                  <input
                    type="number"
                    {...register("price")}
                    disabled={savingAs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    {...register("capacity")}
                    disabled={savingAs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                    placeholder="Maximum attendees"
                    min="1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-[#FF6B35]" />
              <h3 className="text-lg font-semibold text-gray-900">
                Requirements (Optional)
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
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                disabled={savingAs}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                placeholder="e.g., Valid government-issued ID"
              />
              <button
                type="button"
                onClick={addRequirement}
                disabled={savingAs}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {requirements.length > 0 && (
              <div className="space-y-2">
                {requirements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      disabled={savingAs}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
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
                Event Tags (Optional)
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
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                disabled={savingAs}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                placeholder="e.g., startup, innovation, AI"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={tags.length >= 10 || savingAs}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={savingAs}
                      className="hover:bg-white/20 rounded-full p-0.5 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{tags.length}/10 tags added</p>
          </div>

          {/* Event Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Event Images (Optional - Max 3)
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
                  disabled={imageUploading || savingAs}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535] disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1200x600 pixels, JPEG or PNG format. Max 5MB per image.
                </p>
                {errors.images && (
                  <p className="text-red-600 text-sm mt-1">{errors.images.message}</p>
                )}
                {imageUploading && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Uploading images...
                  </div>
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
                        disabled={savingAs}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col space-y-4">
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Save Your Event
                </h3>
                <p className="text-gray-600 text-sm">
                  Save as draft to edit later, or publish to make it live immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to="/dashboard/organizer"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleSubmit((data) => onSubmit(data, "draft"))}
                  disabled={isSubmitting || savingAs}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {savingAs === "draft" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Draft...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit((data) => handlePublishClick(data))}
                  disabled={isSubmitting || savingAs}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Publish Event
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">📝 Quick Tip:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Draft:</strong> Save incomplete events and finish them later. Drafts are only visible to you.</li>
                  <li><strong>Publish:</strong> All required fields must be filled to publish. Published events are visible to everyone.</li>
                  <li>You can edit or unpublish events anytime from your dashboard</li>
                </ul>
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