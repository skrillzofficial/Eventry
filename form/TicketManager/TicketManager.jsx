import React from "react";
import { Ticket, Plus, Trash2, X, Monitor, MapPin, Shield } from "lucide-react";
import ApprovalQuestions from "../ApprovalQuestions/ApprovalQuestions";

const TICKET_TYPES = ["Regular", "VIP", "VVIP"];
const EVENT_TYPES = ["physical", "virtual", "hybrid"];

const TicketManager = ({
  useLegacyPricing,
  onTogglePricing,
  ticketTypes,
  onAddTicket,
  onRemoveTicket,
  onUpdateTicket,
  onAddTicketBenefit,
  onRemoveTicketBenefit,
  singleTicketBenefits,
  onAddSingleBenefit,
  onRemoveSingleBenefit,
  eventType,
  onEventTypeChange,
  virtualEventLink,
  onVirtualEventLinkChange,
  register,
  savingAs,
  watch,
  errors
}) => {
  // Single ticket benefit handlers
  const handleAddSingleBenefit = () => {
    const input = document.getElementById("single-benefit-input");
    if (input && input.value.trim() && singleTicketBenefits.length < 10) {
      onAddSingleBenefit(input.value.trim());
      input.value = "";
    }
  };

  const handleSingleBenefitKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSingleBenefit();
    }
  };

  // Multiple ticket benefit handlers
  const handleAddTicketBenefit = (ticketIndex) => {
    const input = document.getElementById(`benefit-input-${ticketIndex}`);
    if (input && input.value.trim()) {
      onAddTicketBenefit(ticketIndex, input.value.trim());
      input.value = "";
    }
  };

  const handleTicketBenefitKeyPress = (ticketIndex, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTicketBenefit(ticketIndex);
    }
  };

  // Check if ticket is free
  const isFreeTicket = (price) => {
    return price === "0" || price === 0 || price === "" || parseFloat(price) === 0;
  };

  // Check if any ticket requires approval
  const hasApprovalTickets = ticketTypes?.some(ticket => 
    isFreeTicket(ticket.price) && ticket.requiresApproval
  );

  // Handle approval questions change
  const handleQuestionsChange = (ticketIndex, questions) => {
    onUpdateTicket(ticketIndex, 'approvalQuestions', questions);
  };

  // Check if there's pricing data
  const hasMultipleTicketData = ticketTypes && ticketTypes.length > 0 && ticketTypes.some(t => t.price || t.capacity);
  const hasSingleTicketData = watch && (watch("price") || watch("capacity"));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#FF6B35]" />
          <h3 className="text-lg font-semibold text-gray-900">
            Ticket Types & Pricing
          </h3>
          {!hasMultipleTicketData && !hasSingleTicketData && (
            <span className="text-sm text-gray-400">(Required to publish)</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onTogglePricing(!useLegacyPricing)}
          disabled={savingAs}
          className="text-sm text-[#FF6B35] hover:underline disabled:opacity-50 font-medium"
        >
          {useLegacyPricing ? "Use Multiple Ticket Types" : "Use Single Price"}
        </button>
      </div>

      {/* Event Type Selection */}
      <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Event Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EVENT_TYPES.map((type) => (
            <label
              key={type}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all ${
                eventType === type
                  ? 'border-[#FF6B35] bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="eventType"
                value={type}
                checked={eventType === type}
                onChange={(e) => onEventTypeChange(e.target.value)}
                disabled={savingAs}
                className="sr-only"
              />
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      {type === 'virtual' && <Monitor className="h-4 w-4" />}
                      {type === 'physical' && <MapPin className="h-4 w-4" />}
                      {type === 'hybrid' && (
                        <>
                          <Monitor className="h-4 w-4" />
                          <MapPin className="h-4 w-4" />
                        </>
                      )}
                      <span className="font-medium text-gray-900 capitalize">
                        {type} Event
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {type === 'virtual' && 'Online only event'}
                      {type === 'physical' && 'In-person event at a venue'}
                      {type === 'hybrid' && 'Both online and in-person'}
                    </p>
                  </div>
                </div>
                {eventType === type && (
                  <div className="flex-shrink-0 text-[#FF6B35]">
                    <div className="w-6 h-6 border-2 border-[#FF6B35] rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#FF6B35] rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Virtual Event Link Input */}
        {(eventType === 'virtual' || eventType === 'hybrid') && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Virtual Event Link {eventType === 'virtual' && '*'}
              {eventType === 'hybrid' && <span className="text-gray-400"> (Optional for hybrid)</span>}
            </label>
            <input
              type="url"
              value={virtualEventLink || ''}
              onChange={(e) => onVirtualEventLinkChange(e.target.value)}
              disabled={savingAs}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
              placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link"
            />
            <p className="text-xs text-gray-500 mt-1">
              This link will be shared with attendees after ticket purchase
            </p>
          </div>
        )}
      </div>

      {/* Approval-Based Registration Notice */}
      {hasApprovalTickets && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-900 mb-1">
                Approval-Based Registration Enabled
              </p>
              <p className="text-sm text-orange-700">
                For free tickets with approval required, attendees will register first 
                and you'll review their application in your organizer dashboard before 
                approving and issuing tickets.
              </p>
            </div>
          </div>
        </div>
      )}

      {!useLegacyPricing ? (
        <div className="space-y-6">
          {ticketTypes && ticketTypes.map((ticket, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-4">
                <select
                  value={ticket.name || "Regular"}
                  onChange={(e) => onUpdateTicket(index, "name", e.target.value)}
                  disabled={savingAs}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold disabled:opacity-50"
                >
                  {TICKET_TYPES.map((type) => (
                    <option
                      key={type}
                      value={type}
                      disabled={ticketTypes.some(
                        (t, i) => i !== index && t.name === type
                      )}
                    >
                      {type}
                    </option>
                  ))}
                </select>
                {ticketTypes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveTicket(index)}
                    disabled={savingAs}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Access Type for Hybrid Events */}
              {(eventType === 'hybrid') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`access-${index}`}
                        value="both"
                        checked={ticket.accessType === 'both' || !ticket.accessType}
                        onChange={(e) => onUpdateTicket(index, "accessType", e.target.value)}
                        disabled={savingAs}
                        className="mr-2 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">Both Virtual & Physical</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`access-${index}`}
                        value="virtual"
                        checked={ticket.accessType === 'virtual'}
                        onChange={(e) => onUpdateTicket(index, "accessType", e.target.value)}
                        disabled={savingAs}
                        className="mr-2 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">Virtual Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`access-${index}`}
                        value="physical"
                        checked={ticket.accessType === 'physical'}
                        onChange={(e) => onUpdateTicket(index, "accessType", e.target.value)}
                        disabled={savingAs}
                        className="mr-2 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <span className="text-sm text-gray-700">Physical Only</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    value={ticket.price || ''}
                    onChange={(e) => onUpdateTicket(index, "price", e.target.value)}
                    disabled={savingAs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={ticket.capacity || ''}
                    onChange={(e) => onUpdateTicket(index, "capacity", e.target.value)}
                    disabled={savingAs}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                    placeholder="Number of tickets"
                    min="1"
                  />
                </div>
              </div>

              {/* Free Event Approval Settings */}
              {isFreeTicket(ticket.price) && (
                <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <h4 className="font-medium text-orange-900">Approval Settings</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`require-approval-${index}`}
                        checked={ticket.requiresApproval || false}
                        onChange={(e) => onUpdateTicket(index, 'requiresApproval', e.target.checked)}
                        disabled={savingAs}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label 
                        htmlFor={`require-approval-${index}`}
                        className="text-sm font-medium text-orange-900"
                      >
                        Require organizer approval for this ticket
                      </label>
                    </div>

                    {ticket.requiresApproval && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-orange-700 mb-1">
                              Maximum Attendees (Optional)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={ticket.maxAttendees || ""}
                              onChange={(e) => onUpdateTicket(index, 'maxAttendees', e.target.value)}
                              disabled={savingAs}
                              className="w-full px-3 py-2 text-sm border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                              placeholder="No limit"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-orange-700 mb-1">
                              Approval Deadline (Optional)
                            </label>
                            <input
                              type="datetime-local"
                              value={ticket.approvalDeadline || ""}
                              onChange={(e) => onUpdateTicket(index, 'approvalDeadline', e.target.value)}
                              disabled={savingAs}
                              className="w-full px-3 py-2 text-sm border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                        </div>

                        {/* Approval Questions Component */}
                        <ApprovalQuestions
                          questions={ticket.approvalQuestions || []}
                          onQuestionsChange={(questions) => handleQuestionsChange(index, questions)}
                          disabled={savingAs}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={ticket.description || ''}
                  onChange={(e) => onUpdateTicket(index, "description", e.target.value)}
                  disabled={savingAs}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                  placeholder={
                    eventType === 'virtual' 
                      ? "e.g., Includes live Q&A and recording access"
                      : eventType === 'hybrid'
                      ? "e.g., Choose between virtual or physical attendance"
                      : "e.g., Includes front row seating"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    id={`benefit-input-${index}`}
                    disabled={savingAs}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                    placeholder={
                      eventType === 'virtual'
                        ? "e.g., Live Q&A access, recording available"
                        : "e.g., VIP lounge access, free parking"
                    }
                    onKeyPress={(e) => handleTicketBenefitKeyPress(index, e)}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTicketBenefit(index)}
                    disabled={savingAs}
                    className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {ticket.benefits && ticket.benefits.length > 0 && (
                  <div className="space-y-1">
                    {ticket.benefits.map((benefit, benefitIndex) => (
                      <div
                        key={benefitIndex}
                        className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                      >
                        <span className="text-sm text-gray-700">
                          • {benefit}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveTicketBenefit(index, benefitIndex)}
                          disabled={savingAs}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {ticketTypes && ticketTypes.length < 3 && (
            <button
              type="button"
              onClick={onAddTicket}
              disabled={savingAs}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Another Ticket Type
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Price (₦) *
              </label>
              <input
                type="number"
                {...register("price")}
                disabled={savingAs}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                {...register("capacity")}
                disabled={savingAs}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                placeholder="Maximum attendees"
                min="1"
              />
            </div>
          </div>

          {/* Legacy Pricing Approval Settings */}
          {isFreeTicket(watch?.("price")) && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-orange-600" />
                <h4 className="font-medium text-orange-900">Approval Settings</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="legacy-require-approval"
                    checked={ticketTypes[0]?.requiresApproval || false}
                    onChange={(e) => onUpdateTicket(0, 'requiresApproval', e.target.checked)}
                    disabled={savingAs}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label 
                    htmlFor="legacy-require-approval"
                    className="text-sm font-medium text-orange-900"
                  >
                    Require organizer approval for registrations
                  </label>
                </div>

                {ticketTypes[0]?.requiresApproval && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-orange-700 mb-1">
                          Maximum Attendees (Optional)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={ticketTypes[0]?.maxAttendees || ""}
                          onChange={(e) => onUpdateTicket(0, 'maxAttendees', e.target.value)}
                          disabled={savingAs}
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          placeholder="No limit"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-orange-700 mb-1">
                          Approval Deadline (Optional)
                        </label>
                        <input
                          type="datetime-local"
                          value={ticketTypes[0]?.approvalDeadline || ""}
                          onChange={(e) => onUpdateTicket(0, 'approvalDeadline', e.target.value)}
                          disabled={savingAs}
                          className="w-full px-3 py-2 text-sm border border-orange-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    {/* Approval Questions for Legacy Pricing */}
                    <ApprovalQuestions
                      questions={ticketTypes[0]?.approvalQuestions || []}
                      onQuestionsChange={(questions) => handleQuestionsChange(0, questions)}
                      disabled={savingAs}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Description (Optional)
            </label>
            <input
              type="text"
              {...register("ticketDescription")}
              disabled={savingAs}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
              placeholder={
                eventType === 'virtual'
                  ? "e.g., Includes live streaming access and digital materials"
                  : "e.g., Includes event materials and refreshments"
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ticket Benefits (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                id="single-benefit-input"
                disabled={savingAs}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
                placeholder={
                  eventType === 'virtual'
                    ? "e.g., Recording access, digital resources"
                    : "e.g., Free parking, event materials"
                }
                onKeyPress={handleSingleBenefitKeyPress}
              />
              <button
                type="button"
                onClick={handleAddSingleBenefit}
                disabled={savingAs}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF8535] transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {singleTicketBenefits && singleTicketBenefits.length > 0 && (
              <div className="space-y-1">
                {singleTicketBenefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">
                      • {benefit}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveSingleBenefit(index)}
                      disabled={savingAs}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Event Type Specific Notes */}
      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium"> Tip: </span>
          {eventType === 'virtual' && 'Virtual events require a streaming link that will be shared with attendees after purchase.'}
          {eventType === 'physical' && 'Physical events require venue details that will be shown to attendees.'}
          {eventType === 'hybrid' && 'Hybrid events support both virtual and physical attendance. You can set different access types for each ticket.'}
          {hasApprovalTickets && ' For free events with approval, attendees answer your questions during registration to help you decide who to approve.'}
        </p>
      </div>
    </div>
  );
};

export default TicketManager;