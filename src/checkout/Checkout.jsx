// components/CheckoutFlow.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Wallet, 
  Shield, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Zap,
  Coins,
  Banknote
} from 'lucide-react';

const CheckoutFlow = ({ event, ticketQuantity, onSuccess, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('crypto'); // 'crypto' or 'fiat'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solPrice, setSolPrice] = useState(100); // Demo SOL price in USD
  const [currentStep, setCurrentStep] = useState('payment'); // 'payment', 'processing', 'success'
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const totalAmountUSD = event.price * ticketQuantity;
  const totalAmountSOL = (totalAmountUSD / solPrice).toFixed(4);

  // Demo payment processing
  const processPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (!isSuccess) {
        throw new Error(paymentMethod === 'crypto' 
          ? 'Transaction failed. Please try again.' 
          : 'Payment declined. Please check your card details.'
        );
      }

      setCurrentStep('success');
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess({
          type: paymentMethod,
          amount: paymentMethod === 'crypto' ? totalAmountSOL : totalAmountUSD,
          currency: paymentMethod === 'crypto' ? 'SOL' : 'USD',
          transactionId: 'DEMO_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          tickets: ticketQuantity,
          event: event
        });
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === 'fiat' && (!userDetails.name || !userDetails.email)) {
      setError('Please fill in all required fields');
      return;
    }
    
    setCurrentStep('processing');
    processPayment();
  };

  const updateUserDetails = (field, value) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Steps configuration
  const steps = [
    { id: 'payment', name: 'Payment Method', status: currentStep === 'payment' ? 'current' : 'upcoming' },
    { id: 'processing', name: 'Processing', status: currentStep === 'processing' ? 'current' : 'upcoming' },
    { id: 'success', name: 'Confirmation', status: currentStep === 'success' ? 'current' : 'upcoming' }
  ];

  if (currentStep === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your tickets for <strong>{event.title}</strong> have been confirmed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono">DEMO_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Tickets:</span>
              <span>{ticketQuantity} × ₦{event.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Paid:</span>
              <span>
                {paymentMethod === 'crypto' ? `${totalAmountSOL} SOL` : `₦${totalAmountUSD.toLocaleString()}`}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Tickets have been sent to your email. See you at the event!
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Purchase</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium ${
                  step.status === 'current' 
                    ? 'border-[#FF6B35] bg-[#FF6B35] text-white' 
                    : step.id === 'success' && currentStep === 'success'
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step.id === 'success' ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    steps[index + 1].status === 'current' || steps[index + 1].status === 'completed'
                      ? 'bg-[#FF6B35]' 
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            {steps.map(step => (
              <span key={step.id} className="flex-1 text-center first:text-left last:text-right">
                {step.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{event.title}</span>
                <span className="font-medium">₦{event.price.toLocaleString()} × {ticketQuantity}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount</span>
                  <span className="text-[#FF6B35]">
                    ₦{totalAmountUSD.toLocaleString()}
                    <span className="text-gray-500 text-xs ml-2">
                      (~{totalAmountSOL} SOL)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {currentStep === 'processing' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-[#FF6B35] animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing {paymentMethod === 'crypto' ? 'Crypto' : 'Card'} Payment
              </h3>
              <p className="text-gray-600">
                Please wait while we confirm your payment...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'crypto'
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Coins className={`h-5 w-5 mr-2 ${
                        paymentMethod === 'crypto' ? 'text-[#FF6B35]' : 'text-gray-400'
                      }`} />
                      <span className="font-medium">Pay with Crypto</span>
                    </div>
                    <p className="text-xs text-gray-500">SOL, USDC, other tokens</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('fiat')}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'fiat'
                        ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <CreditCard className={`h-5 w-5 mr-2 ${
                        paymentMethod === 'fiat' ? 'text-[#FF6B35]' : 'text-gray-400'
                      }`} />
                      <span className="font-medium">Pay with Card</span>
                    </div>
                    <p className="text-xs text-gray-500">Visa, Mastercard, Verve</p>
                  </button>
                </div>
              </div>

              {/* User Details Form */}
              {paymentMethod === 'fiat' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={userDetails.name}
                      onChange={(e) => updateUserDetails('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={userDetails.email}
                      onChange={(e) => updateUserDetails('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={userDetails.phone}
                      onChange={(e) => updateUserDetails('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              )}

              {/* Payment Details */}
              {paymentMethod === 'crypto' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Pay with Solana</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    You'll be redirected to your wallet to confirm the payment of{' '}
                    <strong>{totalAmountSOL} SOL</strong>
                  </p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Network:</span>
                      <span>Solana Mainnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee:</span>
                      <span>~0.000005 SOL</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-900">Card Details</span>
                    <div className="flex space-x-2">
                      <div className="w-8 h-5 bg-gray-300 rounded-sm"></div>
                      <div className="w-8 h-5 bg-gray-300 rounded-sm"></div>
                      <div className="w-8 h-5 bg-gray-300 rounded-sm"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        value="4242 4242 4242 4242"
                        readOnly
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        value="12/28"
                        readOnly
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                        value="123"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Features */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mb-6">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 mr-1" />
                  <span>Encrypted</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF6B35] text-white py-4 rounded-lg font-semibold hover:bg-[#FF8535] transition-all duration-200 hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay ${paymentMethod === 'crypto' ? `${totalAmountSOL} SOL` : `₦${totalAmountUSD.toLocaleString()}`}`
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutFlow;