import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Tag,
  Shield,
  FileText,
  Eye,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Monitor,
  Globe,
  Loader
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PaymentAgreement from "../pages/dashboard/PaymentAgreement";
import { toast } from "react-hot-toast";
import { eventAPI, apiCall } from "../services/api";

const EventPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for data with proper initialization
  const [eventData, setEventData] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [savingAs, setSavingAs] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [showPaymentAgreement, setShowPaymentAgreement] = useState(false);
  const [publishData, setPublishData] = useState(null);

  // Load data from location state
  useEffect(() => {
    if (location.state) {
      const { eventData: stateEventData, imageFiles: stateImageFiles, uploadedImages: stateUploadedImages } = location.state;

      console.log("📥 Received data in EventPreview:", {
        hasEventData: !!stateEventData,
        eventData: stateEventData,
        imageFilesCount: stateImageFiles?.length,
        uploadedImagesCount: stateUploadedImages?.length
      });

      if (stateEventData) {
        setEventData(stateEventData);
        setImageFiles(stateImageFiles || []);
        setUploadedImages(stateUploadedImages || []);
        setIsLoading(false);
      } else {
        console.error("❌ Missing event data in location state");
        navigate("/events/create");
      }
    } else {
      console.error("❌ No location state found");
      navigate("/events/create");
    }
  }, [location.state, navigate]);

  // Check if event has free tickets
  const hasFreeTickets = () => {
    if (!eventData) return false;
    
    if (!eventData.useLegacyPricing && eventData.ticketTypes) {
      return eventData.ticketTypes.some((ticket) => parseFloat(ticket.price) === 0);
    }
    return parseFloat(eventData.price) === 0;
  };

  // Show loading while checking data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B35] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event preview...</p>
        </div>
      </div>
    );
  }

  // Don't render if no data (will redirect)
  if (!eventData) {
    return null;
  }

  const {
    title,
    description,
    longDescription,
    category,
    startDate,
    endDate,
    time,
    endTime,
    venue,
    address,
    state,
    city,
    tags,
    requirements,
    ticketTypes,
    useLegacyPricing,
    singleTicketBenefits,
    price,
    capacity,
    ticketDescription,
    eventType,
    virtualEventLink,
    isMultiDay,
    socialBannerEnabled,
    socialBannerFile,
    communityEnabled,
    communityData,
  } = eventData;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get event type display
  const getEventTypeDisplay = () => {
    switch (eventType) {
      case "physical":
        return {
          icon: MapPin,
          text: "In-Person Event",
          color: "text-blue-600",
        };
      case "virtual":
        return {
          icon: Monitor,
          text: "Virtual Event",
          color: "text-purple-600",
        };
      case "hybrid":
        return { icon: Globe, text: "Hybrid Event", color: "text-green-600" };
      default:
        return {
          icon: MapPin,
          text: "In-Person Event",
          color: "text-blue-600",
        };
    }
  };

  const eventTypeDisplay = getEventTypeDisplay();
  const EventTypeIcon = eventTypeDisplay.icon;

  // Validation function
  const validateForPublish = () => {
    const errors = [];

    // Basic info validation
    if (!title) errors.push("Event title is required");
    if (!description) errors.push("Description is required");
    if (!category) errors.push("Category is required");

    // Date and time validation
    if (!startDate) {
      errors.push("Event date is required");
    } else {
      const date = new Date(startDate);
      if (isNaN(date.getTime())) {
        errors.push("Invalid start date format");
      }
    }

    if (!time) errors.push("Start time is required");
    if (!endTime) errors.push("End time is required");

    // Location validation for physical/hybrid events
    if (eventType !== "virtual") {
      if (!venue) errors.push("Venue is required");
      if (!address) errors.push("Address is required");
      if (!state) {
        errors.push("State is required");
      } else {
        const validStates = [
          "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
          "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
          "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa",
          "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
          "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
          "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
        ];
        if (!validStates.includes(state)) {
          errors.push(`State must be one of: ${validStates.join(", ")}`);
        }
      }
      if (!city) errors.push("City is required");
    }

    // Virtual event link validation
    if (eventType === "virtual" && !virtualEventLink) {
      errors.push("Virtual event link is required");
    }

    // Multi-day event validation
    if (isMultiDay && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        errors.push("End date cannot be before start date");
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
      if (!price || !capacity) {
        errors.push("Price and capacity are required");
      }
    }

    return errors;
  };

  const validationErrors = validateForPublish();
  const canPublish = validationErrors.length === 0;
  const isFreeEvent = hasFreeTickets();

  // Prepare preview data - FIXED VERSION
  const preparePreviewData = () => {
    let finalTicketTypes = ticketTypes;
    if (useLegacyPricing) {
      finalTicketTypes = [
        {
          name: "Regular",
          price: price || 0,
          capacity: parseInt(capacity) || 1, // ✅ FIX: Ensure capacity is integer
          description: ticketDescription || "",
          benefits: singleTicketBenefits || [],
          accessType: eventType === "hybrid" ? "both" : undefined,
          requiresApproval: ticketTypes[0]?.requiresApproval || false,
          approvalQuestions: ticketTypes[0]?.approvalQuestions || [],
          maxAttendees: ticketTypes[0]?.maxAttendees || "",
          approvalDeadline: ticketTypes[0]?.approvalDeadline || "",
        },
      ];
    } else {
      // ✅ FIX: Ensure all ticket capacities are integers
      finalTicketTypes = ticketTypes.map(ticket => ({
        ...ticket,
        capacity: parseInt(ticket.capacity) || 1,
        price: parseFloat(ticket.price) || 0
      }));
    }

    const preparedData = {
      title: title || "",
      category: category || "",
      description: description || "",
      longDescription: longDescription || "",
      startDate: startDate || "",
      endDate: endDate || "",
      time: time || "",
      endTime: endTime || "",
      isMultiDay: isMultiDay,
      eventType: eventType,
      virtualEventLink: virtualEventLink || "",
      venue: venue || "",
      address: address || "",
      state: state || "",
      city: city || "",
      ticketTypes: finalTicketTypes,
      useLegacyPricing: useLegacyPricing,
      singleTicketBenefits: singleTicketBenefits,
      price: parseFloat(price) || 0, // ✅ FIX: Ensure price is number
      capacity: parseInt(capacity) || 1, // ✅ FIX: Ensure capacity is integer
      tags: tags,
      requirements: requirements,
      socialBannerEnabled: socialBannerEnabled,
      socialBannerFile: socialBannerFile,
      communityEnabled: communityEnabled,
      communityData: communityData,
    };

    return preparedData;
  };

  // Handle publish click - MAIN ENTRY POINT
  const handlePublishClick = async () => {
    try {
      if (!canPublish) {
        toast.error("Please complete all required fields before publishing");
        return;
      }

      console.log('🎯 Publishing event');

      const preparedData = preparePreviewData();
      
      // Store data for the agreement flow
      setPublishData({
        eventData: preparedData,
        imageFiles: imageFiles,
        uploadedImages: uploadedImages
      });
      
      // Show agreement modal for ALL events
      setShowPaymentAgreement(true);
      
    } catch (error) {
      console.error("Publish click error:", error);
      setError("Failed to process publication. Please try again.");
    }
  };

  // Handle agreement confirmation - FIXED VERSION
  const handleAgreementConfirm = async (agreementData) => {
    try {
      console.log('✅ Agreement accepted - publishing event directly');
      
      setShowPaymentAgreement(false);
      
      // ✅ PUBLISH EVENT DIRECTLY using the API service
      await handleDirectPublish();
      
    } catch (error) {
      console.error("Agreement confirmation error:", error);
      setError("Failed to process agreement. Please try again.");
    }
  };

  // Direct publishing for all events - FIXED VERSION
  const handleDirectPublish = async () => {
    try {
      setSavingAs("published");
      setError(null);

      const preparedData = preparePreviewData();

      // ✅ ADD TERMS ACCEPTANCE DATA - FIX FOR BACKEND VALIDATION
      preparedData.termsAccepted = true;
      preparedData.agreement = {
        acceptedTerms: true,
        acceptedAt: new Date().toISOString(),
        serviceFee: { type: "percentage", amount: 5 },
        paymentTerms: "upfront",
        agreementVersion: "1.0"
      };

      // Set status to published
      preparedData.status = "published";

      console.log('🚀 Publishing event with data:', preparedData);

      // ✅ FIX: Handle image data properly
      let finalImageFiles = imageFiles || [];
      let finalUploadedImages = uploadedImages || [];

      // Ensure we have valid image data
      if (finalUploadedImages.length === 0 && finalImageFiles.length === 0) {
        throw new Error("At least one event image is required");
      }

      // Use the API service instead of direct fetch
      const result = await apiCall(eventAPI.createEvent, preparedData, finalImageFiles, socialBannerFile);

      if (result.success) {
        console.log('✅ Event published successfully:', result);
        setSuccessMessage("Event published successfully!");
        setShowSuccess(true);

        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2500);
      } else {
        throw new Error(result.error || result.message || "Failed to publish event");
      }
    } catch (error) {
      console.error("Direct publish error:", error);
      setError(error.message || "Failed to publish event. Please try again.");
      toast.error(error.message || "Failed to publish event");
    } finally {
      setSavingAs(null);
    }
  };

  // Handle save as draft - FIXED VERSION
  const handleSaveAsDraft = async () => {
    try {
      setSavingAs("draft");
      setError(null);

      const preparedData = preparePreviewData();
      
      // ✅ ADD TERMS ACCEPTANCE DATA FOR DRAFTS TOO
      preparedData.termsAccepted = true;
      preparedData.agreement = {
        acceptedTerms: true,
        acceptedAt: new Date().toISOString(),
        serviceFee: { type: "percentage", amount: 5 },
        paymentTerms: "upfront",
        agreementVersion: "1.0"
      };

      // Set status to draft
      preparedData.status = "draft";

      console.log('💾 Saving event as draft with data:', preparedData);

      // ✅ FIX: Handle image data properly
      let finalImageFiles = imageFiles || [];
      let finalUploadedImages = uploadedImages || [];

      // Use the API service instead of direct fetch
      const result = await apiCall(eventAPI.createEvent, preparedData, finalImageFiles, socialBannerFile);

      if (result.success) {
        console.log('✅ Event saved as draft:', result);
        setSuccessMessage(
          "Event saved as draft! You can edit and publish it later from your dashboard."
        );
        setShowSuccess(true);

        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2500);
      } else {
        throw new Error(result.error || result.message || "Failed to save as draft");
      }
    } catch (error) {
      console.error("Save draft error:", error);
      setError(error.message || "Failed to save as draft. Please try again.");
      toast.error(error.message || "Failed to save as draft");
    } finally {
      setSavingAs(null);
    }
  };

  // Show payment agreement
  if (showPaymentAgreement) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <PaymentAgreement
          eventData={publishData?.eventData}
          ticketTypes={ticketTypes}
          onAgree={handleAgreementConfirm}
          onCancel={() => setShowPaymentAgreement(false)}
          onBack={() => setShowPaymentAgreement(false)}
        />
        <div className="bg-black">
          <Footer />
        </div>
      </div>
    );
  }

  // Show success
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
          <button
            onClick={() =>
              navigate("/events/create", {
                state: { eventData, imageFiles, uploadedImages },
              })
            }
            className="inline-flex items-center text-[#FF6B35] hover:text-[#E55A2B] mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Edit
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Preview Your <span className="text-[#FF6B35]">Event</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Review your event details before publishing or saving as draft.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Validation Errors */}
        {!canPublish && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Missing Required Fields for Publishing:
                </h4>
                <ul className="list-disc list-inside text-yellow-700 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
                <p className="text-yellow-700 mt-2 text-sm">
                  You can still save as draft and complete these fields later.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Publish Notice */}
        {canPublish && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">
                  Ready to Publish
                </h4>
                <p className="text-green-700 text-sm">
                  {isFreeEvent 
                    ? "Your free event is ready! Review the terms and publish immediately."
                    : "Your paid event is ready! Review the terms and publish immediately."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="space-y-6">
          {/* Hero Section with Images */}
          {uploadedImages && uploadedImages.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Event image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-[#FF6B35] text-white text-xs px-2 py-1 rounded">
                        Main Image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Event Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <EventTypeIcon
                    className={`h-5 w-5 ${eventTypeDisplay.color}`}
                  />
                  <span
                    className={`text-sm font-medium ${eventTypeDisplay.color}`}
                  >
                    {eventTypeDisplay.text}
                  </span>
                  {category && (
                    <span className="text-sm text-gray-500 ml-2">
                      • {category}
                    </span>
                  )}
                  {isFreeEvent && (
                    <span className="text-sm text-green-600 ml-2">
                      • Free Event
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {title}
                </h2>
                <p className="text-gray-700 leading-relaxed">{description}</p>
              </div>
            </div>

            {longDescription && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  About This Event
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {longDescription}
                </p>
              </div>
            )}
          </div>

          {/* Date, Time & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#FF6B35]" />
                Date & Time
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {isMultiDay ? "Start Date" : "Date"}
                  </p>
                  <p className="text-gray-900 font-medium">
                    {startDate ? formatDate(startDate) : "Not set"}
                  </p>
                </div>
                {isMultiDay && endDate && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(endDate)}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[#FF6B35]" />
                      {time ? formatTime(time) : "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p className="text-gray-900 font-medium">
                      {endTime ? formatTime(endTime) : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FF6B35]" />
                Location
              </h3>
              {eventType !== "virtual" ? (
                <div className="space-y-2">
                  {venue && (
                    <p className="text-gray-900 font-medium">{venue}</p>
                  )}
                  {address && <p className="text-gray-700">{address}</p>}
                  {(city || state) && (
                    <p className="text-gray-600">
                      {city}
                      {city && state && ", "}
                      {state}
                    </p>
                  )}
                  {(!city || !state) && (
                    <p className="text-red-500 text-sm">
                      Location details incomplete
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-900 font-medium">Virtual Event</p>
                  {virtualEventLink && (
                    <a
                      href={virtualEventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:underline break-all"
                    >
                      {virtualEventLink}
                    </a>
                  )}
                </div>
              )}
              {eventType === "hybrid" && virtualEventLink && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Virtual Option</p>
                  <a
                    href={virtualEventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF6B35] hover:underline break-all"
                  >
                    {virtualEventLink}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-[#FF6B35]" />
              Tickets
            </h3>
            {!useLegacyPricing && ticketTypes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ticketTypes.map((ticket, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 hover:border-[#FF6B35] transition-colors ${
                      parseFloat(ticket.price) === 0 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {ticket.name}
                      </h4>
                      <span className={`font-bold ${
                        parseFloat(ticket.price) === 0 
                          ? 'text-green-600' 
                          : 'text-[#FF6B35]'
                      }`}>
                        {parseFloat(ticket.price) === 0 ? 'FREE' : `₦${parseFloat(ticket.price || 0).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <Users className="h-4 w-4 inline mr-1" />
                        {ticket.capacity || "0"} available
                      </p>
                      {ticket.description && (
                        <p className="text-sm text-gray-700">
                          {ticket.description}
                        </p>
                      )}
                      {eventType === "hybrid" && ticket.accessType && (
                        <p className="text-sm text-gray-600">
                          Access:{" "}
                          {ticket.accessType === "both"
                            ? "In-person & Virtual"
                            : ticket.accessType === "physical"
                            ? "In-person only"
                            : "Virtual only"}
                        </p>
                      )}
                      {ticket.benefits && ticket.benefits.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Benefits:
                          </p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {ticket.benefits.map((benefit, idx) => (
                              <li key={idx}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`border rounded-lg p-4 ${
                parseFloat(price) === 0 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    General Admission
                  </h4>
                  <span className={`font-bold text-xl ${
                    parseFloat(price) === 0 
                      ? 'text-green-600' 
                      : 'text-[#FF6B35]'
                  }`}>
                    {parseFloat(price) === 0 ? 'FREE' : `₦${parseFloat(price).toLocaleString()}`}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <Users className="h-4 w-4 inline mr-1" />
                    {capacity || "0"} tickets available
                  </p>
                  {ticketDescription && (
                    <p className="text-sm text-gray-700">{ticketDescription}</p>
                  )}
                  {singleTicketBenefits && singleTicketBenefits.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Benefits:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {singleTicketBenefits.map((benefit, idx) => (
                          <li key={idx}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#FF6B35]" />
                Event Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements && requirements.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#FF6B35]" />
                Requirements
              </h3>
              <ul className="space-y-2">
                {requirements.map((requirement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Community Info */}
          {communityEnabled && communityData && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#FF6B35]" />
                Community Groups
              </h3>
              <div className="space-y-2">
                {communityData.whatsapp && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">WhatsApp:</span>
                    <a
                      href={communityData.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:underline"
                    >
                      Join Group
                    </a>
                  </div>
                )}
                {communityData.telegram && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Telegram:</span>
                    <a
                      href={communityData.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:underline"
                    >
                      Join Group
                    </a>
                  </div>
                )}
                {communityData.discord && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Discord:</span>
                    <a
                      href={communityData.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B35] hover:underline"
                    >
                      Join Server
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Banner Info */}
          {socialBannerEnabled && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#FF6B35]" />
                Social Media Banner
              </h3>
              <p className="text-gray-700">
                Custom social media banner has been added to this event
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col space-y-4">
              <div className="text-center lg:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to Proceed?
                </h3>
                <p className="text-gray-600 text-sm">
                  {canPublish
                    ? "Everything looks good! Review the terms and publish your event."
                    : "Some required fields are missing. You can save as draft and complete them later, or go back to edit."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() =>
                    navigate("/events/create", {
                      state: {
                        eventData,
                        imageFiles,
                        uploadedImages,
                      },
                    })
                  }
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  <ArrowLeft className="h-4 w-4 inline mr-2" />
                  Back to Edit
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={savingAs}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {savingAs === "draft" ? (
                    <>
                      <Loader className="w-4 w-4 animate-spin mr-2" />
                      Saving Draft...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePublishClick}
                  disabled={savingAs || !canPublish}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {savingAs === "published" ? (
                    <>
                      <Loader className="w-4 w-4 animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 w-4 mr-2" />
                      Review Terms & Publish
                    </>
                  )}
                </button>
              </div>

              {!canPublish && (
                <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
                  <p className="font-semibold mb-1">📋 Note:</p>
                  <p>
                    The publish button is disabled because some required fields
                    are missing. Please go back and complete all required
                    fields, or save as draft to finish later.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold mb-2">💡 Quick Tip:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Draft:</strong> Save incomplete events and finish
                    them later. Drafts are only visible to you.
                  </li>
                  <li>
                    <strong>Publish:</strong> Make your event live after reviewing and accepting the terms.
                  </li>
                  <li>
                    You can edit or unpublish events anytime from your
                    dashboard.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default EventPreview;