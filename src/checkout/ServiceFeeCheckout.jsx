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
  agreementData, // Now being used
  onSuccess, // Now being used
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

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

  const handlePayment = async () => {
  if (!formData.fullName || !formData.email) {
    setError("Please fill in all required fields");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    console.log("🔄 Starting payment process...");

    const paymentData = {
      amount: serviceFee,
      email: formData.email,
      eventTitle: eventData.title,
      eventStartDate: eventData.startDate,
      metadata: {
        eventData: eventData,
        userInfo: formData,
        serviceFee: serviceFee,
        agreementData: agreementData,
      }
    };

    console.log("📤 Sending payment request:", paymentData);

    const result = await apiCall(
      transactionAPI.initializeServiceFee,
      paymentData
    );

    console.log("📥 Payment response:", result);

    // ✅ FIX: Check the response structure properly
    if (!result || !result.success) {
      throw new Error(result?.error || "Payment initialization failed");
    }

    // ✅ FIX: Get redirect URL from the correct location
    const redirectUrl = 
      result.data?.authorizationUrl || 
      result.data?.authorization_url ||
      result.data?.data?.authorization_url;

    console.log("🔗 Redirect URL found:", redirectUrl);

    if (!redirectUrl) {
      console.error("❌ No redirect URL in response:", result);
      throw new Error("Payment service error - no redirect URL received");
    }

    // Store reference
    localStorage.setItem("paymentReference", result.data?.reference || result.data?.data?.reference);
    localStorage.setItem("pendingEventData", JSON.stringify({
      eventData: eventData,
      userInfo: formData
    }));

    console.log("🎯 Redirecting to Paystack...");

    // ✅ Redirect to Paystack
    window.location.href = redirectUrl;

  } catch (err) {
    console.error("💥 Payment error:", err);
    setError(err.message || "Payment failed. Please try again.");
    setLoading(false);
  }
};

  // Use agreementData for display if available
  const displayAttendanceRange = agreementData?.estimatedAttendance || attendanceRange;

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
              <p className="text-red-600 text-sm font-medium">{error}</p>
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
                <strong>Attendance Range:</strong> {displayAttendanceRange} attendees
              </p>
              <p>
                <strong>Service Type:</strong> Platform hosting & support
              </p>
              {hasApprovalTickets && (
                <p className="font-medium">
                  <strong>Registration Type:</strong> Approval-Based
                </p>
              )}
              {/* Show agreement status if available */}
              {agreementData?.acceptedTerms && (
                <p className="text-green-600 font-medium">
                  ✓ Terms and Conditions Accepted
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