// services/createEventAfterPayment.js
import { transactionAPI, apiCall } from './api';

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map();
const completedReferences = new Set();

/**
 * Creates event after successful service fee payment
 * Verifies payment with backend and completes event creation
 * @param {string} paymentReference - The Paystack payment reference
 * @returns {Promise<Object>} Result with event data
 */
export const createEventAfterPayment = async (paymentReference) => {
  console.log('🚀 createEventAfterPayment called with reference:', paymentReference);

  // CRITICAL: Prevent duplicate calls
  if (completedReferences.has(paymentReference)) {
    console.warn('⚠️ Reference already processed:', paymentReference);
    return {
      success: true,
      message: 'Event already created for this payment',
      alreadyProcessed: true
    };
  }

  if (ongoingRequests.has(paymentReference)) {
    console.warn('⚠️ Request already in progress for reference:', paymentReference);
    return ongoingRequests.get(paymentReference);
  }

  // Validate reference
  if (!paymentReference || typeof paymentReference !== 'string') {
    const error = {
      success: false,
      error: 'Invalid payment reference',
      details: new Error('Payment reference is required'),
    };
    console.error('❌ Invalid reference:', paymentReference);
    return error;
  }

  try {
    console.log('📡 Calling complete-draft-event API (creates event directly)...');

    // Create the promise and store it
    const requestPromise = (async () => {
      try {
        // ✅ CRITICAL FIX: Call completeDraftEvent directly (it verifies payment internally)
        const response = await apiCall(
          () => transactionAPI.completeDraftEvent(paymentReference)
        );

        console.log('✅ API Response:', {
          status: response.status,
          success: response.success,
          hasEvent: !!response.data?.event,
        });

        // Clean up tracking
        ongoingRequests.delete(paymentReference);

        // Validate response structure
        if (!response.success) {
          throw new Error(
            response.error || response.message || 'Event creation failed after payment verification'
          );
        }

        if (!response.data || !response.data.event) {
          throw new Error('Invalid response structure from server - no event returned');
        }

        // Mark as completed
        completedReferences.add(paymentReference);

        // Clean up storage
        console.log('🧹 Cleaning up storage...');
        try {
          sessionStorage.removeItem('pendingAgreement');
          sessionStorage.removeItem('pendingEventData');
          localStorage.removeItem('pendingServiceFeePayment');
          console.log('✅ Storage cleaned');
        } catch (storageError) {
          console.warn('⚠️ Storage cleanup failed:', storageError);
        }

        return {
          success: true,
          event: response.data.event,
          transaction: response.data.transaction,
          message: response.data.message || 'Event created successfully!',
        };
      } catch (error) {
        // Clean up tracking on error
        ongoingRequests.delete(paymentReference);
        throw error;
      }
    })();

    // Store the promise
    ongoingRequests.set(paymentReference, requestPromise);

    return await requestPromise;
  } catch (error) {
    console.error('💥 Error in createEventAfterPayment:', error);
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    // Clean up tracking
    ongoingRequests.delete(paymentReference);

    return {
      success: false,
      error: error.message || 'Event creation failed after payment verification',
      details: error,
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
      sessionStorage.removeItem('pendingEventData');
      return null;
    }

    return pending;
  } catch (error) {
    console.error('Error checking pending payment:', error);
    return null;
  }
};

/**
 * Gets pending event data from storage
 */
export const getPendingEventData = () => {
  try {
    const pendingStr = sessionStorage.getItem('pendingEventData');
    if (!pendingStr) return null;

    const pending = JSON.parse(pendingStr);
    
    // Check if not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    const age = Date.now() - (pending.timestamp || 0);
    
    if (age > maxAge) {
      console.log('⚠️ Pending event data expired, cleaning up');
      sessionStorage.removeItem('pendingEventData');
      return null;
    }

    return pending;
  } catch (error) {
    console.error('Error checking pending event data:', error);
    return null;
  }
};

/**
 * Stores event data for later completion
 */
export const storePendingEventData = (eventData) => {
  try {
    const pendingData = {
      eventData: eventData,
      timestamp: Date.now()
    };
    sessionStorage.setItem('pendingEventData', JSON.stringify(pendingData));
    console.log('💾 Stored pending event data:', eventData.title);
  } catch (error) {
    console.error('Error storing pending event data:', error);
  }
};

/**
 * Clears pending event data from storage
 */
export const clearPendingEventData = () => {
  try {
    sessionStorage.removeItem('pendingEventData');
    console.log('🧹 Cleared pending event data');
  } catch (error) {
    console.error('Error clearing pending event data:', error);
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

/**
 * Clear all tracking (useful for testing/cleanup)
 */
export const clearAllTracking = () => {
  ongoingRequests.clear();
  completedReferences.clear();
  clearPendingEventData();
  clearPendingPayment();
  console.log('🧹 Cleared all tracking data');
};

// Default export for flexibility
export default createEventAfterPayment;