import React, { useState } from "react";
import {
  X,
  CreditCard,
  Lock,
  Calendar,
  Users,
  CheckCircle,
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        eventId: eventData.id || eventData._id || `draft-${Date.now()}`,
        serviceFee: serviceFee,
        attendanceRange: attendanceRange,
        userInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        eventData: {
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          venue: eventData.venue,
          city: eventData.city,
          category: eventData.category,
          // Include all other event data needed for publishing
          ...eventData,
        },
      };

      console.log("Initializing service fee payment:", paymentData);

      const result = await apiCall(
        transactionAPI.initializeServiceFee,
        paymentData
      );

      if (result.success && result.data?.authorizationUrl) {
        // Store agreement data in session storage for after payment
        sessionStorage.setItem(
          "pendingAgreement",
          JSON.stringify({
            agreementData,
            eventData,
            serviceFee,
            attendanceRange,
          })
        );

        // Redirect to payment gateway
        window.location.href = result.data.authorizationUrl;
      } else {
        throw new Error("Payment initialization failed");
      }
    } catch (err) {
      console.error("Service fee payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            Publish Free Event
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Success Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-green-600">
                  Agreement Signed
                </span>
              </div>
              <div className="flex-1 h-1 bg-green-500 mx-2"></div>
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
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Service Details */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Free Event Service Fee
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Event:</strong> {eventData.title}
              </p>
              <p>
                <strong>Attendance Range:</strong> {attendanceRange} attendees
              </p>
              <p>
                <strong>Service Type:</strong> Platform hosting & support
              </p>
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
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              What's included:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Event page hosting and management</li>
              <li>• Attendee registration system</li>
              <li>• QR code check-in system</li>
              <li>• Customer support for attendees</li>
              <li>• Platform maintenance and security</li>
              <li>• Event promotion tools</li>
              <li>• Analytics and reporting</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#FF6B35] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#FF8535] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
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
        </div>
      </div>
    </div>
  );
};

export default ServiceFeeCheckout;
