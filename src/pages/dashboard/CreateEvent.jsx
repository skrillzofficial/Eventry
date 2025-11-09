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
  X,
  Loader,
  MapPin,
  Image as ImageIcon,
  Check,
  Ticket,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import TicketManager from "../../../form/TicketManager/TicketManager";
import SocialBannerUploader from "../../../form/SocialBannerUploader/SocialBannerUploader";
import EventCommunity from "../../../form/EventCommunity/EventCommunity";
import LocationSelector from "../../../form/LocationSelector/LocationSelector";
import { toast } from "react-hot-toast";

const CATEGORIES = [
  "Technology", "Business", "Marketing", "Arts", "Health", 
  "Education", "Music", "Food", "Sports", "Entertainment", 
  "Networking", "Lifestyle", "Other",
];

const CreateEvent = () => {
  const { isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  // Form state
  const [formState, setFormState] = useState({
    uploadedImages: [],
    imageFiles: [],
    eventType: "physical",
    virtualEventLink: "",
    selectedState: "",
    selectedCity: "",
    isMultiDay: false,
    socialBannerFile: null,
    socialBannerEnabled: false,
    communityData: null,
    communityEnabled: false,
    ticketTypes: [{
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
    }],
    useLegacyPricing: false,
    singleTicketBenefits: [],
    tags: [],
    requirements: [],
  });

  // React Hook Form
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
      title: "",
      category: "",
      description: "",
      longDescription: "",
      startDate: "",
      endDate: "",
      time: "",
      endTime: "",
      venue: "",
      address: "",
      state: "",
      city: "",
      price: "",
      capacity: "",
      ticketDescription: "",
    },
  });

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText, description: "Event details" },
    { number: 2, title: "Date & Time", icon: Calendar, description: "Schedule" },
    { number: 3, title: "Location", icon: MapPin, description: "Venue details" },
    { number: 4, title: "Tickets", icon: Ticket, description: "Pricing" },
    { number: 5, title: "Additional", icon: Tag, description: "Tags & more" },
    { number: 6, title: "Media", icon: ImageIcon, description: "Images & social" },
  ];

  const totalSteps = steps.length;

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.state?.eventData) {
      const { eventData, imageFiles, uploadedImages } = location.state;
      
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] != null && getValues()[key] !== undefined) {
          setValue(key, eventData[key]);
        }
      });

      const stateUpdates = {};
      [
        'eventType', 'virtualEventLink', 'isMultiDay', 'socialBannerFile',
        'socialBannerEnabled', 'communityData', 'communityEnabled',
        'ticketTypes', 'useLegacyPricing', 'singleTicketBenefits', 'tags', 'requirements'
      ].forEach(key => {
        if (eventData[key] != null) stateUpdates[key] = eventData[key];
      });

      if (eventData.state) stateUpdates.selectedState = eventData.state;
      if (eventData.city) stateUpdates.selectedCity = eventData.city;
      if (imageFiles) stateUpdates.imageFiles = imageFiles;
      if (uploadedImages) stateUpdates.uploadedImages = uploadedImages;

      setFormState(prev => ({ ...prev, ...stateUpdates }));
    }
  }, [location.state, setValue, getValues]);

  useEffect(() => {
    if (formState.selectedState) setValue("state", formState.selectedState, { shouldValidate: true });
    if (formState.selectedCity) setValue("city", formState.selectedCity, { shouldValidate: true });
  }, [formState.selectedState, formState.selectedCity, setValue]);

  // State management
  const updateFormState = (updates) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Image handling
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length + formState.uploadedImages.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setImageUploading(true);

    try {
      const newImageFiles = [...formState.imageFiles];
      const newUploadedImages = [...formState.uploadedImages];

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
          updateFormState({ uploadedImages: [...newUploadedImages] });
        };
        reader.readAsDataURL(file);
      }

      updateFormState({ imageFiles: newImageFiles });
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Failed to upload images");
      toast.error("Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    updateFormState({
      uploadedImages: formState.uploadedImages.filter((_, i) => i !== index),
      imageFiles: formState.imageFiles.filter((_, i) => i !== index),
    });
    toast.success("Image removed");
  };

  // Ticket management
  const addTicketType = () => {
    if (formState.ticketTypes.length < 3) {
      const availableTypes = ["Regular", "VIP", "VVIP"].filter(
        type => !formState.ticketTypes.find(t => t.name === type)
      );
      if (availableTypes.length > 0) {
        updateFormState({
          ticketTypes: [
            ...formState.ticketTypes,
            {
              name: availableTypes[0],
              price: "",
              capacity: "",
              description: "",
              benefits: [],
              accessType: formState.eventType === "hybrid" ? "both" : undefined,
              requiresApproval: false,
              approvalQuestions: [],
              maxAttendees: "",
              approvalDeadline: "",
            }
          ]
        });
      }
    }
  };

  const removeTicketType = (index) => {
    if (formState.ticketTypes.length > 1) {
      updateFormState({
        ticketTypes: formState.ticketTypes.filter((_, i) => i !== index)
      });
    }
  };

  const updateTicketType = (index, field, value) => {
    const updatedTickets = [...formState.ticketTypes];
    
    if (field === "capacity") {
      const numValue = parseInt(value) || 1;
      updatedTickets[index] = { ...updatedTickets[index], [field]: Math.max(1, numValue) };
    } else {
      updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    }
    
    updateFormState({ ticketTypes: updatedTickets });
  };

  const handleTogglePricing = (newValue) => {
    updateFormState({ 
      useLegacyPricing: newValue,
      ticketTypes: [{
        name: "Regular",
        price: "",
        capacity: "",
        description: "",
        benefits: [],
        accessType: formState.eventType === "hybrid" ? "both" : undefined,
        requiresApproval: false,
        approvalQuestions: [],
        maxAttendees: "",
        approvalDeadline: "",
      }],
      singleTicketBenefits: [],
    });
  };

  // Tag and requirement management
  const addTag = () => {
    const tagInput = document.querySelector('input[placeholder*="startup"]')?.value || "";
    if (tagInput.trim() && !formState.tags.includes(tagInput.trim()) && formState.tags.length < 10) {
      updateFormState({
        tags: [...formState.tags, tagInput.trim()]
      });
      document.querySelector('input[placeholder*="startup"]').value = "";
    }
  };

  const removeTag = (index) => {
    updateFormState({
      tags: formState.tags.filter((_, i) => i !== index)
    });
  };

  const addRequirement = () => {
    const requirementInput = document.querySelector('input[placeholder*="Valid government"]')?.value || "";
    if (requirementInput.trim() && formState.requirements.length < 10) {
      updateFormState({
        requirements: [...formState.requirements, requirementInput.trim()]
      });
      document.querySelector('input[placeholder*="Valid government"]').value = "";
    }
  };

  const removeRequirement = (index) => {
    updateFormState({
      requirements: formState.requirements.filter((_, i) => i !== index)
    });
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
        if (!values.startDate || !values.time || !values.endTime) isValid = false;
        
        // Auto-set endDate if not set
        if (!values.endDate && values.startDate) {
          setValue("endDate", values.startDate);
        }
        
        if (formState.isMultiDay && values.endDate) {
          const start = new Date(values.startDate);
          const end = new Date(values.endDate);
          if (end < start) isValid = false;
        }
        break;
      case 3:
        if (formState.eventType === "physical" || formState.eventType === "hybrid") {
          isValid = await trigger(["venue", "address", "state", "city"]);
          isValid = isValid && formState.selectedState && formState.selectedCity;
        } else if (formState.eventType === "virtual") {
          isValid = !!formState.virtualEventLink;
        }
        break;
      case 4:
        if (!formState.useLegacyPricing) {
          isValid = formState.ticketTypes.some(t => t.price !== "" && t.capacity !== "" && parseFloat(t.price) >= 0);
        } else {
          isValid = await trigger(["price", "capacity"]);
        }
        break;
      case 5:
      case 6:
        isValid = true;
        break;
      default:
        isValid = true;
    }

    return isValid;
  };

  // Navigation
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    
    // Auto-set endDate for single-day events
    if (currentStep === 2 && !formState.isMultiDay && !getValues("endDate")) {
      setValue("endDate", getValues("startDate"));
    }
    
    if (isValid) {
      setCompletedSteps(prev => ({ ...prev, [currentStep]: true }));
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please complete all required fields before proceeding");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Prepare data for preview
  const preparePreviewData = () => {
    const formValues = getValues();

    // Ensure endDate is set
    if (!formValues.endDate && formValues.startDate) {
      formValues.endDate = formValues.startDate;
    }

    // Ensure capacity is valid
    if (formState.useLegacyPricing) {
      formValues.capacity = parseInt(formValues.capacity) || 1;
    }

    let finalTicketTypes = formState.ticketTypes;
    if (formState.useLegacyPricing) {
      finalTicketTypes = [{
        name: "Regular",
        price: parseFloat(formValues.price) || 0,
        capacity: parseInt(formValues.capacity) || 1,
        description: formValues.ticketDescription || "",
        benefits: formState.singleTicketBenefits || [],
        accessType: formState.eventType === "hybrid" ? "both" : undefined,
        requiresApproval: formState.ticketTypes[0]?.requiresApproval || false,
        approvalQuestions: formState.ticketTypes[0]?.approvalQuestions || [],
        maxAttendees: formState.ticketTypes[0]?.maxAttendees || "",
        approvalDeadline: formState.ticketTypes[0]?.approvalDeadline || "",
      }];
    }

    const eventData = {
      // From react-hook-form
      ...formValues,
      
      // From formState
      isMultiDay: formState.isMultiDay,
      eventType: formState.eventType,
      virtualEventLink: formState.virtualEventLink,
      state: formState.selectedState,
      city: formState.selectedCity,
      ticketTypes: finalTicketTypes,
      useLegacyPricing: formState.useLegacyPricing,
      singleTicketBenefits: formState.singleTicketBenefits,
      tags: formState.tags,
      requirements: formState.requirements,
      socialBannerEnabled: formState.socialBannerEnabled,
      socialBannerFile: formState.socialBannerFile,
      communityEnabled: formState.communityEnabled,
      communityData: formState.communityData,
    };

    return eventData;
  };

  const handlePreview = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) {
      toast.error("Please complete all required fields before previewing");
      return;
    }

    // Validate required images
    if (formState.uploadedImages.length === 0) {
      toast.error("At least one event image is required");
      return;
    }

    const eventData = preparePreviewData();

    console.log("📦 Navigating to preview with data:", {
      eventData,
      imageFilesCount: formState.imageFiles.length,
      uploadedImagesCount: formState.uploadedImages.length,
    });

    // ✅ Store form data temporarily for the preview and agreement flow
    localStorage.setItem('draftEventData', JSON.stringify({
      eventData,
      imageFiles: formState.imageFiles,
      uploadedImages: formState.uploadedImages,
    }));

    navigate("/events/preview", {
      state: {
        eventData,
        imageFiles: formState.imageFiles,
        uploadedImages: formState.uploadedImages,
      },
    });
  };

  // Add cleanup effect to remove draft data when leaving create event
  useEffect(() => {
    return () => {
      // Clean up draft data when component unmounts (user leaves create flow)
      if (!location.pathname.includes('/preview') && !location.pathname.includes('/agreement')) {
        localStorage.removeItem('draftEventData');
      }
    };
  }, [location.pathname]);

  // Loading and auth screens
  if (pageLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !isOrganizer) {
    return <AuthScreen isAuthenticated={isAuthenticated} isOrganizer={isOrganizer} />;
  }

  // Main form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="w-11/12 mx-auto container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard/organizer" className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New <span className="text-[#FF6B35]">Event</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Step {currentStep} of {totalSteps}: {steps[currentStep - 1].description}
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted || isPast ? "bg-green-500 text-white" : 
                      isCurrent ? "bg-[#FF6B35] text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {isCompleted || isPast ? <Check className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                    </div>
                    <p className={`text-sm font-medium text-center hidden md:block ${
                      isCurrent ? "text-[#FF6B35]" : "text-gray-600"
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 transition-all ${
                      isPast ? "bg-green-500" : "bg-gray-200"
                    }`} />
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
                <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    {...register("title", {
                      required: "Event title is required",
                      minLength: { value: 5, message: "Title must be at least 5 characters" },
                      maxLength: { value: 100, message: "Title must be less than 100 characters" },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Enter event title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    {...register("category", { required: "Category is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                  <textarea
                    {...register("description", {
                      required: "Description is required",
                      minLength: { value: 50, message: "Description must be at least 50 characters" },
                      maxLength: { value: 2000, message: "Description must be less than 2000 characters" },
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Brief description of your event (50-2000 characters)"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">{watch("description")?.length || 0}/2000 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description (Optional)</label>
                  <textarea
                    {...register("longDescription", {
                      maxLength: { value: 5000, message: "Long description must be less than 5000 characters" },
                    })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Provide a more detailed description of your event, including agenda, speakers, activities, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be displayed in the "About this event" section</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-[#FF6B35]" />
                <h3 className="text-xl font-semibold text-gray-900">Date & Time</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="multiDay"
                    checked={formState.isMultiDay}
                    onChange={(e) => updateFormState({ isMultiDay: e.target.checked })}
                    className="w-4 h-4 text-[#FF6B35] border-gray-300 rounded focus:ring-[#FF6B35]"
                  />
                  <label htmlFor="multiDay" className="text-sm font-medium text-gray-700">
                    This is a multi-day event
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formState.isMultiDay ? "Start Date" : "Event Date"} *
                    </label>
                    <input
                      type="date"
                      {...register("startDate", { required: "Start date is required" })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formState.isMultiDay ? "End Date *" : "End Date"}
                    </label>
                    <input
                      type="date"
                      {...register("endDate", { 
                        required: formState.isMultiDay ? "End date is required for multi-day events" : false 
                      })}
                      min={watch("startDate") || new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate.message}</p>}
                    {!formState.isMultiDay && (
                      <p className="text-xs text-gray-500 mt-1">
                        Will be automatically set to the same as start date if left empty
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      {...register("time", { required: "Start time is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      {...register("endTime", { required: "End time is required" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    />
                    {errors.endTime && <p className="text-red-600 text-sm mt-1">{errors.endTime.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <LocationSelector
                selectedState={formState.selectedState}
                selectedCity={formState.selectedCity}
                onStateChange={(state) => updateFormState({ selectedState: state })}
                onCityChange={(city) => updateFormState({ selectedCity: city })}
                disabled={false}
                errors={errors}
                register={register}
                eventType={formState.eventType}
                onEventTypeChange={(type) => updateFormState({ eventType: type })}
                virtualEventLink={formState.virtualEventLink}
                onVirtualEventLinkChange={(link) => updateFormState({ virtualEventLink: link })}
              />
            </div>
          )}

          {/* Step 4: Tickets */}
          {currentStep === 4 && (
            <TicketManager
              useLegacyPricing={formState.useLegacyPricing}
              onTogglePricing={handleTogglePricing}
              ticketTypes={formState.ticketTypes}
              onAddTicket={addTicketType}
              onRemoveTicket={removeTicketType}
              onUpdateTicket={updateTicketType}
              onAddTicketBenefit={(ticketIndex, benefit) => {
                const updatedTickets = [...formState.ticketTypes];
                updatedTickets[ticketIndex].benefits = [...updatedTickets[ticketIndex].benefits, benefit];
                updateFormState({ ticketTypes: updatedTickets });
              }}
              onRemoveTicketBenefit={(ticketIndex, benefitIndex) => {
                const updatedTickets = [...formState.ticketTypes];
                updatedTickets[ticketIndex].benefits = updatedTickets[ticketIndex].benefits.filter((_, i) => i !== benefitIndex);
                updateFormState({ ticketTypes: updatedTickets });
              }}
              singleTicketBenefits={formState.singleTicketBenefits}
              onAddSingleBenefit={(benefit) => {
                if (benefit.trim() && formState.singleTicketBenefits.length < 10) {
                  updateFormState({
                    singleTicketBenefits: [...formState.singleTicketBenefits, benefit.trim()]
                  });
                }
              }}
              onRemoveSingleBenefit={(index) => {
                updateFormState({
                  singleTicketBenefits: formState.singleTicketBenefits.filter((_, i) => i !== index)
                });
              }}
              eventType={formState.eventType}
              onEventTypeChange={(type) => updateFormState({ eventType: type })}
              virtualEventLink={formState.virtualEventLink}
              onVirtualEventLinkChange={(link) => updateFormState({ virtualEventLink: link })}
              register={register}
              savingAs={null}
              watch={watch}
              errors={errors}
            />
          )}

          {/* Step 5: Additional Information */}
          {currentStep === 5 && (
            <div className="space-y-8">
              {/* Tags */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-[#FF6B35]" />
                  <h3 className="text-lg font-semibold text-gray-900">Event Tags (Optional)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Add tags to help people discover your event (max 10 tags)</p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="e.g., startup, innovation, AI"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={formState.tags.length >= 10}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {formState.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formState.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(index)} className="hover:bg-white/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">{formState.tags.length}/10 tags added</p>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-[#FF6B35]" />
                  <h3 className="text-lg font-semibold text-gray-900">Requirements (Optional)</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">List what attendees need to bring or have</p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="e.g., Valid government-issued ID"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
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

                {formState.requirements.length > 0 && (
                  <div className="space-y-2">
                    {formState.requirements.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-gray-700">{item}</span>
                        <button type="button" onClick={() => removeRequirement(index)} className="text-red-500 hover:text-red-700">
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
              {/* Event Images */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Event Images {formState.uploadedImages.length === 0 && (
                    <span className="text-red-500">* (Required to publish)</span>
                  )}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Event Images *</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={imageUploading || formState.uploadedImages.length >= 3}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535] disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      At least 1 image is required. Recommended: 1200x600 pixels, JPEG or PNG format. Max 5MB per image.
                    </p>
                    {imageUploading && (
                      <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
                        <Loader className="h-4 w-4 animate-spin" />
                        Uploading images...
                      </div>
                    )}
                  </div>
                  {formState.uploadedImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {formState.uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img src={image} alt={`Event preview ${index + 1}`} className="h-32 w-full object-cover rounded-lg" />
                          <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {formState.uploadedImages.length === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">
                        ⚠️ At least one event image is required to publish your event.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Banner */}
              <SocialBannerUploader 
                onBannerChange={(file, enabled) => updateFormState({ socialBannerFile: file, socialBannerEnabled: enabled })}
                disabled={false}
              />

              {/* Community */}
              <EventCommunity 
                onCommunityChange={(data, enabled) => updateFormState({ communityData: data, communityEnabled: enabled })}
                initialCommunity={formState.communityData}
                disabled={false}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between">
              {currentStep > 1 && (
                <button type="button" onClick={handlePrevious} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Previous
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button type="button" onClick={handleNext} className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-colors ml-auto">
                  Next Step
                </button>
              ) : (
                <button type="button" onClick={handlePreview} className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-colors ml-auto">
                  Preview Event
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

// Helper components
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="w-11/12 mx-auto container py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Event Creator</h3>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

const AuthScreen = ({ isAuthenticated, isOrganizer }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="w-11/12 mx-auto container py-16">
      <div className="text-center">
        {!isAuthenticated ? (
          <>
            <p className="text-xl text-gray-900 mb-8">You need to be logged in as an organizer to create events.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="border-2 border-[#FF6B35] text-[#FF6B35] px-6 py-3 rounded-lg font-semibold hover:bg-[#FF6B35] hover:text-white transition-colors">
                Create Account
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Organizer Account Required</h2>
            <p className="text-lg text-gray-600 mb-8">You need an organizer account to create events.</p>
            <Link to="/dashboard" className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors">
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
    <Footer />
  </div>
);

export default CreateEvent;