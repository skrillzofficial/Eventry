import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Checkout = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tickets: [
      {
        ticketType: 'Regular',
        quantity: 1
      }
    ]
  });

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setFetchingEvent(true);
    setError(null);
    
    try {
      const response = await axios.get(`https://ecommerce-backend-tb8u.onrender.com
/api/v1/events/${eventId}`);
      
      // Log to see actual structure
      console.log('Full API Response:', response.data);
      
      // Handle different response structures
      let eventData;
      
      // Check if event is nested in response.data.event or directly in response.data
      if (response.data.event) {
        eventData = response.data.event;
      } else if (response.data.data && response.data.data.event) {
        eventData = response.data.data.event;
      } else if (response.data._id) {
        // Event data is directly in response.data
        eventData = response.data;
      } else {
        throw new Error('Unexpected API response structure');
      }

      console.log('Event Data:', eventData);

      if (!eventData) {
        throw new Error('Event not found in response');
      }

      setEvent(eventData);

      // Handle ticket types
      if (eventData.ticketTypes && Array.isArray(eventData.ticketTypes) && eventData.ticketTypes.length > 0) {
        // Event has multiple ticket types
        setTicketTypes(eventData.ticketTypes);
        setFormData(prev => ({
          ...prev,
          tickets: [{
            ticketType: eventData.ticketTypes[0].name,
            quantity: 1
          }]
        }));
      } else {
        // Single ticket type (fallback)
        const fallbackTicket = {
          name: 'Regular',
          price: eventData.price || 0,
          availableTickets: eventData.availableTickets || eventData.capacity || 10
        };
        setTicketTypes([fallbackTicket]);
        setFormData(prev => ({
          ...prev,
          tickets: [{
            ticketType: 'Regular',
            quantity: 1
          }]
        }));
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to load event details';
      setError(errorMessage);
      
      // Don't show alert if we're showing error state
      // alert(errorMessage);
    } finally {
      setFetchingEvent(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTicketChange = (index, field, value) => {
    const updatedTickets = [...formData.tickets];
    updatedTickets[index] = {
      ...updatedTickets[index],
      [field]: value
    };
    setFormData({
      ...formData,
      tickets: updatedTickets
    });
  };

  const addTicketType = () => {
    if (ticketTypes.length > formData.tickets.length) {
      setFormData({
        ...formData,
        tickets: [
          ...formData.tickets,
          {
            ticketType: ticketTypes[formData.tickets.length]?.name || 'Regular',
            quantity: 1
          }
        ]
      });
    }
  };

  const removeTicketType = (index) => {
    if (formData.tickets.length > 1) {
      const updatedTickets = formData.tickets.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        tickets: updatedTickets
      });
    }
  };

  const calculateTotal = () => {
    return formData.tickets.reduce((total, ticket) => {
      const ticketType = ticketTypes.find(tt => tt.name === ticket.ticketType);
      return total + (ticketType?.price || 0) * ticket.quantity;
    }, 0);
  };

  const calculateServiceFee = (total) => {
    return Math.round((total * 0.025) + 100);
  };

  const handlePayment = async () => {
    if (!formData.fullName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        eventId,
        tickets: formData.tickets,
        userInfo: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        }
      };

      const response = await axios.post('/api/initialize', paymentData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        window.location.href = response.data.data.authorizationUrl;
      } else {
        alert('Failed to initialize payment: ' + response.data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (fetchingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'Unable to load event details'}</p>
            <button 
              onClick={() => navigate('/events')} 
              className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = calculateTotal();
  const serviceFee = calculateServiceFee(subtotal);
  const totalAmount = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-lg text-gray-600">Complete your booking for {event.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendee Information</h2>
            
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-6">Ticket Selection</h2>
            
            <div className="space-y-4">
              {formData.tickets.map((ticket, index) => {
                const ticketType = ticketTypes.find(tt => tt.name === ticket.ticketType);
                const maxQuantity = Math.min(ticketType?.availableTickets || 10, 10);
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ticket Type
                        </label>
                        <select
                          value={ticket.ticketType}
                          onChange={(e) => handleTicketChange(index, 'ticketType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {ticketTypes.map((type) => (
                            <option key={type.name} value={type.name}>
                              {type.name} - ₦{type.price?.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <select
                          value={ticket.quantity}
                          onChange={(e) => handleTicketChange(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {[...Array(maxQuantity).keys()].map(num => (
                            <option key={num + 1} value={num + 1}>
                              {num + 1}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.tickets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 mt-6 sm:mt-0"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="text-right font-semibold text-gray-900">
                      Subtotal: ₦{((ticketType?.price || 0) * ticket.quantity).toLocaleString()}
                    </div>
                  </div>
                );
              })}

              {ticketTypes.length > formData.tickets.length && (
                <button
                  type="button"
                  onClick={addTicketType}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  + Add Another Ticket Type
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Event Details */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-1">
                {new Date(event.date).toLocaleDateString()} at {event.time}
              </p>
              <p className="text-gray-600">{event.venue}, {event.city}</p>
            </div>

            {/* Price Breakdown */}
            <div className="mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service Fee:</span>
                <span className="font-semibold">₦{serviceFee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-orange-600">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-md font-semibold text-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay ₦${totalAmount.toLocaleString()}`
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Your payment is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;