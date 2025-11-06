import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Loader, 
  AlertTriangle, 
  Calendar,
  User,
  CreditCard,
  MapPin,
  Ticket,
  Rocket,
  ArrowLeft
} from 'lucide-react';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [transaction, setTransaction] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [paymentType, setPaymentType] = useState('ticket');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    verifyPayment();
  }, []);

  useEffect(() => {
    let timer;
    if (verificationStatus === 'success' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    if (countdown === 0 && verificationStatus === 'success') {
      handleRedirect();
    }
    return () => clearTimeout(timer);
  }, [verificationStatus, countdown]);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const type = searchParams.get('type') || 'ticket';
    
    console.log('🔍 Payment verification started:', { reference, type });

    if (!reference) {
      console.error('❌ No reference found');
      setVerificationStatus('error');
      return;
    }

    setPaymentType(type);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://ecommerce-backend-tb8u.onrender.com/api/v1'}/transactions/verify-${type === 'service_fee' ? 'service-fee' : type === 'free' ? 'booking' : 'payment'}/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log('✅ Verification successful:', result.data);
        
        const data = result.data || result;
        const txn = data.transaction || data;
        const event = data.event || txn.eventId || {};
        const booking = data.booking || {};

        setTransaction({
          reference: txn.reference || reference,
          amount: txn.amount || txn.totalAmount || 0,
          eventTitle: event.title || booking.eventTitle || txn.eventTitle || 'Event',
          eventDate: event.startDate || event.date,
          eventLocation: event.venue || event.address || 'Online',
          organizerName: event.organizer?.name || 'Organizer',
          attendeeName: txn.userId?.name || booking.userInfo?.name || 'Attendee',
          attendeeEmail: txn.userId?.email || booking.userInfo?.email,
          bookingDate: txn.createdAt || booking.createdAt || new Date().toISOString(),
          status: 'completed'
        });

        if (data.tickets || booking.ticketDetails) {
          const ticketData = data.tickets || booking.ticketDetails || [];
          setTickets(Array.isArray(ticketData) ? ticketData : [ticketData]);
        }

        setVerificationStatus('success');

      } else {
        throw new Error(result.message || 'Verification failed');
      }

    } catch (error) {
      console.error('❌ Verification error:', error);
      setVerificationStatus('failed');
      setTransaction({
        reference,
        error: error.message || 'Payment verification failed'
      });
    }
  };

  const handleRedirect = () => {
    switch (paymentType) {
      case 'service_fee':
        navigate('/dashboard/organizer/events?published=success', { replace: true });
        break;
      case 'free':
        navigate('/my-bookings?booking=success', { replace: true });
        break;
      default:
        navigate('/my-tickets?payment=success', { replace: true });
    }
  };

  const handleRetry = () => {
    setVerificationStatus('verifying');
    setCountdown(5);
    verifyPayment();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentTypeConfig = () => {
    const configs = {
      service_fee: {
        title: 'Service Fee Payment',
        successTitle: 'Event Published! 🎉',
        successMessage: 'Your event is now live and ready for attendees',
        icon: Rocket,
        redirectTo: 'Events Dashboard',
        color: 'purple'
      },
      free: {
        title: 'Free Booking',
        successTitle: 'Booking Confirmed! 🎉',
        successMessage: 'Your free event registration was successful',
        icon: Ticket,
        redirectTo: 'My Bookings',
        color: 'green'
      },
      ticket: {
        title: 'Ticket Purchase',
        successTitle: 'Payment Successful! 🎉',
        successMessage: 'Your tickets have been booked successfully',
        icon: CreditCard,
        redirectTo: 'My Tickets',
        color: 'blue'
      }
    };

    return configs[paymentType] || configs.ticket;
  };

  const renderVerifying = () => {
    const config = getPaymentTypeConfig();
    const Icon = config.icon;

    return (
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto">
            <Loader className="w-24 h-24 text-gray-300 animate-spin" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Verifying {config.title}
        </h2>
        
        <p className="text-gray-600 mb-8">
          Please wait while we confirm your transaction...
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
          <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Loader className="w-4 h-4 text-orange-600 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Processing Payment</p>
              <p className="text-sm text-gray-500">Verifying transaction details</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg opacity-50">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Confirming Details</p>
              <p className="text-sm text-gray-500">Validating booking information</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg opacity-50">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Finalizing</p>
              <p className="text-sm text-gray-500">Completing the process</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            ⚡ This usually takes just a few seconds. Please don't close this window.
          </p>
        </div>
      </div>
    );
  };

  const renderSuccess = () => {
    const config = getPaymentTypeConfig();
    const Icon = config.icon;

    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto -mt-8 ml-16">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {config.successTitle}
        </h2>
        
        <p className="text-gray-600 mb-8">
          {config.successMessage}
        </p>

        {transaction && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Transaction Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Reference ID</p>
                <p className="font-medium text-gray-900 truncate" title={transaction.reference}>
                  {transaction.reference}
                </p>
              </div>
              
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium text-gray-900">
                  {paymentType === 'free' ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    `₦${transaction.amount?.toLocaleString() || '0'}`
                  )}
                </p>
              </div>
              
              <div className="col-span-2">
                <p className="text-gray-500">Event</p>
                <p className="font-medium text-gray-900">{transaction.eventTitle}</p>
              </div>

              {transaction.eventDate && (
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(transaction.eventDate)}
                  </p>
                </div>
              )}

              {transaction.eventLocation && (
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {transaction.eventLocation}
                  </p>
                </div>
              )}

              {transaction.attendeeName && (
                <div className="col-span-2">
                  <p className="text-gray-500">Attendee</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {transaction.attendeeName}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="bg-white border border-green-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Your {tickets.length > 1 ? 'Tickets' : 'Ticket'}
            </h3>
            <div className="space-y-3">
              {tickets.map((ticket, index) => (
                <div key={ticket._id || index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{ticket.ticketType || 'General Admission'}</p>
                    <p className="text-sm text-gray-600">{ticket.ticketNumber || `TICKET-${transaction.reference}-${index + 1}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Confirmed</p>
                    <p className="text-xs text-gray-500">Ready to use</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <button
            onClick={handleRedirect}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
          >
            View {config.redirectTo}
            {countdown > 0 && <span className="text-orange-200">({countdown})</span>}
          </button>
          
          <button
            onClick={() => navigate('/discover')}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Browse More Events
          </button>
        </div>

        <p className="text-sm text-gray-500">
          {countdown > 0 
            ? `Redirecting to ${config.redirectTo.toLowerCase()} in ${countdown} seconds...`
            : 'Ready to redirect...'
          }
        </p>
      </div>
    );
  };

  const renderFailed = () => {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h2>
        
        <p className="text-gray-600 mb-6">
          {transaction?.error || 'We encountered an issue processing your payment.'}
        </p>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-left">
          <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            What Happened?
          </h3>
          <ul className="text-sm text-red-700 space-y-2">
            <li>• Your payment could not be processed successfully</li>
            <li>• No money was deducted from your account</li>
            <li>• This might be due to network issues or insufficient funds</li>
            <li>• Please try again or use a different payment method</li>
          </ul>
        </div>

        {transaction?.reference && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Reference:</strong> {transaction.reference}
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Keep this number if you need to contact support
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/discover')}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Browse Events
          </button>
          
          <button
            onClick={() => navigate('/support')}
            className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div className="text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Error
        </h2>
        
        <p className="text-gray-600 mb-6">
          We're having trouble verifying your payment. This might be a temporary issue.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Next Steps
          </h3>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li>• Check your email for payment confirmation</li>
            <li>• Verify the payment in your bank statement</li>
            <li>• Contact support if the issue persists</li>
            <li>• Your event/booking might still be processed</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
          >
            Retry Verification
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {verificationStatus === 'verifying' && renderVerifying()}
          {verificationStatus === 'success' && renderSuccess()}
          {verificationStatus === 'failed' && renderFailed()}
          {verificationStatus === 'error' && renderError()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <button 
              onClick={() => navigate('/support')}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;