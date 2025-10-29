import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, CreditCard, Lock, Ticket, Shield, Clock } from "lucide-react";
import apiClient from "../services/api";

const CheckoutFlow = ({ event, ticketQuantity, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    console.log("CheckoutFlow received event:", event);
    console.log("CheckoutFlow received quantity:", ticketQuantity);
  }, [event, ticketQuantity]);

  // Check if this is an approval-based free event
  const isApprovalEvent = () => {
    const ticketPrice = event.selectedTicketType
      ? event.selectedTicketType.price
      : event.price || 0;
    
    const requiresApproval = event.selectedTicketType
      ? event.selectedTicketType.requiresApproval
      : event.requiresApproval || false;

    return ticketPrice === 0 && requiresApproval;
  };

  // Check if this is a regular free event (no approval required)
  const isRegularFreeEvent = () => {
    const ticketPrice = event.selectedTicketType
      ? event.selectedTicketType.price
      : event.price || 0;
    
    const requiresApproval = event.selectedTicketType
      ? event.selectedTicketType.requiresApproval
      : event.requiresApproval || false;

    return ticketPrice === 0 && !requiresApproval;
  };

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h3>
          <p className="text-gray-600 mb-4">Unable to load event details</p>
          <button
            onClick={onClose}
            className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    const ticketPrice = event.selectedTicketType
      ? event.selectedTicketType.price
      : event.price || 0;
    return ticketPrice * ticketQuantity;
  };

  const calculateServiceFee = (total) => {
    return Math.round(total * 0.025 + 100);
  };

  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to complete your booking");
      onClose();
      navigate("/login", { state: { from: `/event/${event.id}` } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ticketType = event.selectedTicketType
        ? event.selectedTicketType.name
        : "Regular";
      
      const ticketPrice = event.selectedTicketType
        ? event.selectedTicketType.price
        : event.price || 0;

      // Determine event type
      const isFreeEvent = ticketPrice === 0;
      const requiresApproval = isApprovalEvent();

      if (isFreeEvent) {
        // ===== FREE EVENT FLOW =====
        const bookingData = {
          ticketType: ticketType,
          quantity: ticketQuantity,
          userInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
          requiresApproval: requiresApproval,
        };

        console.log("Booking free event:", bookingData);

        const response = await apiClient.post(
          `/events/${event.id || event._id}/book`,
          bookingData
        );

        console.log("Booking response:", response.data);

        if (response.data.success) {
          // Generate a booking reference for free events
          const bookingReference = response.data.booking?._id || 
                                  response.data.booking?.bookingId || 
                                  `FREE-${Date.now()}`;
          
          // Close modal
          onClose();
          
          // Redirect to appropriate verification page
          if (requiresApproval) {
            // For approval-based events, go to pending approval page
            navigate(`/payment-verification?reference=${bookingReference}&type=approval-pending`);
          } else {
            // For regular free events, go to standard verification
            navigate(`/payment-verification?reference=${bookingReference}&type=free`);
          }
        } else {
          throw new Error(response.data.message || "Booking failed");
        }
      } else {
        // ===== PAID EVENT FLOW =====
        // Initialize payment through Paystack
        const tickets = [
          {
            ticketType: ticketType,
            quantity: ticketQuantity,
          },
        ];

        const paymentData = {
          eventId: event.id || event._id,
          tickets: tickets,
          userInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
          },
        };

        console.log("Initializing payment:", paymentData);

        const response = await apiClient.post("/transactions/initialize", paymentData);

        console.log("Payment response:", response.data);

        // Handle Paystack response and redirect to payment page
        if (response.data.success && response.data.data?.authorizationUrl) {
          window.location.href = response.data.data.authorizationUrl;
        } else if (response.data.authorizationUrl) {
          window.location.href = response.data.authorizationUrl;
        } else if (response.data.data?.authorization_url) {
          window.location.href = response.data.data.authorization_url;
        } else {
          throw new Error("Authorization URL not found in response");
        }
      }
    } catch (err) {
      console.error("=== BOOKING/PAYMENT ERROR ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Booking failed. Please try again.";

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing
  const subtotal = calculateTotal();
  const serviceFee = subtotal > 0 ? calculateServiceFee(subtotal) : 0;
  const totalAmount = subtotal + serviceFee;
  const isFreeEvent = subtotal === 0;
  const requiresApproval = isApprovalEvent();
  const isRegularFree = isRegularFreeEvent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {isFreeEvent ? "Confirm Registration" : "Checkout"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Approval-Based Event Notice */}
          {requiresApproval && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-900 mb-1">
                    Approval Required
                  </p>
                  <p className="text-sm text-orange-700">
                    This event requires organizer approval. Your registration will be reviewed, 
                    and you'll receive a confirmation email if approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Regular Free Event Badge */}
          {isRegularFree && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-medium flex items-center">
                <Ticket className="h-4 w-4 mr-2" />
                This is a free event! No payment required.
              </p>
            </div>
          )}

          {/* Event Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                {new Date(event.date).toLocaleDateString("en-NG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} at {event.time}
              </p>
              <p>
                {event.venue}, {event.city}
              </p>
              {event.selectedTicketType && (
                <p className="font-medium text-[#FF6B35]">
                  Ticket Type: {event.selectedTicketType.name}
                </p>
              )}
              {requiresApproval && (
                <p className="text-orange-600 font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Pending Approval
                </p>
              )}
            </div>
          </div>

          {/* Attendee Information Form */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {requiresApproval ? "Application Information" : "Attendee Information"}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35]"
                  placeholder="+234 800 000 0000"
                />
              </div>

              {/* Additional Questions for Approval Events */}
              {requiresApproval && event.selectedTicketType?.approvalQuestions && event.selectedTicketType.approvalQuestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Please answer these questions to help the organizer review your application:
                  </p>
                  {event.selectedTicketType.approvalQuestions.map((question, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {question}
                      </label>
                      <textarea
                        name={`question-${index}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none"
                        rows="3"
                        placeholder="Your answer..."
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {requiresApproval ? "Registration Summary" : "Order Summary"}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {event.selectedTicketType?.name || "Regular"} Registration x {ticketQuantity}
                </span>
                <span className="font-medium">
                  {isFreeEvent ? "FREE" : `₦${subtotal.toLocaleString()}`}
                </span>
              </div>

              {!isFreeEvent && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee (2.5% + ₦100)</span>
                  <span className="font-medium">₦{serviceFee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  {requiresApproval ? "Total" : "Total Amount"}
                </span>
                <span className="font-bold text-[#FF6B35] text-lg">
                  {isFreeEvent ? "FREE" : `₦${totalAmount.toLocaleString()}`}
                </span>
              </div>
            </div>
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
                Processing...
              </>
            ) : requiresApproval ? (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Submit Application
              </>
            ) : isFreeEvent ? (
              <>
                <Ticket className="h-5 w-5 mr-2" />
                Confirm Registration
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Pay ₦{totalAmount.toLocaleString()}
              </>
            )}
          </button>

          {/* Footer Message */}
          {!isFreeEvent && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <Lock className="h-4 w-4 mr-1" />
                Secure payment powered by Paystack
              </p>
            </div>
          )}

          {requiresApproval && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Your application will be reviewed by the organizer. You'll receive an email notification.
              </p>
            </div>
          )}

          {isRegularFree && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                You'll receive a confirmation email after registration
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { CheckoutFlow };
export default CheckoutFlow;