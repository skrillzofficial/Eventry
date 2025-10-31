import React, { useState } from "react";
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
  Edit,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PaymentAgreement from "../pages/dashboard/PaymentAgreement";
import ServiceFeeCheckout from "../checkout/ServiceFeeCheckout";
import { eventAPI, apiCall } from "../services/api";

const EventPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventData, formData, imageFiles, uploadedImages } = location.state || {};

  const [savingAs, setSavingAs] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [showPaymentAgreement, setShowPaymentAgreement] = useState(false);
  const [publishData, setPublishData] = useState(null);
  const [showServiceFeeCheckout, setShowServiceFeeCheckout] = useState(false);
  const [serviceFeeData, setServiceFeeData] = useState(null);

  // Redirect back if no data
  if (!eventData || !formData) {
    navigate("/events/create");
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
        return { icon: MapPin, text: "In-Person Event", color: "text-blue-600" };
      case "virtual":
        return { icon: Monitor, text: "Virtual Event", color: "text-purple-600" };
      case "hybrid":
        return { icon: Globe, text: "Hybrid Event", color: "text-green-600" };
      default:
        return { icon: MapPin, text: "In-Person Event", color: "text-blue-600" };
    }
  };

  const eventTypeDisplay = getEventTypeDisplay();
  const EventTypeIcon = eventTypeDisplay.icon;

  // Validation for publishing
  const validateForPublish = () => {
    const errors = [];

    if (!description) errors.push("Description is required");
    if (!category) errors.push("Category is required");
    if (!startDate) errors.push("Start date is required");
    if (!time) errors.push("Start time is required");
    if (!endTime) errors.push("End time is required");

    // Location validation for physical/hybrid events
    if (eventType !== "virtual") {
      if (!venue) errors.push("Venue is required");
      if (!address) errors.push("Address is required");
      if (!state) errors.push("State is required");
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

  // Handle publish click
  const handlePublishClick = () => {
    if (!canPublish) {
      setError(`Cannot publish event: ${validationErrors.join(", ")}`);
      return;
    }
    setPublishData(eventData);
    setShowPaymentAgreement(true);
  };

  // Handle agreement confirmation
  const handleAgreementConfirm = async (
    agreementData,
    actionType = "publish_direct"
  ) => {
    try {
      if (actionType === "service_fee_payment") {
        setShowPaymentAgreement(false);
        setServiceFeeData({
          eventData: publishData,
          agreementData,
          serviceFee: agreementData.serviceFee.min,
          attendanceRange: agreementData.attendanceRange,
        });
        setShowServiceFeeCheckout(true);
        return;
      }

      setSavingAs("published");

      const formDataToSend = new FormData();

      formDataToSend.append("title", title);
      formDataToSend.append("status", "published");
      formDataToSend.append("description", description);
      formDataToSend.append("eventType", eventType);

      if (longDescription) formDataToSend.append("longDescription", longDescription);
      if (category) formDataToSend.append("category", category);
      if (startDate) formDataToSend.append("startDate", startDate);
      if (isMultiDay && endDate) {
        formDataToSend.append("endDate", endDate);
      } else {
        formDataToSend.append("endDate", startDate);
      }
      if (time) formDataToSend.append("time", time);
      if (endTime) formDataToSend.append("endTime", endTime);

      // Location data for physical/hybrid events
      if (eventType !== "virtual") {
        if (venue) formDataToSend.append("venue", venue);
        if (address) formDataToSend.append("address", address);
        if (state) formDataToSend.append("state", state);
        if (city) formDataToSend.append("city", city);
      }

      // Virtual event data
      if (eventType === "virtual" || eventType === "hybrid") {
        if (virtualEventLink) {
          formDataToSend.append("virtualEventLink", virtualEventLink);
        }
      }

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
            accessType: t.accessType || "both",
          }));

        if (validTicketTypes.length > 0) {
          formDataToSend.append("ticketTypes", JSON.stringify(validTicketTypes));
        }
      } else {
        if (price) formDataToSend.append("price", price);
        if (capacity) formDataToSend.append("capacity", capacity);
        if (ticketDescription) formDataToSend.append("ticketDescription", ticketDescription);
        if (singleTicketBenefits && singleTicketBenefits.length > 0) {
          formDataToSend.append("ticketBenefits", JSON.stringify(singleTicketBenefits));
        }
      }

      if (tags && tags.length > 0) formDataToSend.append("tags", JSON.stringify(tags));
      if (requirements && requirements.length > 0) {
        formDataToSend.append("requirements", JSON.stringify(requirements));
      }

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Append social banner data
      if (socialBannerEnabled && socialBannerFile) {
        formDataToSend.append("socialBanner", socialBannerFile);
        formDataToSend.append("socialBannerEnabled", "true");
      }

      // Append community data
      if (communityEnabled && communityData) {
        formDataToSend.append("community", JSON.stringify(communityData));
        formDataToSend.append("communityEnabled", "true");
      }

      formDataToSend.append("agreement", JSON.stringify(agreementData));

      const result = await apiCall(eventAPI.createEvent, formDataToSend);

      if (result.success) {
        setSuccessMessage("Event published successfully!");
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2500);
      } else {
        throw new Error(result.error || "Failed to publish event");
      }
    } catch (error) {
      console.error("Publish error:", error);
      setError(error.message || "Failed to publish event. Please try again.");
    } finally {
      setSavingAs(null);
    }
  };

  // Handle service fee success
  const handleServiceFeeSuccess = (paymentResult) => {
    console.log("Service fee payment successful:", paymentResult);
    setShowServiceFeeCheckout(false);
    handleAgreementConfirm(serviceFeeData.agreementData, "publish_direct");
  };

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    try {
      setSavingAs("draft");

      const formDataToSend = new FormData();
      formDataToSend.append("title", title);
      formDataToSend.append("status", "draft");
      formDataToSend.append("eventType", eventType);

      if (description) formDataToSend.append("description", description);
      if (longDescription) formDataToSend.append("longDescription", longDescription);
      if (category) formDataToSend.append("category", category);
      if (startDate) formDataToSend.append("startDate", startDate);
      if (isMultiDay && endDate) {
        formDataToSend.append("endDate", endDate);
      } else {
        formDataToSend.append("endDate", startDate);
      }
      if (time) formDataToSend.append("time", time);
      if (endTime) formDataToSend.append("endTime", endTime);

      // Location data for physical/hybrid events
      if (eventType !== "virtual") {
        if (venue) formDataToSend.append("venue", venue);
        if (address) formDataToSend.append("address", address);
        if (state) formDataToSend.append("state", state);
        if (city) formDataToSend.append("city", city);
      }

      // Virtual event data
      if (eventType === "virtual" || eventType === "hybrid") {
        if (virtualEventLink) {
          formDataToSend.append("virtualEventLink", virtualEventLink);
        }
      }

      if (!useLegacyPricing) {
        const validTicketTypes = ticketTypes
          .filter((t) => t.price && t.capacity)
          .map((t) => ({
            name: t.name,
            price: parseFloat(t.price),
            capacity: parseInt(t.capacity),
            description: t.description || "",
            benefits: t.benefits || [],
            accessType: t.accessType || "both",
          }));

        if (validTicketTypes.length > 0) {
          formDataToSend.append("ticketTypes", JSON.stringify(validTicketTypes));
        }
      } else {
        if (price) formDataToSend.append("price", price);
        if (capacity) formDataToSend.append("capacity", capacity);
        if (ticketDescription) formDataToSend.append("ticketDescription", ticketDescription);
        if (singleTicketBenefits && singleTicketBenefits.length > 0) {
          formDataToSend.append("ticketBenefits", JSON.stringify(singleTicketBenefits));
        }
      }

      if (tags && tags.length > 0) formDataToSend.append("tags", JSON.stringify(tags));
      if (requirements && requirements.length > 0)
        formDataToSend.append("requirements", JSON.stringify(requirements));

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Append social banner for drafts too
      if (socialBannerEnabled && socialBannerFile) {
        formDataToSend.append("socialBanner", socialBannerFile);
        formDataToSend.append("socialBannerEnabled", "true");
      }

      // Append community data for drafts
      if (communityEnabled && communityData) {
        formDataToSend.append("community", JSON.stringify(communityData));
        formDataToSend.append("communityEnabled", "true");
      }

      const result = await apiCall(eventAPI.createEvent, formDataToSend);

      if (result.success) {
        setSuccessMessage(
          "Event saved as draft! You can edit and publish it later from your dashboard."
        );
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/organizer");
        }, 2500);
      } else {
        setError(result.error || "Failed to save as draft");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
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
          eventData={publishData}
          ticketTypes={ticketTypes}
          onAgree={handleAgreementConfirm}
          onCancel={() => navigate("/dashboard/organizer")}
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
            onClick={() => navigate("/create-event", { state: { eventData, formData, imageFiles, uploadedImages } })}
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
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Validation Errors */}
        {!canPublish && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
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

        {/* Preview Content */}
        <div className="space-y-6">
          {/* Hero Section with Images */}
          {uploadedImages && uploadedImages.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
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
                  <EventTypeIcon className={`h-5 w-5 ${eventTypeDisplay.color}`} />
                  <span className={`text-sm font-medium ${eventTypeDisplay.color}`}>
                    {eventTypeDisplay.text}
                  </span>
                  {category && (
                    <span className="text-sm text-gray-500 ml-2">• {category}</span>
                  )}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
                <p className="text-gray-700 leading-relaxed">{description}</p>
              </div>
            </div>

            {longDescription && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">About This Event</h4>
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
                  <p className="text-gray-900 font-medium">{formatDate(startDate)}</p>
                </div>
                {isMultiDay && endDate && (
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="text-gray-900 font-medium">{formatDate(endDate)}</p>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[#FF6B35]" />
                      {formatTime(time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p className="text-gray-900 font-medium">{formatTime(endTime)}</p>
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
                  {venue && <p className="text-gray-900 font-medium">{venue}</p>}
                  {address && <p className="text-gray-700">{address}</p>}
                  {(city || state) && (
                    <p className="text-gray-600">
                      {city}
                      {city && state && ", "}
                      {state}
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
                    className="border border-gray-200 rounded-lg p-4 hover:border-[#FF6B35] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                      <span className="text-[#FF6B35] font-bold">
                        ₦{parseFloat(ticket.price).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <Users className="h-4 w-4 inline mr-1" />
                        {ticket.capacity} available
                      </p>
                      {ticket.description && (
                        <p className="text-sm text-gray-700">{ticket.description}</p>
                      )}
                      {eventType === "hybrid" && ticket.accessType && (
                        <p className="text-sm text-gray-600">
                          Access: {ticket.accessType === "both" ? "In-person & Virtual" : ticket.accessType === "physical" ? "In-person only" : "Virtual only"}
                        </p>
                      )}
                      {ticket.benefits && ticket.benefits.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-700 mb-1">Benefits:</p>
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
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">General Admission</h4>
                  <span className="text-[#FF6B35] font-bold text-xl">
                    ₦{price ? parseFloat(price).toLocaleString() : "0"}
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
                      <p className="text-xs font-medium text-gray-700 mb-1">Benefits:</p>
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
                  <li key={index} className="flex items-start gap-2 text-gray-700">
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
                    <a href={communityData.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                      Join Group
                    </a>
                  </div>
                )}
                {communityData.telegram && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Telegram:</span>
                    <a href={communityData.telegram} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
                      Join Group
                    </a>
                  </div>
                )}
                {communityData.discord && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">Discord:</span>
                    <a href={communityData.discord} target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
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
                    ? "Everything looks good! You can publish your event now or save it as a draft."
                    : "Some required fields are missing. You can save as draft and complete them later, or go back to edit."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate("/create-event", { state: { eventData, formData, imageFiles, uploadedImages } })}
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
                  onClick={handlePublishClick}
                  disabled={savingAs || !canPublish}
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {savingAs === "published" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publish Event
                    </>
                  )}
                </button>
              </div>

              {!canPublish && (
                <div className="bg-yellow-50 rounded-lg p-4 text-sm text-yellow-800">
                  <p className="font-semibold mb-1"> Note:</p>
                  <p>The publish button is disabled because some required fields are missing. Please go back and complete all required fields, or save as draft to finish later.</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <p className="font-semibold mb-2"> Quick Tip:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Draft:</strong> Save incomplete events and finish them later. Drafts are only visible to you.
                  </li>
                  <li>
                    <strong>Publish:</strong> Make your event live and visible to everyone immediately.
                  </li>
                  <li>
                    You can edit or unpublish events anytime from your dashboard.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Fee Checkout Modal */}
      {showServiceFeeCheckout && serviceFeeData && (
        <ServiceFeeCheckout
          eventData={serviceFeeData.eventData}
          serviceFee={serviceFeeData.serviceFee}
          attendanceRange={serviceFeeData.attendanceRange}
          agreementData={serviceFeeData.agreementData}
          onSuccess={handleServiceFeeSuccess}
          onClose={() => setShowServiceFeeCheckout(false)}
        />
      )}

      <div className="bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default EventPreview;