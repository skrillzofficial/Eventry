import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, CreditCard, Lock, Ticket, Shield, Clock, AlertCircle } from "lucide-react";
import apiClient from "../services/api";
import { useAuth } from "../context/AuthContext";

const CheckoutFlow = ({ event, ticketQuantity, onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [approvalAnswers, setApprovalAnswers] = useState({});

  useEffect(() => {
    console.log("CheckoutFlow received event:", event);
    console.log("CheckoutFlow received quantity:", ticketQuantity);
    
    checkIfOrganizer();
  }, [event, ticketQuantity, user]);

  const checkIfOrganizer = () => {
    if (!user || !event) {
      setIsOrganizer(false);
      return;
    }

    const currentUserId = user._id || user.id;
    const organizerId = event.organizer?._id || event.organizer?.id;
    const userEmail = user.email;
    const organizerEmail = event.organizer?.email;

    const isEventOrganizer = 
      currentUserId === organizerId || 
      userEmail === organizerEmail ||
      (event.organizerInfo && (
        userEmail === event.organizerInfo.email ||
        currentUserId === event.organizerInfo._id
      ));

    setIsOrganizer(isEventOrganizer);
    
    if (isEventOrganizer) {
      setError("You are the organizer of this event and cannot purchase tickets.");
    }
  };

  const isApprovalEvent = () => {
    const ticketPrice = event.selectedTicketType
      ? event.selectedTicketType.price
      : event.price || 0;
    
    const requiresApproval = event.selectedTicketType
      ? event.selectedTicketType.requiresApproval
      : event.requiresApproval || false;

    return ticketPrice === 0 && requiresApproval;
  };

  const isRegularFreeEvent = () => {
    const ticketPrice = event.selectedTicketType
      ? event.selectedTicketType.price
      : event.price || 0;
    
    const requiresApproval = event.selectedTicketType
      ? event.selectedTicketType.requiresApproval
      : event.requiresApproval || false;

    return ticketPrice === 0 && !requiresApproval;
  };

  // Helper function to safely extract approval questions
  const getApprovalQuestions = () => {
    if (!event.selectedTicketType?.approvalQuestions) return [];
    
    const questions = event.selectedTicketType.approvalQuestions;
    
    return questions.map(question => {
      if (typeof question === 'object' && question.question) {
        return {
          id: question._id || question.id || Math.random().toString(36).substr(2, 9),
          question: question.question,
          required: question.required !== false
        };
      }
      else if (typeof question === 'string') {
        return {
          id: Math.random().toString(36).substr(2, 9),
          question: question,
          required: true
        };
      }
      return {
        id: Math.random().toString(36).substr(2, 9),
        question: "Please provide additional information for your application",
        required: true
      };
    });
  };

  const handleApprovalAnswerChange = (questionId, answer) => {
    setApprovalAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

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

  const handlePayment = async () => {
    // Validate required fields
    if (!formData.fullName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate approval questions if this is an approval event
    const approvalQuestions = getApprovalQuestions();
    if (isApprovalEvent() && approvalQuestions.length > 0) {
      const unansweredRequiredQuestions = approvalQuestions.filter(q => 
        q.required && (!approvalAnswers[q.id] || approvalAnswers[q.id].trim() === '')
      );
      
      if (unansweredRequiredQuestions.length > 0) {
        alert("Please answer all required approval questions");
        return;
      }
    }

    if (isOrganizer) {
      alert("Organizers cannot purchase tickets for their own events.");
      return;
    }

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

      const isFreeEvent = ticketPrice === 0;
      const requiresApproval = isApprovalEvent();

      // Build the booking data - backend will handle generating IDs, QR codes, etc.
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

      // Add approval answers if this is an approval-based event
      if (requiresApproval && approvalQuestions.length > 0) {
        bookingData.approvalQuestions = approvalQuestions.map(q => ({
          question: q.question,
          answer: approvalAnswers[q.id] || "",
          required: q.required
        }));
      }

      console.log("Sending booking data to backend:", bookingData);

      // Make the booking request - backend will handle all the ticket creation
      const response = await apiClient.post(
        `/events/${event.id || event._id}/book`,
        bookingData
      );

      console.log("Booking response:", response.data);

      if (response.data.success) {
        const bookingReference = response.data.data?.booking?.id || 
                                response.data.booking?.id ||
                                response.data.data?.booking?._id || 
                                response.data.booking?._id;
        
        onClose();
        
        if (requiresApproval) {
          navigate(`/payment-verification?reference=${bookingReference}&type=approval-pending`);
        } else {
          navigate(`/payment-verification?reference=${bookingReference}&type=free`);
        }
      } else {
        throw new Error(response.data.message || "Booking failed");
      }
    } catch (err) {
      console.error("=== BOOKING ERROR ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      let errorMessage = "Booking failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pricing
  const subtotal = calculateTotal();
  const isFreeEvent = subtotal === 0;
  const requiresApproval = isApprovalEvent();
  const isRegularFree = isRegularFreeEvent();
  const approvalQuestions = getApprovalQuestions();

  // ... rest of your component remains the same (the UI part)
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

  if (isOrganizer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold text-gray-900">Event Organizer</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">
                    Organizer Access
                  </p>
                  <p className="text-sm text-blue-700">
                    You are the organizer of this event and cannot purchase tickets for it.
                  </p>
                </div>
              </div>
            </div>

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
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  navigate("/dashboard/organizer");
                }}
                className="w-full bg-[#FF6B35] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#FF8535] transition-colors flex items-center justify-center"
              >
                <Shield className="h-5 w-5 mr-2" />
                Go to Organizer Dashboard
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-white text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Manage your event from the organizer dashboard
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {error && !isOrganizer && (
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

              {/* Fixed Approval Questions Section */}
              {requiresApproval && approvalQuestions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Please answer these questions to help the organizer review your application:
                  </p>
                  {approvalQuestions.map((questionObj) => (
                    <div key={questionObj.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {questionObj.question}
                        {questionObj.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <textarea
                        value={approvalAnswers[questionObj.id] || ''}
                        onChange={(e) => handleApprovalAnswerChange(questionObj.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] resize-none"
                        rows="3"
                        placeholder="Your answer..."
                        required={questionObj.required}
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

              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">
                  {requiresApproval ? "Total" : "Total Amount"}
                </span>
                <span className="font-bold text-[#FF6B35] text-lg">
                  {isFreeEvent ? "FREE" : `₦${subtotal.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handlePayment}
            disabled={loading || isOrganizer}
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
                Pay ₦{subtotal.toLocaleString()}
              </>
            )}
          </button>

          {/* Footer Messages */}
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