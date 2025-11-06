import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Calendar,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Tag,
  FileText,
  Shield,
  Eye,
  X,
  Loader,
  MapPin,
  Image as ImageIcon,
  Check,
  Info,
  Ticket,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import SocialBannerUploader from "../../../form/SocialBannerUploader/SocialBannerUploader";
import EventCommunity from "../../../form/EventCommunity/EventCommunity";
import LocationSelector from "../../../form/LocationSelector/LocationSelector";
import TicketManager from "../../../form/TicketManager/TicketManager";
import  apiClient  from "../../services/api";
import { toast } from "react-hot-toast";

const CreateEvent = () => {
  const { isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // State management
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Event type and location states
  const [eventType, setEventType] = useState("physical");
  const [virtualEventLink, setVirtualEventLink] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Social banner states
  const [socialBannerFile, setSocialBannerFile] = useState(null);
  const [socialBannerEnabled, setSocialBannerEnabled] = useState(false);

  // Community states
  const [communityData, setCommunityData] = useState(null);
  const [communityEnabled, setCommunityEnabled] = useState(false);

  // Form and data management
  const [ticketTypes, setTicketTypes] = useState([
    {
      name: "Regular",
      price: "",
      capacity: "",
      description: "",
      benefits: [],
      accessType: "both",
      requiresApproval: false,
      approvalQuestions: [],
      maxAttendees: "",
      approvalDeadline: "",
    },
  ]);
  const [useLegacyPricing, setUseLegacyPricing] = useState(false);
  const [singleTicketBenefits, setSingleTicketBenefits] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState("");

  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
    getValues,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      startDate: "",
      time: "",
      endTime: "",
      state: "",
      city: "",
    },
  });

  // Constants
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
    "Lifestyle",
    "Other",
  ];

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      icon: FileText,
      description: "Event details",
    },
    {
      number: 2,
      title: "Date & Time",
      icon: Calendar,
      description: "Schedule",
    },
    {
      number: 3,
      title: "Location",
      icon: MapPin,
      description: "Venue details",
    },
    { number: 4, title: "Tickets", icon: Ticket, description: "Pricing" },
    { number: 5, title: "Additional", icon: Tag, description: "Tags & more" },
    {
      number: 6,
      title: "Media",
      icon: ImageIcon,
      description: "Images & social",
    },
  ];

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Restore state from location 
  useEffect(() => {
    if (location.state?.eventData) {
      const {
        eventData,
        imageFiles: prevImageFiles,
        uploadedImages: prevUploadedImages,
      } = location.state;

      // Set form values
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] !== undefined && eventData[key] !== null) {
          setValue(key, eventData[key]);
        }
      });

      // Set component state
      if (eventData.eventType) setEventType(eventData.eventType);
      if (eventData.virtualEventLink)
        setVirtualEventLink(eventData.virtualEventLink);
      if (eventData.state) setSelectedState(eventData.state);
      if (eventData.city) setSelectedCity(eventData.city);
      if (eventData.isMultiDay !== undefined)
        setIsMultiDay(eventData.isMultiDay);
      if (eventData.socialBannerEnabled !== undefined)
        setSocialBannerEnabled(eventData.socialBannerEnabled);
      if (eventData.socialBannerFile)
        setSocialBannerFile(eventData.socialBannerFile);
      if (eventData.communityEnabled !== undefined)
        setCommunityEnabled(eventData.communityEnabled);
      if (eventData.communityData) setCommunityData(eventData.communityData);
      if (eventData.ticketTypes) setTicketTypes(eventData.ticketTypes);
      if (eventData.useLegacyPricing !== undefined)
        setUseLegacyPricing(eventData.useLegacyPricing);
      if (eventData.singleTicketBenefits)
        setSingleTicketBenefits(eventData.singleTicketBenefits);
      if (eventData.tags) setTags(eventData.tags);
      if (eventData.requirements) setRequirements(eventData.requirements);
      if (prevImageFiles) setImageFiles(prevImageFiles);
      if (prevUploadedImages) setUploadedImages(prevUploadedImages);
    }
  }, [location.state, setValue]);

  // Update form values when state/city changes
  useEffect(() => {
    if (selectedState) {
      setValue("state", selectedState, { shouldValidate: true });
    }
    if (selectedCity) {
      setValue("city", selectedCity, { shouldValidate: true });
    }
  }, [selectedState, selectedCity, setValue]);

  // Ensure date fields are properly set
  useEffect(() => {
    const startDate = watch("startDate");
    const time = watch("time");
    const endTime = watch("endTime");

    if (startDate) {
      setValue("startDate", startDate, { shouldValidate: true });
    }
    if (time) {
      setValue("time", time, { shouldValidate: true });
    }
    if (endTime) {
      setValue("endTime", endTime, { shouldValidate: true });
    }
  }, [watch("startDate"), watch("time"), watch("endTime"), setValue]);

  // Social Banner handler
  const handleBannerChange = (file, enabled) => {
    setSocialBannerFile(file);
    setSocialBannerEnabled(enabled);
  };

  // Community handler
  const handleCommunityChange = (data, enabled) => {
    setCommunityData(data);
    setCommunityEnabled(enabled);
  };

  // Single ticket benefits management
  const addSingleTicketBenefit = (benefit) => {
    if (benefit.trim() && singleTicketBenefits.length < 10) {
      setSingleTicketBenefits([...singleTicketBenefits, benefit.trim()]);
    }
  };

  const removeSingleTicketBenefit = (index) => {
    setSingleTicketBenefits(singleTicketBenefits.filter((_, i) => i !== index));
  };

  // Ticket type management
  const addTicketType = () => {
    if (ticketTypes.length < 3) {
      const availableTypes = ["Regular", "VIP", "VVIP"].filter(
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
            accessType: eventType === "hybrid" ? "both" : undefined,
            requiresApproval: false,
            approvalQuestions: [],
            maxAttendees: "",
            approvalDeadline: "",
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

  // Handle pricing mode toggle
  const handleTogglePricing = (newValue) => {
    setUseLegacyPricing(newValue);
    setTicketTypes([
      {
        name: "Regular",
        price: "",
        capacity: "",
        description: "",
        benefits: [],
        accessType: eventType === "hybrid" ? "both" : undefined,
        requiresApproval: false,
        approvalQuestions: [],
        maxAttendees: "",
        approvalDeadline: "",
      },
    ]);
    setSingleTicketBenefits([]);
  };

  // Handle event type change
  const handleEventTypeChange = (newType) => {
    setEventType(newType);

    if (newType === "physical") {
      setVirtualEventLink("");
    }

    if (newType === "hybrid") {
      setTicketTypes(
        ticketTypes.map((ticket) => ({
          ...ticket,
          accessType: ticket.accessType || "both",
        }))
      );
    } else {
      setTicketTypes(
        ticketTypes.map((ticket) => ({
          ...ticket,
          accessType: undefined,
        }))
      );
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
      toast.error("Maximum 3 images allowed");
      return;
    }

    setImageUploading(true);

    try {
      const newImageFiles = [...imageFiles];
      const newUploadedImages = [...uploadedImages];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error("Please upload only image files");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size should be less than 5MB");
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
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Failed to upload images");
      toast.error("Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    toast.success("Image removed");
  };

  // Step validation
  const validateStep = async (step) => {
    let isValid = true;
    const values = getValues();

    switch (step) {
      case 1:
        isValid = await trigger(["title", "description", "category"]);
        break;
      case 2:
        isValid = await trigger(["startDate", "time", "endTime"]);

        if (!values.startDate) {
          isValid = false;
        }
        if (!values.time) {
          isValid = false;
        }
        if (!values.endTime) {
          isValid = false;
        }

        if (isMultiDay && values.endDate) {
          const start = new Date(values.startDate);
          const end = new Date(values.endDate);
          if (end < start) {
            isValid = false;
          }
        }
        break;
      case 3:
        if (eventType === "physical" || eventType === "hybrid") {
          isValid = await trigger(["venue", "address", "state", "city"]);
          isValid = isValid && selectedState && selectedCity;

          if (!values.state || !values.city) {
            isValid = false;
          }
        } else if (eventType === "virtual") {
          isValid = !!virtualEventLink;
        }
        break;
      case 4:
        if (!useLegacyPricing) {
          const validTickets = ticketTypes.filter(
            (t) =>
              t.price !== "" && t.capacity !== "" && parseFloat(t.price) >= 0
          );
          isValid = validTickets.length > 0;
        } else {
          isValid = await trigger(["price", "capacity"]);
        }
        break;
      case 5:
        isValid = true;
        break;
      case 6:
        isValid = true;
        break;
      default:
        isValid = true;
    }

    return isValid;
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCompletedSteps({ ...completedSteps, [currentStep]: true });
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please complete all required fields before proceeding");
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Prepare preview data
  const preparePreviewData = () => {
    const formData = getValues();

    let finalTicketTypes = ticketTypes;
    if (useLegacyPricing) {
      finalTicketTypes = [
        {
          name: "Regular",
          price: formData.price || "",
          capacity: formData.capacity || "",
          description: formData.ticketDescription || "",
          benefits: singleTicketBenefits || [],
          accessType: eventType === "hybrid" ? "both" : undefined,
          requiresApproval: ticketTypes[0]?.requiresApproval || false,
          approvalQuestions: ticketTypes[0]?.approvalQuestions || [],
          maxAttendees: ticketTypes[0]?.maxAttendees || "",
          approvalDeadline: ticketTypes[0]?.approvalDeadline || "",
        },
      ];
    }

    const eventData = {
      title: formData.title || "",
      category: formData.category || "",
      description: formData.description || "",
      longDescription: formData.longDescription || "",
      startDate: formData.startDate || "",
      endDate: formData.endDate || "",
      time: formData.time || "",
      endTime: formData.endTime || "",
      isMultiDay: isMultiDay,
      eventType: eventType,
      virtualEventLink: virtualEventLink || "",
      venue: formData.venue || "",
      address: formData.address || "",
      state: selectedState || formData.state || "",
      city: selectedCity || formData.city || "",
      ticketTypes: finalTicketTypes,
      useLegacyPricing: useLegacyPricing,
      singleTicketBenefits: singleTicketBenefits,
      price: formData.price || "",
      capacity: formData.capacity || "",
      tags: tags,
      requirements: requirements,
      socialBannerEnabled: socialBannerEnabled,
      socialBannerFile: socialBannerFile,
      communityEnabled: communityEnabled,
      communityData: communityData,
    };

    return eventData;
  };

  // Handle preview - NO API CALL
  const handlePreview = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) {
      toast.error("Please complete all required fields before previewing");
      return;
    }

    const eventData = preparePreviewData();

    console.log("📦 Navigating to preview with data:", {
      eventData,
      imageFilesCount: imageFiles.length,
      uploadedImagesCount: uploadedImages.length,
    });

    // Navigate directly to preview without API validation
    navigate("/events/preview", {
      state: {
        eventData: eventData,
        imageFiles: imageFiles,
        uploadedImages: uploadedImages,
      },
    });
  };

  // Loading screen
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
              <p className="text-gray-600">
                Preparing your event creation workspace...
              </p>
            </div>
          </div>
        </div>
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  // Not authenticated screen
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

  // Not organizer screen
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

  // Main form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-11/12 mx-auto container py-8">
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
            Step {currentStep} of {totalSteps}:{" "}
            {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps[step.number];
              const isCurrent = currentStep === step.number;
              const isPast = currentStep > step.number;

              return (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted || isPast
                          ? "bg-green-500 text-white"
                          : isCurrent
                          ? "bg-[#FF6B35] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted || isPast ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium text-center hidden md:block ${
                        isCurrent ? "text-[#FF6B35]" : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 transition-all ${
                        isPast ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <form className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-6 w-6 text-[#FF6B35]" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    {...register("title", {
                      required: "Event title is required",
                      minLength: {
                        value: 5,
                        message: "Title must be at least 5 characters",
                      },
                      maxLength: {
                        value: 100,
                        message: "Title must be less than 100 characters",
                      },
                    })}
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
                    {...register("category", {
                      required: "Category is required",
                    })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    {...register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 50,
                        message: "Description must be at least 50 characters",
                      },
                      maxLength: {
                        value: 2000,
                        message:
                          "Description must be less than 2000 characters",
                      },
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Brief description of your event (50-2000 characters)"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {watch("description")?.length || 0}/2000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description (Optional)
                  </label>
                  <textarea
                    {...register("longDescription", {
                      maxLength: {
                        value: 5000,
                        message:
                          "Long description must be less than 5000 characters",
                      },
                    })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Provide a more detailed description of your event, including agenda, speakers, activities, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be displayed in the "About this event" section
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-[#FF6B35]" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Date & Time
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="multiDay"
                    checked={isMultiDay}
                    onChange={(e) => setIsMultiDay(e.target.checked)}
                    className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                  />
                  <label
                    htmlFor="multiDay"
                    className="text-sm font-medium text-gray-700"
                  >
                    This is a multi-day event
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isMultiDay ? "Start Date" : "Event Date"} *
                    </label>
                    <input
                      type="date"
                      {...register("startDate", {
                        required: "Start date is required",
                      })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    {errors.startDate && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  {isMultiDay && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        {...register("endDate", {
                          required: isMultiDay
                            ? "End date is required for multi-day events"
                            : false,
                        })}
                        min={
                          watch("startDate") ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      />
                      {errors.endDate && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.endDate.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      {...register("time", {
                        required: "Start time is required",
                      })}
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
                      {...register("endTime", {
                        required: "End time is required",
                      })}
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
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <LocationSelector
                selectedState={selectedState}
                selectedCity={selectedCity}
                onStateChange={setSelectedState}
                onCityChange={setSelectedCity}
                disabled={false}
                errors={errors}
                register={register}
                eventType={eventType}
                onEventTypeChange={handleEventTypeChange}
                virtualEventLink={virtualEventLink}
                onVirtualEventLinkChange={setVirtualEventLink}
              />
            </div>
          )}

          {/* Step 4: Tickets */}
          {currentStep === 4 && (
            <TicketManager
              useLegacyPricing={useLegacyPricing}
              onTogglePricing={handleTogglePricing}
              ticketTypes={ticketTypes}
              onAddTicket={addTicketType}
              onRemoveTicket={removeTicketType}
              onUpdateTicket={updateTicketType}
              onAddTicketBenefit={addTicketBenefit}
              onRemoveTicketBenefit={removeTicketBenefit}
              singleTicketBenefits={singleTicketBenefits}
              onAddSingleBenefit={addSingleTicketBenefit}
              onRemoveSingleBenefit={removeSingleTicketBenefit}
              eventType={eventType}
              onEventTypeChange={handleEventTypeChange}
              virtualEventLink={virtualEventLink}
              onVirtualEventLinkChange={setVirtualEventLink}
              register={register}
              savingAs={null}
              watch={watch}
              errors={errors}
            />
          )}

          {/* Step 5: Additional Information */}
          {currentStep === 5 && (
            <div className="space-y-8">
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
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addRequirement())
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
                        key={index}
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
            </div>
          )}

          {/* Step 6: Media */}
          {currentStep === 6 && (
            <div className="space-y-8">
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
                      disabled={imageUploading || uploadedImages.length >= 3}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535] disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 1200x600 pixels, JPEG or PNG format. Max 5MB per image.
                    </p>
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

              <SocialBannerUploader
                onBannerChange={handleBannerChange}
                disabled={false}
              />

              <EventCommunity
                onCommunityChange={handleCommunityChange}
                initialCommunity={communityData}
                disabled={false}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-colors flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-colors flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Event
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold mb-2"> Quick Tips:</p>
                <ul className="space-y-1 list-disc list-inside">
                  {currentStep === 1 && (
                    <>
                      <li>
                        Choose a clear, descriptive title that captures your event
                      </li>
                      <li>
                        Write a compelling description to attract attendees
                      </li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li>Double-check your event date and time</li>
                      <li>Consider your target audience's timezone</li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li>Provide accurate venue information</li>
                      <li>Include landmarks or directions if needed</li>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <li>Set competitive ticket prices</li>
                      <li>Consider offering early bird or group discounts</li>
                    </>
                  )}
                  {currentStep === 5 && (
                    <>
                      <li>Tags help people discover your event</li>
                      <li>Clear requirements help attendees prepare</li>
                    </>
                  )}
                  {currentStep === 6 && (
                    <>
                      <li>High-quality images attract more attendees</li>
                      <li>Social banners boost event visibility online</li>
                    </>
                  )}
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