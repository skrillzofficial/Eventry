import React, { useState } from "react";
import {
  CheckCircle,
  X,
  FileText,
  Users,
  CreditCard,
  AlertCircle,
  Shield,
} from "lucide-react";

const PaymentAgreement = ({
  eventData,
  ticketTypes,
  onAgree,
  onCancel,
  onBack,
}) => {
  const [agreed, setAgreed] = useState(false);

  // Check if event is free (all ticket types are 0 or no price)
  const isFreeEvent = ticketTypes.every(
    (ticket) => parseFloat(ticket.price || 0) === 0
  );

  // Check if event has approval-based tickets
  const hasApprovalTickets = ticketTypes.some(
    (ticket) => ticket.requiresApproval && parseFloat(ticket.price || 0) === 0
  );

  const totalCapacity = ticketTypes.reduce(
    (sum, ticket) => sum + parseInt(ticket.capacity || 0),
    0
  );

  const handleAgree = async () => {
    if (!agreed) return;

    // Prepare agreement data
    const agreementData = {
      isFreeEvent,
      hasApprovalTickets,
      totalCapacity,
      agreedAt: new Date().toISOString(),
    };

    try {
      // ✅ FOR ALL EVENTS: Publish directly after agreement
      onAgree(agreementData, "publish_direct");
    } catch (error) {
      console.error("Agreement processing error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Event Publishing Agreement
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
                <span className="font-medium ml-2 text-orange-600">
                  {isFreeEvent ? "Free Event" : "Paid Event"}
                  {hasApprovalTickets && " (Approval-Based)"}
                </span>
              </div>
            </div>

            {/* Approval-Based Event Notice */}
            {hasApprovalTickets && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-orange-900 mb-1">
                      Approval-Based Registration
                    </p>
                    <p className="text-sm text-orange-700">
                      This event uses approval-based registration. Attendees will apply to attend 
                      and you'll review their applications before approving and issuing tickets.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Platform Terms */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#FF6B35]" />
            Platform Terms & Conditions
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

            {isFreeEvent ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  2. Free Event Terms
                </h4>
                <p className="text-sm mb-3">
                  Free events are published immediately without any service fees. 
                  You have full access to all platform features for managing your event.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  2. Paid Event Terms
                </h4>
                <p className="text-sm mb-3">
                  For paid events, Eventry deducts a 2% platform fee from all successful 
                  ticket sales. This fee covers payment processing and platform maintenance.
                </p>
              </div>
            )}

            {hasApprovalTickets && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  3. Approval-Based Registration
                </h4>
                <p className="text-sm mb-3">
                  For approval-based free events, you are responsible for reviewing 
                  and responding to attendee applications in a timely manner.
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {hasApprovalTickets ? "4. Organizer Responsibilities" : "3. Organizer Responsibilities"}
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
                  I understand and agree to the Eventry Platform Terms
                </span>
                <p className="text-sm text-gray-600 mt-1">
                  I agree to publish my event and understand my responsibilities as an organizer.
                  {hasApprovalTickets && " I understand my responsibilities for reviewing and approving attendee applications."}
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
              disabled={!agreed}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Agree & Publish Event
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">
                Ready to publish your event?
              </p>
              <p>
                {isFreeEvent
                  ? "Your free event will be published immediately after accepting the terms. No payment required!"
                  : "Your paid event will be published immediately. Platform fees (3%) will be deducted from ticket sales."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAgreement;