import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import apiClient from '../services/api';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [transaction, setTransaction] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [paymentType, setPaymentType] = useState('ticket'); // 'ticket', 'free_booking', 'service_fee'

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');
    const type = searchParams.get('type'); // 'free', 'service_fee', or undefined (paid ticket)
    
    if (!reference) {
      setVerificationStatus('error');
      return;
    }

    // Set payment type based on URL parameter
    if (type === 'free') {
      setPaymentType('free_booking');
    } else if (type === 'service_fee') {
      setPaymentType('service_fee');
    } else {
      setPaymentType('ticket');
    }

    try {
      if (type === 'free') {
        // ===== FREE EVENT BOOKING VERIFICATION =====
        const response = await apiClient.get(`/bookings/${reference}`);
        
        if (response.data.success) {
          const booking = response.data.booking || response.data.data;
          
          setVerificationStatus('success');
          setTransaction({
            reference: booking._id || reference,
            totalAmount: 0,
            eventTitle: booking.event?.title || booking.eventTitle || 'Free Event',
            bookingDate: booking.createdAt || new Date().toISOString(),
            attendeeName: booking.userInfo?.name || booking.userName,
            attendeeEmail: booking.userInfo?.email || booking.userEmail,
          });
          
          // Set tickets info
          const ticketArray = [];
          for (let i = 0; i < (booking.quantity || 1); i++) {
            ticketArray.push({
              _id: `${booking._id}-${i + 1}`,
              ticketType: booking.ticketType || 'Free Entry',
              ticketNumber: booking.ticketNumber || `${booking._id}-${i + 1}`,
              qrCode: booking.qrCode || null,
            });
          }
          setTickets(ticketArray);
          
          // Redirect to my-bookings after 5 seconds
          setTimeout(() => {
            navigate('/my-bookings');
          }, 5000);
        } else {
          setVerificationStatus('failed');
        }
      } else if (type === 'service_fee') {
        // ===== SERVICE FEE PAYMENT VERIFICATION =====
        const response = await transactionAPI.verifyServiceFee(reference);
        
        if (response.data.success) {
          setVerificationStatus('success');
          setTransaction(response.data.data?.transaction || response.data.transaction);
          
          // Set event data for display
          if (response.data.data?.event) {
            setTransaction(prev => ({
              ...prev,
              eventTitle: response.data.data.event.title,
              eventPublished: true
            }));
          }
          
          // Redirect to organizer dashboard after 5 seconds
          setTimeout(() => {
            navigate('/dashboard/organizer?published=true');
          }, 5000);
        } else {
          setVerificationStatus('failed');
        }
      } else {
        // ===== PAID TICKET PAYMENT VERIFICATION =====
        const response = await transactionAPI.verifyPayment(reference);
        
        if (response.data.success) {
          setVerificationStatus('success');
          setTransaction(response.data.data?.transaction || response.data.transaction);
          setTickets(response.data.data?.tickets || response.data.tickets || []);
          
          // Redirect to my-tickets after 5 seconds
          setTimeout(() => {
            navigate('/my-tickets');
          }, 5000);
        } else {
          setVerificationStatus('failed');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      console.error('Error details:', error.response?.data);
      setVerificationStatus('error');
    }
  };

  const getStatusMessages = () => {
    switch (paymentType) {
      case 'service_fee':
        return {
          verifying: {
            title: 'Confirming Service Fee Payment',
            message: 'Please wait while we confirm your service fee payment...'
          },
          success: {
            title: 'Service Fee Paid Successfully!',
            message: 'Your event has been published successfully!',
            buttonText: 'Go to Dashboard',
            redirectTo: '/dashboard/organizer'
          },
          failed: {
            title: 'Service Fee Payment Failed',
            message: 'Your service fee payment could not be processed. Please try again.'
          }
        };
      case 'free_booking':
        return {
          verifying: {
            title: 'Confirming Your Booking',
            message: 'Please wait while we confirm your booking...'
          },
          success: {
            title: 'Booking Confirmed!',
            message: 'Your free event booking has been confirmed successfully.',
            buttonText: 'View My Bookings',
            redirectTo: '/my-bookings'
          },
          failed: {
            title: 'Booking Failed',
            message: 'Your booking could not be confirmed. Please try again.'
          }
        };
      default: // ticket payment
        return {
          verifying: {
            title: 'Verifying Your Payment',
            message: 'Please wait while we confirm your payment...'
          },
          success: {
            title: 'Payment Successful!',
            message: 'Your tickets have been booked successfully.',
            buttonText: 'View My Tickets',
            redirectTo: '/my-tickets'
          },
          failed: {
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please try again.'
          }
        };
    }
  };

  const renderContent = () => {
    const messages = getStatusMessages();
    
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {messages.verifying.title}
            </h2>
            <p className="text-gray-600">
              {messages.verifying.message}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {messages.success.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {messages.success.message}
            </p>
            
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {paymentType === 'service_fee' ? 'Payment Details' : 'Booking Details'}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">
                      {paymentType === 'service_fee' ? 'Payment ID:' : 
                       paymentType === 'free_booking' ? 'Booking ID:' : 'Transaction ID:'}
                    </span>
                    <span className="font-medium text-sm">{transaction.reference}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {paymentType === 'free_booking' ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        `₦${transaction.totalAmount?.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  {transaction.eventTitle && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">
                        {paymentType === 'service_fee' ? 'Event Published:' : 'Event:'}
                      </span>
                      <span className="font-medium text-right">{transaction.eventTitle}</span>
                    </div>
                  )}
                  
                  {transaction.attendeeName && paymentType !== 'service_fee' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendee:</span>
                      <span className="font-medium">{transaction.attendeeName}</span>
                    </div>
                  )}

                  {paymentType === 'service_fee' && transaction.eventPublished && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">Event Published ✓</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tickets.length > 0 && paymentType !== 'service_fee' && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your {paymentType === 'free_booking' ? 'Booking' : 'Tickets'}
                </h3>
                <div className="space-y-3">
                  {tickets.map((ticket, index) => (
                    <div key={ticket._id || index} className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="font-medium">
                        {paymentType === 'free_booking' ? 'Entry Pass' : 'Ticket'} {index + 1}: {ticket.ticketType}
                      </p>
                      <p className="text-sm text-gray-600">
                        {paymentType === 'free_booking' ? 'Booking' : 'Ticket'} Number: {ticket.ticketNumber}
                      </p>
                      {ticket.qrCode && (
                        <p className="text-sm text-gray-600">QR Code: {ticket.qrCode}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button 
                onClick={() => navigate(messages.success.redirectTo)}
                className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                {messages.success.buttonText}
              </button>
              
              {paymentType === 'service_fee' ? (
                <button 
                  onClick={() => navigate('/events/create')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Create Another Event
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/discover')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Browse More Events
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500">
              You will be redirected {paymentType === 'service_fee' ? 'to your dashboard' : `to your ${paymentType === 'free_booking' ? 'bookings' : 'tickets'}`} in 5 seconds...
            </p>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {messages.failed.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {messages.failed.message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {paymentType === 'service_fee' ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard/organizer')}
                    className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/events/create')}
                    className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/discover')}
                    className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  >
                    Browse Events
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Go Home
                  </button>
                </>
              )}
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h2>
            <p className="text-gray-600 mb-6">
              Something went wrong verifying your {paymentType === 'service_fee' ? 'service fee payment' : 
              paymentType === 'free_booking' ? 'booking' : 'payment'}. 
              {paymentType === 'ticket' && ' Please contact support if your payment was deducted.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate(
                  paymentType === 'service_fee' ? '/dashboard/organizer' :
                  paymentType === 'free_booking' ? '/my-bookings' : '/my-tickets'
                )}
                className="bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                {paymentType === 'service_fee' ? 'Go to Dashboard' :
                 paymentType === 'free_booking' ? 'View My Bookings' : 'View My Tickets'}
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentVerification;