import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
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
  CheckCircle,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { eventAPI } from "../../services/api";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const EditEvent = () => {
  const { id: eventId } = useParams(); // ✅ Get 'id' from route and rename it to 'eventId'
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // State management
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [savingAs, setSavingAs] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);

  // Event type and location states
  const [eventType, setEventType] = useState("physical");
  const [virtualEventLink, setVirtualEventLink] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Social banner states
  const [socialBannerFile, setSocialBannerFile] = useState(null);
  const [socialBannerEnabled, setSocialBannerEnabled] = useState(false);
  const [existingSocialBanner, setExistingSocialBanner] = useState(null);

  // Ticket type management
  const [ticketTypes, setTicketTypes] = useState([]);
  const [useLegacyPricing, setUseLegacyPricing] = useState(false);
  const [singleTicketBenefits, setSingleTicketBenefits] = useState([]);

  // Dynamic fields
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState("");

  // Step completion tracking
  const [completedSteps, setCompletedSteps] = useState({
    1: false, 2: false, 3: false, 4: false, 5: false, 6: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
    getValues,
    setError,
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      category: "",
      startDate: "",
      endDate: "",
      time: "09:00",
      endTime: "17:00",
      venue: "",
      address: "",
      state: "",
      city: "",
      price: "",
      capacity: "",
    }
  });

  const CATEGORIES = [
    "Technology", "Business", "Marketing", "Arts", "Health", "Education", 
    "Music", "Food", "Sports", "Entertainment", "Networking", "Lifestyle", "Other"
  ];

  const NIGERIAN_STATES = [
    "Lagos", "Abuja", "Rivers", "Delta", "Oyo", "Kano", "Kaduna", "Edo", 
    "Plateau", "Ogun", "Ondo", "Enugu", "Anambra", "Imo", "Bauchi", "Bornu", 
    "Sokoto", "Bayelsa", "Ebonyi", "Ekiti"
  ];

  const steps = [
    { number: 1, title: "Basic Info", icon: FileText, description: "Event details" },
    { number: 2, title: "Date & Time", icon: Calendar, description: "Schedule" },
    { number: 3, title: "Location", icon: MapPin, description: "Venue details" },
    { number: 4, title: "Tickets", icon: Ticket, description: "Pricing" },
    { number: 5, title: "Additional", icon: Tag, description: "Tags & more" },
    { number: 6, title: "Media", icon: ImageIcon, description: "Images & social" },
  ];

  useEffect(() => {
    const fetchEventData = async () => {
      // Debug: Log the eventId
      console.log("EventId from params:", eventId);
      
      if (!eventId) {
        console.error("No eventId provided in URL params");
        alert("Event ID is missing. Redirecting to events page.");
        navigate('/dashboard/organizer/events');
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching event data for ID:", eventId);
        
        const response = await eventAPI.getEventById(eventId);
        
        // Check if the response has nested event data
        const eventData = response.data.event || response.data;

        console.log("Fetched event data for editing:", eventData);

        // Extract and format dates properly - handle both 'date' and 'startDate' fields
        const startDate = (eventData.startDate || eventData.date) ? 
          (eventData.startDate || eventData.date).split('T')[0] : "";
        const endDate = eventData.endDate ? eventData.endDate.split('T')[0] : "";
        
        // Prepare form data with all fields
        const formData = {
          title: eventData.title || "",
          description: eventData.description || "",
          longDescription: eventData.longDescription || "",
          category: eventData.category || "",
          startDate: startDate,
          endDate: endDate,
          time: eventData.time || eventData.startTime || "09:00",
          endTime: eventData.endTime || "17:00",
          venue: eventData.venue || "",
          address: eventData.address || "",
          state: eventData.state || "",
          city: eventData.city || "",
          price: eventData.price?.toString() || "",
          capacity: eventData.capacity?.toString() || "",
        };

        console.log("Resetting form with data:", formData);

        // Reset the entire form with the data
        reset(formData);

        // Set other state values with proper fallbacks
        setEventType(eventData.eventType || "physical");
        setVirtualEventLink(eventData.virtualEventLink || "");
        setSelectedState(eventData.state || "");
        setSelectedCity(eventData.city || "");
        
        // Check if multi-day event
        const isMultiDayEvent = endDate && endDate !== startDate;
        setIsMultiDay(isMultiDayEvent);
        
        // Set images
        if (eventData.images && Array.isArray(eventData.images) && eventData.images.length > 0) {
          const formattedImages = eventData.images.map((img, index) => ({
            url: typeof img === 'string' ? img : img.url,
            id: `existing-${index}`
          }));
          setExistingImages(formattedImages);
          console.log("Loaded existing images:", formattedImages);
        }

        // Set social banner if exists
        if (eventData.socialBanner) {
          setExistingSocialBanner(eventData.socialBanner);
          setSocialBannerEnabled(true);
        }

        // Set ticket types - preserve existing structure
        if (eventData.ticketTypes && Array.isArray(eventData.ticketTypes) && eventData.ticketTypes.length > 0) {
          console.log("Loading ticket types:", eventData.ticketTypes);
          const formattedTickets = eventData.ticketTypes.map(ticket => ({
            name: ticket.name || "Regular",
            price: ticket.price?.toString() || "",
            capacity: ticket.capacity?.toString() || "",
            description: ticket.description || "",
            benefits: Array.isArray(ticket.benefits) ? ticket.benefits : [],
            accessType: ticket.accessType || "physical",
            requiresApproval: ticket.requiresApproval || false,
            maxAttendees: ticket.maxAttendees || null,
            approvalDeadline: ticket.approvalDeadline || null,
            approvalQuestions: Array.isArray(ticket.approvalQuestions) ? ticket.approvalQuestions : [],
          }));
          setTicketTypes(formattedTickets);
          setUseLegacyPricing(false);
        } else {
          // If no ticket types, use legacy pricing with existing data
          console.log("Using legacy pricing mode");
          setUseLegacyPricing(true);
          // Values already set in reset() above
        }

        // Set tags and requirements
        setTags(Array.isArray(eventData.tags) ? eventData.tags : []);
        setRequirements(Array.isArray(eventData.requirements) ? eventData.requirements : []);
        setSingleTicketBenefits(Array.isArray(eventData.benefits) ? eventData.benefits : 
                                Array.isArray(eventData.ticketBenefits) ? eventData.ticketBenefits : []);

        // Mark all steps as completed since we're editing existing event
        setCompletedSteps({
          1: true, 2: true, 3: true, 4: true, 5: true, 6: true
        });

        console.log("Event data loaded successfully");

      } catch (error) {
        console.error("Failed to fetch event data:", error);
        console.error("Error details:", error.response?.data);
        alert(`Failed to load event data: ${error.response?.data?.message || error.message}`);
        // Navigate back if event not found
        if (error.response?.status === 404) {
          navigate('/dashboard/organizer/events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, navigate, reset]);

  const prepareEventData = (status) => {
    const formValues = getValues();
    
    const eventData = {
      title: formValues.title,
      description: formValues.description,
      longDescription: formValues.longDescription,
      category: formValues.category,
      startDate: formValues.startDate,
      endDate: isMultiDay ? formValues.endDate : formValues.startDate,
      startTime: formValues.time,
      endTime: formValues.endTime,
      eventType: eventType,
      virtualEventLink: eventType !== "physical" ? virtualEventLink : undefined,
      venue: eventType !== "virtual" ? formValues.venue : undefined,
      address: eventType !== "virtual" ? formValues.address : undefined,
      state: eventType !== "virtual" ? selectedState : undefined,
      city: eventType !== "virtual" ? selectedCity : undefined,
      tags: tags,
      requirements: requirements,
      status: status,
    };

    if (useLegacyPricing) {
      eventData.price = parseFloat(formValues.price) || 0;
      eventData.capacity = parseInt(formValues.capacity) || 0;
      if (singleTicketBenefits.length > 0) {
        eventData.benefits = singleTicketBenefits;
      }
    } else {
      eventData.ticketTypes = ticketTypes.map(ticket => ({
        ...ticket,
        price: parseFloat(ticket.price) || 0,
        capacity: parseInt(ticket.capacity) || 0
      }));
    }

    // Include images to delete
    if (imagesToDelete.length > 0) {
      eventData.imagesToDelete = imagesToDelete;
    }

    return eventData;
  };

  const handleSave = async (status) => {
    setSavingAs(status);
    
    try {
      // Validate all steps before saving
      for (let step = 1; step <= totalSteps; step++) {
        const isValid = await validateStep(step);
        if (!isValid) {
          setCurrentStep(step);
          setSavingAs(null);
          alert(`Please complete step ${step} before saving`);
          return;
        }
      }

      const eventData = prepareEventData(status);
      console.log("Updating event with data:", eventData);

      const response = await eventAPI.updateEvent(
        eventId, 
        eventData, 
        imageFiles, 
        socialBannerFile
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(
          status === "draft" ? "Event saved as draft!" : "Event updated successfully!"
        );
        setShowSuccess(true);
        
        setTimeout(() => {
          navigate('/dashboard/organizer/events');
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Failed to update event");
      }

    } catch (error) {
      console.error("Failed to update event:", error);
      alert(error.response?.data?.message || error.message || "Failed to update event. Please try again.");
    } finally {
      setSavingAs(null);
    }
  };

  const addSingleTicketBenefit = (benefit) => {
    if (benefit.trim() && singleTicketBenefits.length < 10) {
      setSingleTicketBenefits([...singleTicketBenefits, benefit.trim()]);
    }
  };

  const removeSingleTicketBenefit = (index) => {
    setSingleTicketBenefits(singleTicketBenefits.filter((_, i) => i !== index));
  };

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
            accessType: eventType === "hybrid" ? "both" : "physical",
            requiresApproval: false,
            maxAttendees: null,
            approvalDeadline: null,
            approvalQuestions: [],
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
      if (!updated[ticketIndex].benefits) {
        updated[ticketIndex].benefits = [];
      }
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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const addRequirement = () => {
    if (requirementInput.trim() && requirements.length < 10) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput("");
    }
  };

  const removeRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + uploadedImages.length + files.length;

    if (totalImages > 3) {
      alert("Maximum 3 images allowed");
      return;
    }

    setImageUploading(true);

    try {
      const newImageFiles = [...imageFiles];
      const newUploadedImages = [...uploadedImages];

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB.`);
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
      console.error("Failed to upload images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const removeNewImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const validateStep = async (step) => {
    let isValid = true;
    const values = getValues();

    switch (step) {
      case 1:
        isValid = await trigger(["title", "description", "category"]);
        break;
      case 2:
        isValid = await trigger(["startDate", "time", "endTime"]);
        if (isMultiDay && values.endDate) {
          const start = new Date(values.startDate);
          const end = new Date(values.endDate);
          if (end < start) {
            setError("endDate", { 
              type: "manual", 
              message: "End date cannot be before start date" 
            });
            isValid = false;
          }
        }
        break;
      case 3:
        if (eventType !== "virtual") {
          isValid = await trigger(["venue", "address"]);
          isValid = isValid && selectedState && selectedCity;
          if (!selectedState || !selectedCity) {
            alert("Please select both state and city");
            isValid = false;
          }
        } else if (eventType === "virtual") {
          isValid = !!virtualEventLink && virtualEventLink.trim().length > 0;
          if (!isValid) {
            alert("Virtual event link is required");
          }
        }
        break;
      case 4:
        if (!useLegacyPricing) {
          const validTickets = ticketTypes.filter(
            (t) => t.price && t.capacity && parseFloat(t.price) >= 0
          );
          isValid = validTickets.length > 0;
          if (!isValid) {
            alert("Please add at least one valid ticket type with price and capacity");
          }
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

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCompletedSteps({ ...completedSteps, [currentStep]: true });
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasApprovalTickets = ticketTypes?.some(
    (ticket) =>
      (ticket.price === "0" || ticket.price === 0 || !ticket.price) &&
      ticket.requiresApproval
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-[#FF6B35] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading event data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <div className="animate-pulse">
              <div className="inline-flex items-center text-sm text-gray-500">
                <span>Redirecting to your events...</span>
                <span className="ml-2 animate-bounce">...</span>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="w-11/12 mx-auto container py-8">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => navigate('/dashboard/organizer/events')}
              className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Events
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit <span className="text-[#FF6B35]">Event</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Editing Event: <span className="font-semibold">{watch("title") || "Loading..."}</span>
            </p>
            <p className="text-gray-600">
              Step {currentStep} of {totalSteps}: {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Approval Notice */}
          {hasApprovalTickets && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-900 mb-1">
                    Approval-Based Registration Enabled
                  </p>
                  <p className="text-sm text-orange-700">
                    This event uses approval-based registration. Attendees will
                    apply to attend and you'll review their applications before
                    approving and issuing tickets.
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Form Content */}
          <form className="space-y-8">
            {/* Step 1: Basic Info */}
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
                      {...register("longDescription")}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      placeholder="Provide a more detailed description of your event"
                    />
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
                            required: "End date is required for multi-day events",
                          })}
                          min={watch("startDate") || new Date().toISOString().split("T")[0]}
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
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-6 w-6 text-[#FF6B35]" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Location Details
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {["physical", "virtual", "hybrid"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setEventType(type)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            eventType === type
                              ? "bg-[#FF6B35] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {eventType !== "virtual" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Venue Name *
                        </label>
                        <input
                          type="text"
                          {...register("venue", {
                            required: eventType !== "virtual" ? "Venue is required" : false,
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                          placeholder="Enter venue name"
                        />
                        {errors.venue && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.venue.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          {...register("address", {
                            required: eventType !== "virtual" ? "Address is required" : false,
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                          placeholder="Street address"
                        />
                        {errors.address && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.address.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                          >
                            <option value="">Select state</option>
                            {NIGERIAN_STATES.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Enter city"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {(eventType === "virtual" || eventType === "hybrid") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Virtual Event Link *
                      </label>
                      <input
                        type="url"
                        value={virtualEventLink}
                        onChange={(e) => setVirtualEventLink(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Tickets */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Ticket className="h-6 w-6 text-[#FF6B35]" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Ticket Pricing
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Use simple pricing (single ticket type)
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseLegacyPricing(!useLegacyPricing)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useLegacyPricing ? "bg-[#FF6B35]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useLegacyPricing ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {useLegacyPricing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₦) *
                          </label>
                          <input
                            type="number"
                            {...register("price", {
                              required: "Price is required",
                              min: { value: 0, message: "Price must be positive" },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="0"
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
                            {...register("capacity", {
                              required: "Capacity is required",
                              min: { value: 1, message: "Minimum 1 attendee" },
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="100"
                          />
                          {errors.capacity && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.capacity.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ticket Benefits (Optional)
                        </label>
                        <div className="space-y-2">
                          {singleTicketBenefits.map((benefit, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                            >
                              <span className="text-sm text-gray-700">
                                {benefit}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeSingleTicketBenefit(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add a benefit"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSingleTicketBenefit(e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.target.previousElementSibling;
                              addSingleTicketBenefit(input.value);
                              input.value = '';
                            }}
                            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ticketTypes.map((ticket, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900">
                              {ticket.name} Ticket
                            </h4>
                            {ticketTypes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTicketType(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price (₦) *
                              </label>
                              <input
                                type="number"
                                value={ticket.price}
                                onChange={(e) =>
                                  updateTicketType(index, "price", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="0"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity *
                              </label>
                              <input
                                type="number"
                                value={ticket.capacity}
                                onChange={(e) =>
                                  updateTicketType(index, "capacity", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                placeholder="100"
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <input
                              type="text"
                              value={ticket.description}
                              onChange={(e) =>
                                updateTicketType(index, "description", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                              placeholder="Brief description of this ticket type"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Benefits (Optional)
                            </label>
                            <div className="space-y-2 mb-2">
                              {ticket.benefits && ticket.benefits.map((benefit, bIndex) => (
                                <div
                                  key={bIndex}
                                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                                >
                                  <span className="text-sm text-gray-700">
                                    {benefit}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeTicketBenefit(index, bIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a benefit"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTicketBenefit(index, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  addTicketBenefit(index, input.value);
                                  input.value = '';
                                }}
                                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {ticketTypes.length < 3 && (
                        <button
                          type="button"
                          onClick={addTicketType}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Ticket Type
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Additional Info */}
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
                          disabled={imageUploading}
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
                    )}

                    <p className="text-xs text-gray-500">
                      Total images: {existingImages.length + uploadedImages.length}/3
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Banner (Optional)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a custom banner for social media sharing
                  </p>
                  
                  {existingSocialBanner && !socialBannerFile && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Social Banner
                      </label>
                      <img 
                        src={existingSocialBanner} 
                        alt="Current social banner" 
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSocialBannerFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B35] file:text-white hover:file:bg-[#FF8535]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 1200x630 pixels for optimal social media display
                  </p>
                  
                  {socialBannerFile && (
                    <p className="text-sm text-green-600 mt-2">
                      New banner selected: {socialBannerFile.name}
                    </p>
                  )}
                </div>
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
                    <>
                      <button
                        type="button"
                        onClick={() => handleSave("draft")}
                        disabled={savingAs}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {savingAs === "draft" ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Save Draft
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave("published")}
                        disabled={savingAs}
                        className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {savingAs === "published" ? (
                          <>
                            <Loader className="h-4 w-4 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Update Event
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-semibold mb-2">💡 Quick Tips:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    {currentStep === 1 && (
                      <>
                        <li>Keep your title clear and descriptive</li>
                        <li>Write a compelling description to attract attendees</li>
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
                        <li>Consider offering multiple ticket tiers</li>
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
      </div>

      <Footer />
    </div>
  );
};

export default EditEvent;