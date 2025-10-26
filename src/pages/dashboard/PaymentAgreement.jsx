import React, { useState } from "react";
import {
  CheckCircle,
  X,
  FileText,
  Users,
  CreditCard,
  AlertCircle,
} from "lucide-react";

const PaymentAgreement = ({
  eventData,
  ticketTypes,
  onAgree,
  onCancel,
  onBack,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [calculating, setCalculating] = useState(false);

  // Check if event is free (all ticket types are 0 or no price)
  const isFreeEvent = ticketTypes.every(
    (ticket) => parseFloat(ticket.price || 0) === 0
  );

  // Fee structure for free events
  const freeEventFees = [
    {
      range: "1 – 100",
      fee: "₦2,000 – ₦3,000",
      description:
        "For small gatherings or test events. Keeps cost low for entry-level users.",
    },
    {
      range: "101 – 500",
      fee: "₦5,000 – ₦8,000",
      description:
        "Mid-size community events, meetups, or workshops. Covers bandwidth, dashboard use & support.",
    },
    {
      range: "501 – 1,000",
      fee: "₦10,000 – ₦15,000",
      description:
        "Larger free events that require more data tracking, check-in support, and system load.",
    },
    {
      range: "1,001 – 5,000",
      fee: "₦20,000 – ₦35,000",
      description:
        "Concerts, religious events, or large brand activations. Could include priority support.",
    },
    {
      range: "5,001+",
      fee: "₦50,000+",
      description:
        "Premium-tier events with extensive support and infrastructure requirements.",
    },
  ];

  // Calculate estimated fee based on capacity
  const calculateFee = (capacity) => {
    const cap = parseInt(capacity);
    if (cap <= 100) return { min: 2000, max: 3000, range: "₦2,000 – ₦3,000" };
    if (cap <= 500) return { min: 5000, max: 8000, range: "₦5,000 – ₦8,000" };
    if (cap <= 1000)
      return { min: 10000, max: 15000, range: "₦10,000 – ₦15,000" };
    if (cap <= 5000)
      return { min: 20000, max: 35000, range: "₦20,000 – ₦35,000" };
    return { min: 50000, max: 50000, range: "₦50,000+" };
  };

  const totalCapacity = ticketTypes.reduce(
    (sum, ticket) => sum + parseInt(ticket.capacity || 0),
    0
  );

  const estimatedFee = selectedCapacity ? calculateFee(selectedCapacity) : null;

  const handleAgree = async () => {
    if (!agreed) return;

    setCalculating(true);

    // Prepare agreement data
    const agreementData = {
      isFreeEvent,
      totalCapacity: selectedCapacity || totalCapacity,
      serviceFee: isFreeEvent ? estimatedFee : null,
      platformFee: !isFreeEvent ? 0.03 : null, // 3% for paid events
      agreedAt: new Date().toISOString(),
    };

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onAgree(agreementData);
    setCalculating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isFreeEvent ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {isFreeEvent ? (
                  <Users className="h-6 w-6 text-blue-600" />
                ) : (
                  <CreditCard className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isFreeEvent
                    ? "Free Event Agreement"
                    : "Paid Event Agreement"}
                </h1>
                <p className="text-gray-600">
                  Review and accept the platform terms to publish your event
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Event Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Event Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Event:</span>
                <span className="font-medium ml-2">{eventData.title}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Capacity:</span>
                <span className="font-medium ml-2">
                  {totalCapacity} attendees
                </span>
              </div>
              <div>
                <span className="text-gray-600">Ticket Types:</span>
                <span className="font-medium ml-2">
                  {ticketTypes.map((t) => t.name).join(", ")}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Event Type:</span>
                <span
                  className={`font-medium ml-2 ${
                    isFreeEvent ? "text-blue-600" : "text-green-600"
                  }`}
                >
                  {isFreeEvent ? "Free Event" : "Paid Event"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Structure */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF6B35]" />
            Platform Fee Structure
          </h2>

          {isFreeEvent ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Free Event Service Fees
                </h3>
                <p className="text-gray-600 mb-4">
                  Since there's no ticket revenue for free events, Eventry
                  charges a small service fee based on your expected attendance
                  to cover platform costs and support.
                </p>

                {/* Capacity Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select your expected attendance range:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {freeEventFees.map((feeTier, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCapacity(feeTier.range)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedCapacity === feeTier.range
                            ? "border-[#FF6B35] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold text-gray-900">
                          {feeTier.range} attendees
                        </div>
                        <div className="text-[#FF6B35] font-bold text-lg mt-1">
                          {feeTier.fee}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {feeTier.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Fee Display */}
                {estimatedFee && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          Estimated Service Fee
                        </h4>
                        <p className="text-blue-700">
                          Your selected range: {selectedCapacity} attendees
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-900">
                          {estimatedFee.range}
                        </div>
                        <p className="text-sm text-blue-600">
                          One-time service fee
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Paid Event Platform Fees
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">
                      3% Platform Fee on Ticket Sales
                    </h4>
                    <p className="text-green-700 mb-2">
                      Eventry earns a small percentage (3%) from every ticket
                      sold through the platform.
                    </p>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• No upfront costs for organizers</li>
                      <li>• Fees only apply to successful sales</li>
                      <li>• Transparent pricing with no hidden charges</li>
                      <li>• Comprehensive platform features included</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">
                  Example Calculation:
                </h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    • 100 tickets sold at ₦5,000 each = ₦500,000 total sales
                  </p>
                  <p>• Platform fee (3%) = ₦15,000</p>
                  <p>• Your payout = ₦485,000</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Terms and Agreement */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h2>

          <div className="space-y-4 text-gray-700 max-h-60 overflow-y-auto p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. Platform Usage
              </h4>
              <p className="text-sm mb-3">
                By publishing your event on Eventry, you agree to use the
                platform in accordance with our terms of service and community
                guidelines.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Fee Agreement
              </h4>
              <p className="text-sm mb-3">
                {isFreeEvent
                  ? `You agree to pay the service fee of ${
                      estimatedFee?.range || "TBD"
                    } for your free event. This fee covers platform maintenance, customer support, and event management tools.`
                  : "You agree that Eventry will deduct a 3% platform fee from all successful ticket sales. This fee covers payment processing, platform maintenance, and customer support."}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Payment Terms
              </h4>
              <p className="text-sm mb-3">
                {isFreeEvent
                  ? "Service fees for free events are due upon event publication and will be invoiced separately. Event may be unpublished if payment is not received."
                  : "Platform fees for paid events are automatically deducted from ticket sales. Payouts to organizers occur within 7-14 business days after the event concludes."}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                4. Cancellation Policy
              </h4>
              <p className="text-sm mb-3">
                Events can be cancelled or unpublished at any time. However,
                service fees for free events are non-refundable once the event
                is published.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                5. Organizer Responsibilities
              </h4>
              <p className="text-sm">
                You are responsible for providing accurate event information,
                managing attendee expectations, and delivering the event as
                described. Eventry acts as a platform provider only.
              </p>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded"
              />
              <div>
                <span className="font-medium text-gray-900">
                  I understand and agree to the Eventry Platform Terms and Fee
                  Structure
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  {isFreeEvent
                    ? `I agree to pay the service fee of ${
                        estimatedFee?.range || "based on selected attendance"
                      } for this free event.`
                    : "I agree to the 3% platform fee deduction from all ticket sales for this paid event."}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Editing
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleAgree}
              disabled={
                !agreed || (isFreeEvent && !selectedCapacity) || calculating
              }
              className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {calculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Agreement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Agree & Publish Event
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">
                Need help understanding the fees?
              </p>
              <p>
                {isFreeEvent
                  ? "Service fees for free events help us maintain platform quality and provide support for your attendees. Contact support if you have questions about the fee structure."
                  : "The 3% platform fee is competitive and covers all payment processing, platform features, and customer support. No hidden charges."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAgreement;
