import React, { useState } from "react";
import {
  X,
  CreditCard,
  Lock,
  Calendar,
  Users,
  CheckCircle,
  Shield,
} from "lucide-react";
import { transactionAPI, apiCall } from "../services/api";

const ServiceFeeCheckout = ({
  eventData,
  serviceFee,
  attendanceRange,
  agreementData,
  onSuccess,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Check if this is an approval-based event
  const hasApprovalTickets = eventData?.ticketTypes?.some(
    (ticket) =>
      (ticket.price === 0 || ticket.price === "0") && ticket.requiresApproval
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ CRITICAL FIX: Transform approval questions to proper schema format
  const transformApprovalQuestions = (ticketTypes) => {
    if (!Array.isArray(ticketTypes)) return [];
    
    return ticketTypes.map(ticket => {
      const transformed = { ...ticket };
      
      // Handle approval questions transformation
      if (ticket.requiresApproval && ticket.approvalQuestions) {
        // Case 1: String - convert to array of objects
        if (typeof ticket.approvalQuestions === 'string') {
          transformed.approvalQuestions = [{
            question: ticket.approvalQuestions,
            type: 'text',
            required: true
          }];
        }
        // Case 2: Array - validate and transform each item
        else if (Array.isArray(ticket.approvalQuestions)) {
          transformed.approvalQuestions = ticket.approvalQuestions.map(q => {
            if (typeof q === 'string') {
              return { question: q, type: 'text', required: true };
            }
            return {
              question: q.question || q.text || '',
              type: q.type || 'text',
              required: q.required !== false,
              options: q.options || undefined
            };
          }).filter(q => q.question); // Remove empty questions
        }
        // Case 3: Single object - wrap in array
        else if (typeof ticket.approvalQuestions === 'object') {
          transformed.approvalQuestions = [{
            question: ticket.approvalQuestions.question || ticket.approvalQuestions.text || '',
            type: ticket.approvalQuestions.type || 'text',
            required: ticket.approvalQuestions.required !== false,
            options: ticket.approvalQuestions.options || undefined
          }];
        }
      } else {
        transformed.approvalQuestions = [];
      }
      
      console.log(`✅ Transformed ticket "${ticket.name}":`, {
        requiresApproval: transformed.requiresApproval,
        originalQuestions: ticket.approvalQuestions,
        transformedQuestions: transformed.approvalQuestions
      });
      
      return transformed;
    });
  };

  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🎯 Starting service fee payment process...");
      console.log("📋 Agreement data received:", {
        hasAgreementData: !!agreementData,
        acceptedTerms: agreementData?.acceptedTerms,
        serviceFee: agreementData?.serviceFee,
        estimatedAttendance: agreementData?.estimatedAttendance
      });

      // ✅ CRITICAL FIX: Ensure agreement data has acceptedTerms = true
      // Valid enum values: "1-100", "101-500", "501-1000", "1001-5000", "5001+"
      const validAttendanceRanges = ["1-100", "101-500", "501-1000", "1001-5000", "5001+"];
      const rawAttendanceRange = agreementData?.estimatedAttendance || attendanceRange;
      
      // Ensure attendanceRange is valid
      let validatedAttendanceRange = "1-100"; // Default
      if (rawAttendanceRange && validAttendanceRanges.includes(rawAttendanceRange)) {
        validatedAttendanceRange = rawAttendanceRange;
      } else {
        console.warn("⚠️ Invalid attendance range:", rawAttendanceRange, "- using default: 1-100");
      }
      
      const enhancedAgreementData = {
        ...(agreementData || {}),
        acceptedTerms: true, // ✅ Force this to true
        acceptedAt: agreementData?.acceptedAt || new Date().toISOString(),
        serviceFee: agreementData?.serviceFee || { type: "percentage", amount: 5 },
        estimatedAttendance: validatedAttendanceRange, // ✅ Guaranteed valid enum
        paymentTerms: "upfront",
        agreementVersion: agreementData?.agreementVersion || "1.0"
      };

      console.log("✅ Enhanced agreement data:", enhancedAgreementData);

      // ✅ CRITICAL: Transform ticket types to proper schema format BEFORE sending
      const transformedTicketTypes = transformApprovalQuestions(eventData.ticketTypes || []);

      console.log("🎫 Ticket types transformation:", {
        originalCount: eventData.ticketTypes?.length || 0,
        transformedCount: transformedTicketTypes.length,
        hasApprovalTickets: transformedTicketTypes.some(t => t.requiresApproval)
      });

      // ✅ STEP 1: Prepare comprehensive event data for storage
      const completeEventData = {
        // Basic Info
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        eventType: eventData.eventType,

        // Date & Time
        date: eventData.startDate || eventData.date,
        startDate: eventData.startDate || eventData.date,
        endDate: eventData.endDate,
        time: eventData.time,
        endTime: eventData.endTime,

        // Location
        venue: eventData.venue,
        address: eventData.address,
        city: eventData.city,
        state: eventData.state,
        country: eventData.country,
        coordinates: eventData.coordinates,
        virtualEventLink: eventData.virtualEventLink,

        // Tickets & Capacity - ✅ USE TRANSFORMED DATA
        capacity: eventData.capacity,
        ticketTypes: transformedTicketTypes, // ✅ Use transformed ticket types
        hasApprovalTickets: hasApprovalTickets,
        requirements: eventData.requirements,

        // Media & Tags
        images: eventData.images,
        tags: eventData.tags,

        // Payment Info
        serviceFee: serviceFee,
        attendanceRange: attendanceRange,
        serviceFeePaymentStatus: "pending",
      };

      console.log("📦 Prepared event data:", {
        title: completeEventData.title,
        ticketTypesCount: completeEventData.ticketTypes?.length,
        ticketTypesWithApproval: completeEventData.ticketTypes?.filter(t => t.requiresApproval).length,
        firstTicketType: completeEventData.ticketTypes?.[0] ? {
          name: completeEventData.ticketTypes[0].name,
          requiresApproval: completeEventData.ticketTypes[0].requiresApproval,
          approvalQuestionsCount: completeEventData.ticketTypes[0].approvalQuestions?.length,
          approvalQuestions: completeEventData.ticketTypes[0].approvalQuestions
        } : null
      });

      // ✅ STEP 2: Store pending data BEFORE payment initialization
      const pendingData = {
        eventData: completeEventData,
        agreementData: enhancedAgreementData, // ✅ Use enhanced agreement data
        userInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        serviceFee: serviceFee,
        attendanceRange: attendanceRange,
        hasApprovalTickets: hasApprovalTickets,
        timestamp: Date.now(),
      };

      console.log("💾 Storing pending agreement in sessionStorage...");
      console.log("💾 Agreement acceptedTerms:", pendingData.agreementData.acceptedTerms);
      sessionStorage.setItem("pendingAgreement", JSON.stringify(pendingData));

      // ✅ STEP 3: Generate draft event ID (backend recognizes "draft-" prefix)
      const draftEventId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("🆔 Generated draft event ID:", draftEventId);

      // Update pending data with draft event ID
      pendingData.draftEventId = draftEventId;
      sessionStorage.setItem("pendingAgreement", JSON.stringify(pendingData));

      // ✅ STEP 4: Initialize payment with Paystack
      const paymentData = {
        eventId: draftEventId, // ← Backend recognizes "draft-" prefix
        amount: serviceFee, // Send in Naira (backend converts to kobo)
        email: formData.email,
        metadata: {
          paymentType: "service_fee",
          serviceFee: serviceFee,
          attendanceRange: attendanceRange,
          eventTitle: eventData.title,
          hasApprovalTickets: hasApprovalTickets,
          eventData: completeEventData, // ✅ Send transformed event data
          // ✅ CRITICAL: Send enhanced agreement data with acceptedTerms = true
          agreementData: enhancedAgreementData,
          userInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
        },
        callback_url: `${window.location.origin}/dashboard/organizer/events?payment=success`,
      };

      console.log("💳 Initializing service fee payment:", {
        eventId: paymentData.eventId,
        amount: paymentData.amount,
        email: paymentData.email,
        callback: paymentData.callback_url,
        agreementAcceptedTerms: paymentData.metadata.agreementData.acceptedTerms,
        ticketTypesCount: paymentData.metadata.eventData.ticketTypes?.length
      });

      const result = await apiCall(
        transactionAPI.initializeServiceFee,
        paymentData
      );

      console.log("✅ Payment initialization result:", result);

      if (!result.success) {
        throw new Error(result.error || "Payment initialization failed");
      }

      // ✅ STEP 5: Get redirect URL (check multiple possible locations)
      const redirectUrl =
        result.data?.authorizationUrl ||
        result.data?.authorization_url ||
        result.data?.paymentUrl ||
        result.data?.payment_url ||
        result.data?.data?.authorizationUrl ||
        result.data?.data?.authorization_url;

      if (!redirectUrl) {
        console.error("❌ No redirect URL in response:", result);
        throw new Error(
          "Payment initialization failed - No redirect URL received"
        );
      }

      console.log("✅ Found redirect URL:", redirectUrl);

      // ✅ STEP 6: Store payment reference for tracking
      const paymentReference = result.data?.reference;
      if (paymentReference) {
        localStorage.setItem(
          "pendingServiceFeePayment",
          JSON.stringify({
            reference: paymentReference,
            draftEventId: draftEventId,
            timestamp: Date.now(),
            email: formData.email,
            agreementAcceptedTerms: enhancedAgreementData.acceptedTerms, // ✅ Store for verification
          })
        );
        console.log("💾 Stored payment reference:", paymentReference);
        console.log("💾 Agreement acceptedTerms stored:", enhancedAgreementData.acceptedTerms);
      }

      console.log("🚀 Redirecting to Paystack:", redirectUrl);

      // ✅ STEP 7: Redirect to Paystack
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("💥 Service fee payment error:", err);

      let errorMessage = "Payment failed. Please try again.";

      if (err.response) {
        console.error("Response error:", err.response.data);
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      } else if (err.request) {
        console.error("Request error:", err.request);
        errorMessage = "Network error. Please check your connection.";
      } else {
        console.error("General error:", err.message);
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  // Debug function (development only)
  const checkAPIEndpoint = () => {
    console.log("=== API DEBUG INFO ===");
    console.log("transactionAPI object:", transactionAPI);
    console.log("Available methods:", Object.keys(transactionAPI));
    console.log("initializeServiceFee:", transactionAPI.initializeServiceFee);
    console.log("Event Data:", eventData);
    console.log("Service Fee:", serviceFee);
    console.log("Agreement Data:", agreementData);
    console.log("Agreement acceptedTerms:", agreementData?.acceptedTerms);
  };

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      checkAPIEndpoint();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Publish Free Event
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-orange-600">
                  Agreement Signed
                </span>
              </div>
              <div className="flex-1 h-1 bg-orange-500 mx-2"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  Pay Service Fee
                </span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Event Live
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium mb-2">{error}</p>
              <p className="text-red-500 text-xs">
                If this continues, please contact support or try again later.
              </p>
              {process.env.NODE_ENV === "development" && (
                <button
                  onClick={checkAPIEndpoint}
                  className="mt-2 text-xs text-blue-600 underline hover:text-blue-800"
                >
                  Check API Connection (Dev Only)
                </button>
              )}
            </div>
          )}

          {/* Approval-Based Event Notice */}
          {hasApprovalTickets && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-900 mb-1">
                    Approval-Based Registration
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

          {/* Service Details */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Free Event Service Fee
            </h3>
            <div className="text-sm text-orange-700 space-y-1">
              <p>
                <strong>Event:</strong> {eventData.title}
              </p>
              <p>
                <strong>Attendance Range:</strong> {attendanceRange} attendees
              </p>
              <p>
                <strong>Service Type:</strong> Platform hosting & support
              </p>
              {hasApprovalTickets && (
                <p className="font-medium">
                  <strong>Registration Type:</strong> Approval-Based
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Billing Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Service Fee</span>
                <span className="font-medium">
                  ₦{serviceFee.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  Total Amount
                </span>
                <span className="font-bold text-[#FF6B35] text-lg">
                  ₦{serviceFee.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              What's included:
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Event page hosting and management</li>
              <li>• Attendee registration system</li>
              <li>• QR code check-in system</li>
              <li>• Customer support for attendees</li>
              <li>• Platform maintenance and security</li>
              <li>• Event promotion tools</li>
              <li>• Analytics and reporting</li>
              {hasApprovalTickets && (
                <>
                  <li>• Approval-based registration system</li>
                  <li>• Application review dashboard</li>
                  <li>• Automated approval notifications</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#FF6B35] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#FF8535] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay Service Fee - ₦{serviceFee.toLocaleString()}
              </>
            )}
          </button>

          {/* Security Message */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <Lock className="h-4 w-4 mr-1" />
              Secure payment powered by Paystack
            </p>
          </div>

          {/* Additional Info for Approval Events */}
          {hasApprovalTickets && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-700 text-center">
                After payment, you'll have access to the approval dashboard to
                review attendee applications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceFeeCheckout;