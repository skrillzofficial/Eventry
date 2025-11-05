import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { transactionAPI, apiCall } from '../services/api';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [transaction, setTransaction] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [paymentType, setPaymentType] = useState('ticket'); // 'ticket', 'free_booking', or 'service_fee'

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
      if (type === 'service_fee') {
        // ===== ORGANIZER SERVICE FEE PAYMENT VERIFICATION =====
        console.log('🏢 Verifying service fee payment:', reference);
        
        const result = await apiCall(
          () => transactionAPI.verifyServiceFee(reference)
        );
        
        if (result.success) {
          console.log('✅ Service fee payment verified:', result.data);
          
          const txn = result.data.transaction || result.data.data?.transaction || result.data;
          const event = result.data.event || txn.eventId || {};
          
          setVerificationStatus('success');
          setTransaction({
            reference: txn.reference || reference,
            totalAmount: txn.amount || txn.totalAmount || 0,
            eventTitle: event.title || txn.eventTitle || 'New Event',
            bookingDate: txn.createdAt || txn.completedAt || new Date().toISOString(),
            organizerName: txn.userId?.firstName ? `${txn.userId.firstName} ${txn.userId.lastName}` : 'Organizer',
            organizerEmail: txn.userId?.email || '',
            isDraft: result.data.isDraft || false
          });

          // Redirect to organizer dashboard after 5 seconds
          setTimeout(() => {
            if (result.data.isDraft) {
              // If it's still a draft, redirect to events list
              navigate('/dashboard/organizer/events?payment=success&draft=true', { replace: true });
            } else {
              // If event is created, redirect to the event page
              if (event._id) {
                navigate(`/events/${event._id}`, { replace: true });
              } else {
                navigate('/dashboard/organizer/events?payment=success', { replace: true });
              }
            }
          }, 5000);
        } else {
          console.error(' Service fee verification failed:', result);
          setVerificationStatus('failed');
        }
      } else if (type === 'free') {
        // ===== FREE EVENT BOOKING VERIFICATION =====
        console.log('🎟️ Verifying free booking:', reference);
        
        const result = await apiCall(async () => ({
          data: await fetch(`${import.meta.env.VITE_API_URL || 'https://ecommerce-backend-tb8u.onrender.com/api/v1'}/bookings/${reference}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(r => r.json())
        }));
        
        if (result.success) {
          const booking = result.data.booking || result.data.data || result.data;
          
          console.log('✅ Free booking verified:', booking);
          
          setVerificationStatus('success');
          setTransaction({
            reference: booking._id || reference,
            totalAmount: 0,
            eventTitle: booking.event?.title || booking.eventTitle || 'Free Event',
            bookingDate: booking.createdAt || new Date().toISOString(),
            attendeeName: booking.userInfo?.name || booking.userName,
            attendeeEmail: booking.userInfo?.email || booking.userEmail,
          });
          
          // Create ticket array for display
          const ticketArray = [];
          const quantity = booking.quantity || booking.ticketDetails?.reduce((sum, t) => sum + (t.quantity || 0), 0) || 1;
          
          for (let i = 0; i < quantity; i++) {
            ticketArray.push({
              _id: `${booking._id}-${i + 1}`,
              ticketType: booking.ticketType || 'Free Entry',
              ticketNumber: booking.ticketNumber || `TICKET-${booking._id}-${i + 1}`,
              qrCode: booking.qrCode || null,
            });
          }
          setTickets(ticketArray);
          
          // Redirect to my-bookings after 5 seconds
          setTimeout(() => {
            navigate('/my-bookings', { replace: true });
          }, 5000);
        } else {
          console.error('❌ Free booking verification failed:', result);
          setVerificationStatus('failed');
        }
      } else {
        // ===== PAID TICKET PAYMENT VERIFICATION =====
        console.log('💳 Verifying paid ticket payment:', reference);
        
        const result = await apiCall(
          transactionAPI.verifyTransaction,
          reference
        );
        
        if (result.success) {
          console.log('✅ Payment verified:', result.data);
          
          const txn = result.data.transaction || result.data.data?.transaction || result.data;
          const ticketsData = result.data.tickets || result.data.data?.tickets || [];
          
          setVerificationStatus('success');
          setTransaction({
            reference: txn.reference || reference,
            totalAmount: txn.amount || txn.totalAmount || 0,
            eventTitle: txn.eventId?.title || txn.eventTitle || 'Event',
            bookingDate: txn.createdAt || txn.completedAt || new Date().toISOString(),
            attendeeName: txn.userId?.firstName ? `${txn.userId.firstName} ${txn.userId.lastName}` : 'Attendee',
            attendeeEmail: txn.userId?.email || '',
          });
          
          setTickets(ticketsData);
          
          // Redirect to my-tickets after 5 seconds
          setTimeout(() => {
            navigate('/my-tickets', { replace: true });
          }, 5000);
        } else {
          console.error('❌ Payment verification failed:', result);
          setVerificationStatus('failed');
        }
      }
    } catch (error) {
      console.error('💥 Verification error:', error);
      console.error('Error details:', error.response?.data);
      setVerificationStatus('error');
    }
  };

  const getStatusMessages = () => {
    switch (paymentType) {
      case 'service_fee':
        return {
          verifying: {
            title: 'Verifying Service Fee Payment',
            message: 'Please wait while we confirm your service fee payment...'
          },
          success: {
            title: 'Payment Successful! 🎉',
            message: 'Your service fee has been processed and your event is being published.',
            buttonText: 'View My Events',
            redirectTo: '/dashboard/organizer/events'
          },
          failed: {
            title: 'Payment Failed',
            message: 'Your service fee payment could not be processed. Please try again.'
          }
        };
      case 'free_booking':
        return {
          verifying: {
            title: 'Confirming Your Booking',
            message: 'Please wait while we confirm your free event booking...'
          },
          success: {
            title: 'Booking Confirmed! 🎉',
            message: 'Your free event booking has been confirmed successfully.',
            buttonText: 'View My Bookings',
            redirectTo: '/my-bookings'
          },
          failed: {
            title: 'Booking Failed',
            message: 'Your booking could not be confirmed. Please try again or contact support.'
          }
        };
      default:
        // Paid ticket payment
        return {
          verifying: {
            title: 'Verifying Your Payment',
            message: 'Please wait while we confirm your payment...'
          },
          success: {
            title: 'Payment Successful! 🎉',
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {messages.verifying.title}
            </h2>
            <p className="text-gray-600">
              {messages.verifying.message}
            </p>
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                🔒 Please don't close this window
              </p>
            </div>
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
                  {paymentType === 'service_fee' ? 'Service Fee Payment Details' : 
                   paymentType === 'free_booking' ? 'Booking Details' : 'Payment Details'}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">
                      {paymentType === 'service_fee' ? 'Transaction ID:' : 
                       paymentType === 'free_booking' ? 'Booking ID:' : 'Transaction ID:'}
                    </span>
                    <span className="font-medium text-sm break-all">{transaction.reference}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {paymentType === 'free_booking' ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        `₦${(transaction.totalAmount || 0).toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  {transaction.eventTitle && (
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">
                        {paymentType === 'service_fee' ? 'Event:' : 'Event:'}
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
                  
                  {transaction.organizerName && paymentType === 'service_fee' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Organizer:</span>
                      <span className="font-medium">{transaction.organizerName}</span>
                    </div>
                  )}

                  {transaction.isDraft && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-700">
                        📝 Your event is being processed and will be published shortly.
                      </p>
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
                        Number: {ticket.ticketNumber}
                      </p>
                      {ticket.qrCode && (
                        <p className="text-xs text-gray-500 mt-1">QR: {ticket.qrCode}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button 
                onClick={() => navigate(messages.success.redirectTo, { replace: true })}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                {messages.success.buttonText}
              </button>
              
              {paymentType !== 'service_fee' && (
                <button 
                  onClick={() => navigate('/discover', { replace: true })}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Browse More Events
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to your {paymentType === 'service_fee' ? 'events' : 
                                paymentType === 'free_booking' ? 'bookings' : 'tickets'} in 5 seconds...
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
            
            {paymentType !== 'free_booking' && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ If money was deducted from your account, please contact support with your payment reference.
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {paymentType === 'service_fee' ? (
                <button 
                  onClick={() => navigate('/dashboard/organizer/events', { replace: true })}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                >
                  Back to Events
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/discover', { replace: true })}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                >
                  Browse Events
                </button>
              )}
              <button 
                onClick={() => navigate('/', { replace: true })}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Go Home
              </button>
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
              Something went wrong while verifying your {paymentType === 'service_fee' ? 'service fee payment' : 
                                                       paymentType === 'free_booking' ? 'booking' : 'payment'}. 
              {paymentType !== 'free_booking' && ' Please contact support if your payment was deducted.'}
            </p>
            
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                What to do next:
              </p>
              <ul className="text-sm text-red-700 text-left space-y-1">
                <li>• Check your {paymentType === 'service_fee' ? 'events' : 
                                 paymentType === 'free_booking' ? 'bookings' : 'tickets'} to see if it was processed</li>
                <li>• Contact support if you need assistance</li>
                <li>• Save your reference number if available</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate(
                  paymentType === 'service_fee' ? '/dashboard/organizer/events' :
                  paymentType === 'free_booking' ? '/my-bookings' : '/my-tickets',
                  { replace: true }
                )}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                {paymentType === 'service_fee' ? 'View My Events' :
                 paymentType === 'free_booking' ? 'View My Bookings' : 'View My Tickets'}
              </button>
              <button 
                onClick={() => navigate('/', { replace: true })}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentVerification;