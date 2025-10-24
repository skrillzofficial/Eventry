import axios from "axios";

export const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://ecommerce-backend-tb8u.onrender.com/api/v1";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 50000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message?.includes("Token expired")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password, userType = "attendee") =>
    apiClient.post("/login", {
      email,
      password,
      userType,
    }),

  register: (userData) =>
    apiClient.post("/register", userData, {
      timeout: 180000,
    }),

  getCurrentUser: () => apiClient.get("/me"),
  logout: () => apiClient.post("/logout"),
  updateProfile: (userData) => apiClient.patch("/profile", userData),
};

// User API calls
export const userAPI = {
  getUserProfile: (userId) => apiClient.get(`/users/${userId}`),
  updateUser: (userId, userData) =>
    apiClient.patch(`/users/${userId}`, userData),
};

// Event API calls
export const eventAPI = {
  // Public routes
  getFeaturedEvents: () => apiClient.get("/events/featured"),
  getUpcomingEvents: () => apiClient.get("/events/upcoming"),
  getAllEvents: (params = {}) => apiClient.get("/events", { params }),
  getPastEvents: (params = {}) => apiClient.get("/events/past", { params }),
  getEventById: (id) => apiClient.get(`/events/${id}`),

  // Protected routes (require authentication)
  getMyBookings: (params = {}) =>
    apiClient.get("/events/my-bookings", { params }),
  bookEventTicket: (eventId, bookingData) =>
    apiClient.post(`/events/${eventId}/book`, bookingData),
  cancelBooking: (eventId) =>
    apiClient.delete(`/events/${eventId}/cancel-booking`),
  toggleLikeEvent: (eventId) => apiClient.post(`/events/${eventId}/like`),

  // Organizer-only routes - UPDATED WITH PROPER ENDPOINTS
  getOrganizerEvents: (params = {}) =>
    apiClient.get("/events/organizer/my-events", { params }),

  getOrganizerStatistics: () => apiClient.get("/events/organizer/statistics"),

  createEvent: (eventData) =>
    apiClient.post("/events/create", eventData, {
      timeout: 120000,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateEvent: (eventId, eventData) =>
    apiClient.patch(`/events/${eventId}`, eventData, {
      headers:
        eventData instanceof FormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : {
              "Content-Type": "application/json",
            },
    }),

  deleteEventImage: (eventId, imageIndex) =>
    apiClient.delete(`/events/${eventId}/images/${imageIndex}`),

  cancelEvent: (eventId) => apiClient.patch(`/events/${eventId}/cancel`),

  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`),

  // Additional organizer endpoints
  getEventAnalytics: (eventId) => apiClient.get(`/events/${eventId}/analytics`),

  updateEventStatus: (eventId, status) =>
    apiClient.patch(`/events/${eventId}/status`, { status }),
};

// Organizer-specific API calls - NEW DEDICATED SECTION
export const organizerAPI = {
  // Event Management
  getMyEvents: (params = {}) =>
    apiClient.get("/events/organizer/my-events", { params }),

  getEventStats: (eventId) =>
    apiClient.get(`/events/organizer/events/${eventId}/stats`),

  getRevenueAnalytics: (params = {}) =>
    apiClient.get("/events/organizer/analytics/revenue", { params }),

  getAttendanceAnalytics: (params = {}) =>
    apiClient.get("/events/organizer/analytics/attendance", { params }),

  // Dashboard Statistics
  getDashboardStats: () => apiClient.get("/events/organizer/dashboard/stats"),

  // Event operations with organizer context
  publishEvent: (eventId) =>
    apiClient.patch(`/events/organizer/events/${eventId}/publish`),

  unpublishEvent: (eventId) =>
    apiClient.patch(`/events/organizer/events/${eventId}/unpublish`),

  duplicateEvent: (eventId) =>
    apiClient.post(`/events/organizer/events/${eventId}/duplicate`),

  // Attendee management
  getEventAttendees: (eventId, params = {}) =>
    apiClient.get(`/events/organizer/events/${eventId}/attendees`, { params }),

  exportAttendees: (eventId) =>
    apiClient.get(`/events/organizer/events/${eventId}/attendees/export`, {
      responseType: "blob",
    }),

  sendBulkMessage: (eventId, messageData) =>
    apiClient.post(`/events/organizer/events/${eventId}/message`, messageData),
};

// Transaction API calls
export const transactionAPI = {
  // Public route - no auth required
  verifyPayment: (reference) =>
    apiClient.get(`/transactions/verify/${reference}`),

  // Protected routes - require authentication
  initializePayment: (paymentData) =>
    apiClient.post("/transactions/initialize", paymentData),

  getMyTransactions: (params = {}) =>
    apiClient.get("/transactions/my-transactions", { params }),

  getTransaction: (transactionId) =>
    apiClient.get(`/transactions/${transactionId}`),

  // Organizer routes
  getEventTransactions: (eventId, params = {}) =>
    apiClient.get(`/transactions/event/${eventId}`, { params }),

  requestRefund: (transactionId, refundData) =>
    apiClient.post(`/transactions/${transactionId}/refund`, refundData),

  processRefund: (transactionId, refundData) =>
    apiClient.put(`/transactions/${transactionId}/refund/process`, refundData),

  getRevenueStats: (params = {}) =>
    apiClient.get("/transactions/stats/revenue", { params }),
};
//  Wallet API calls
export const walletAPI = {
  // Get wallet balance and overview
  getWalletBalance: () => apiClient.get('/wallet/balance'),

  // Get wallet statistics
  getWalletStats: (params = {}) => 
    apiClient.get('/wallet/stats', { params }),

  // Get transaction history
  getTransactions: (params = {}) => 
    apiClient.get('/wallet/transactions', { params }),

  // Get specific transaction details
  getTransactionById: (transactionId) => 
    apiClient.get(`/wallet/transactions/${transactionId}`),

  // Initiate withdrawal request
  requestWithdrawal: (withdrawalData) => 
    apiClient.post('/wallet/withdraw', withdrawalData),

  // Get withdrawal history
  getWithdrawals: (params = {}) => 
    apiClient.get('/wallet/withdrawals', { params }),

  // Get payment methods
  getPaymentMethods: () => 
    apiClient.get('/wallet/payment-methods'),

  // Add payment method
  addPaymentMethod: (paymentData) => 
    apiClient.post('/wallet/payment-methods', paymentData),

  // Update payment method
  updatePaymentMethod: (methodId, paymentData) => 
    apiClient.patch(`/wallet/payment-methods/${methodId}`, paymentData),

  // Delete payment method
  deletePaymentMethod: (methodId) => 
    apiClient.delete(`/wallet/payment-methods/${methodId}`),

  // Set primary payment method
  setPrimaryPaymentMethod: (methodId) => 
    apiClient.patch(`/wallet/payment-methods/${methodId}/set-primary`),

  // Get wallet address
  getWalletAddress: () => 
    apiClient.get('/wallet/address'),

  // Generate new wallet address
  generateWalletAddress: () => 
    apiClient.post('/wallet/address/generate'),

  // Get earnings by event
  getEventEarnings: (eventId, params = {}) => 
    apiClient.get(`/wallet/earnings/event/${eventId}`, { params }),

  // Get monthly earnings summary
  getMonthlyEarnings: (params = {}) => 
    apiClient.get('/wallet/earnings/monthly', { params }),

  // Get pending payouts
  getPendingPayouts: () => 
    apiClient.get('/wallet/payouts/pending'),

  // Request payout for specific event
  requestEventPayout: (eventId, payoutData) => 
    apiClient.post(`/wallet/payouts/event/${eventId}`, payoutData),

  // Get wallet analytics
  getWalletAnalytics: (params = {}) => 
    apiClient.get('/wallet/analytics', { params }),

  // Export transactions (CSV/PDF)
  exportTransactions: (format = 'csv', params = {}) => 
    apiClient.get(`/wallet/transactions/export/${format}`, {
      params,
      responseType: 'blob'
    }),

  // Get fee structure
  getFeeStructure: () => 
    apiClient.get('/wallet/fees'),

  // Verify bank account
  verifyBankAccount: (bankData) => 
    apiClient.post('/wallet/verify-bank-account', bankData),

  // Get bank list (for adding bank accounts)
  getBankList: () => 
    apiClient.get('/wallet/banks'),

  // Resolve account number (verify account name)
  resolveAccountNumber: (bankCode, accountNumber) => 
    apiClient.post('/wallet/resolve-account', { bankCode, accountNumber })
};
// Superadmin API calls
export const superadminAPI = {
  // User Management
  createSuperadmin: (userData) =>
    apiClient.post("/admin/users/register", userData),

  getAllUsers: (params = {}) => apiClient.get("/admin/users", { params }),

  updateUserRole: (userId, roleData) =>
    apiClient.patch(`/admin/users/${userId}/role`, roleData),

  updateUserStatus: (userId, statusData) =>
    apiClient.patch(`/admin/users/${userId}/status`, statusData),

  suspendUser: (userId, suspendData) =>
    apiClient.patch(`/admin/users/${userId}/suspend`, suspendData),

  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}/delete`),

  // Event Management
  getAllEventsAdmin: (params = {}) =>
    apiClient.get("/admin/events", { params }),

  updateEventAdmin: (eventId, eventData) =>
    apiClient.patch(`/admin/events/${eventId}`, eventData),

  deleteEventAdmin: (eventId) => apiClient.delete(`/admin/events/${eventId}`),

  // Platform Statistics
  getPlatformStats: () => apiClient.get("/admin/stats"),

  getPlatformAnalytics: (params = {}) =>
    apiClient.get("/admin/analytics", { params }),
};

// Utility function for API calls with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("API call failed:", error);

    let errorMessage = "An unexpected error occurred";
    let errorCode = error.response?.status;
    let errorDetails = null;

    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      errorMessage =
        "Request took too long. Please check your connection and try again.";
      errorCode = 408;
    } else if (error.response?.data) {
      // Handle different error response formats
      const errorData = error.response.data;

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (errorData.message) {
        errorMessage = errorData.message;
        errorDetails = errorData.details || errorData.errors;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Specific handling for common error cases
    if (errorCode === 401) {
      errorMessage = "Please log in to access this feature";
    } else if (errorCode === 403) {
      errorMessage = "You don't have permission to perform this action";
    } else if (errorCode === 404) {
      errorMessage = "The requested resource was not found";
    } else if (errorCode === 409) {
      errorMessage = "A conflict occurred while processing your request";
    } else if (errorCode >= 500) {
      errorMessage = "Server error. Please try again later";
    }

    return {
      success: false,
      error: errorMessage,
      status: errorCode,
      details: errorDetails,
    };
  }
};

// Specialized API call for file uploads
export const apiCallWithProgress = (apiFunction, onProgress, ...args) => {
  return new Promise((resolve, reject) => {
    apiFunction(...args, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    })
      .then((response) => resolve({ success: true, data: response.data }))
      .catch((error) => {
        const errorMessage = error.response?.data?.message || error.message;
        reject({ success: false, error: errorMessage });
      });
  });
};

// Helper function to handle API responses consistently
export const handleApiResponse = (result, options = {}) => {
  const { onSuccess, onError, showToast } = options;

  if (result.success) {
    if (onSuccess) onSuccess(result.data);
    if (showToast && options.successMessage) {
      // You can integrate with your toast notification system here
      console.log("Success:", options.successMessage);
    }
    return result.data;
  } else {
    if (onError) onError(result.error);
    if (showToast !== false) {
      // Show error toast
      console.error("Error:", result.error);
    }
    throw new Error(result.error);
  }
};

export default apiClient;
