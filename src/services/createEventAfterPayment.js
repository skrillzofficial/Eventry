import { transactionAPI, apiCall } from './api';

/**
 * Creates event after successful service fee payment
 * Verifies payment with backend which creates the event
 * @param {string} paymentReference - The Paystack payment reference
 * @returns {Promise<Object>} Result with event data
 */
export const createEventAfterPayment = async (paymentReference) => {
  try {
    console.log('🔍 Creating event after payment:', paymentReference);

    if (!paymentReference) {
      throw new Error('Payment reference is required');
    }

    // 1. Verify payment with backend (backend creates event during verification)
    console.log('🔐 Verifying payment with backend...');
    console.log('📞 Calling API with reference:', paymentReference);
    
    // Call the API - reference goes in the URL path based on your API definition
    const verificationResult = await apiCall(
      () => transactionAPI.verifyServiceFee(paymentReference)
    );

    console.log('✅ Verification result:', verificationResult);

    if (!verificationResult.success) {
      console.error('❌ Verification failed:', verificationResult.error);
      throw new Error(verificationResult.error || 'Payment verification failed');
    }

    // 2. Extract event and transaction from response
    const event = verificationResult.data?.event;
    const transaction = verificationResult.data?.transaction;

    console.log('📦 Response data structure:', {
      hasEvent: !!event,
      hasTransaction: !!transaction,
      eventId: event?._id || event?.id,
      dataKeys: Object.keys(verificationResult.data || {})
    });

    if (!event) {
      console.error('❌ No event in response. Full data:', verificationResult.data);
      throw new Error(
        'Event was not created. Please contact support with reference: ' + paymentReference
      );
    }

    console.log('✨ Event created successfully:', {
      eventId: event._id || event.id,
      eventTitle: event.title,
      status: event.status
    });

    // 3. Clean up local storage
    console.log('🧹 Cleaning up storage...');
    try {
      sessionStorage.removeItem('pendingAgreement');
      localStorage.removeItem('pendingServiceFeePayment');
      console.log('✅ Storage cleaned');
    } catch (storageError) {
      console.warn('⚠️ Storage cleanup failed:', storageError);
    }

    return {
      success: true,
      event: event,
      transaction: transaction,
      message: 'Event created and published successfully!'
    };

  } catch (error) {
    console.error('💥 Error in createEventAfterPayment:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return {
      success: false,
      error: error.message || 'Failed to create event',
      details: error
    };
  }
};

/**
 * Checks if there's a pending service fee payment
 * @returns {Object|null} Pending payment data or null
 */
export const getPendingServiceFeePayment = () => {
  try {
    const pendingStr = localStorage.getItem('pendingServiceFeePayment');
    if (!pendingStr) return null;

    const pending = JSON.parse(pendingStr);
    
    // Check if payment is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    const age = Date.now() - (pending.timestamp || 0);
    
    if (age > maxAge) {
      console.log('⚠️ Pending payment expired, cleaning up');
      localStorage.removeItem('pendingServiceFeePayment');
      sessionStorage.removeItem('pendingAgreement');
      return null;
    }

    return pending;
  } catch (error) {
    console.error('Error checking pending payment:', error);
    return null;
  }
};

/**
 * Clears pending payment data from storage
 */
export const clearPendingPayment = () => {
  try {
    sessionStorage.removeItem('pendingAgreement');
    localStorage.removeItem('pendingServiceFeePayment');
    console.log('🧹 Cleared pending payment data');
  } catch (error) {
    console.error('Error clearing pending payment:', error);
  }
};

export default createEventAfterPayment;