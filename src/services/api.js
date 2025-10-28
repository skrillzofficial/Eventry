import axios from "axios";

export const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://ecommerce-backend-tb8u.onrender.com/api/v1";

// Create axios instance WITHOUT default Content-Type
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 50000,
  // Don't set default headers - let axios handle Content-Type per request
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // CRITICAL: Let browser set Content-Type for FormData with boundary
    if (config.data instanceof FormData) {
      // Delete any Content-Type header to let browser handle it
      if (config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    } else if (!config.headers['Content-Type']) {
      // Only set JSON Content-Type for non-FormData requests
      config.headers['Content-Type'] = 'application/json';
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        url: config.url,
        method: config.method,
        isFormData: config.data instanceof FormData,
        contentType: config.headers['Content-Type'],
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        success: response.data?.success,
      });
    }
    return response;
  },
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

// ============================================
// AUTH API CALLS
// ============================================
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
};

// ============================================
// USER API CALLS
// ============================================
export const userAPI = {
  // Update user profile (handles both JSON and FormData)
  updateUser: (userData) => apiClient.patch("/profile", userData),

  getUserProfile: () => apiClient.get("/users/profile"),
};

// ============================================
// EVENT API CALLS
// ============================================
export const eventAPI = {
  // ========== PUBLIC ROUTES ==========
  getFeaturedEvents: () => apiClient.get("/events/featured"),
  
  getUpcomingEvents: () => apiClient.get("/events/upcoming"),
  
  getAllEvents: (params = {}) => apiClient.get("/events/all", { params }),
  
  getPastEvents: (params = {}) => apiClient.get("/events/past", { params }),
  
  getEventById: (id) => apiClient.get(`/events/${id}`),

  parseVoiceSearch: (voiceQuery) =>
    apiClient.post("/events/voice-search", { query: voiceQuery }),

  searchEventsAdvanced: (params = {}) =>
    apiClient.get("/events/search/advanced", { params }),

  getTicketAvailability: (eventId) =>
    apiClient.get(`/events/${eventId}/ticket-availability`),

  // ========== PROTECTED ROUTES ==========
  getMyBookings: (params = {}) =>
    apiClient.get("/bookings/my-bookings", { params }),
  
  bookEventTicket: (eventId, bookingData) =>
    apiClient.post(`/events/${eventId}/book`, bookingData),
  
  cancelBooking: (eventId) =>
    apiClient.delete(`/events/${eventId}/cancel-booking`),
  
  toggleLikeEvent: (eventId) => 
    apiClient.post(`/events/${eventId}/like`),

  // ========== ORGANIZER ROUTES ==========
  getOrganizerEvents: (params = {}) =>
    apiClient.get("/events/organizer/my-events", { params }),

  getOrganizerStatistics: () => 
    apiClient.get("/events/organizer/statistics"),

  createEvent: (eventData) =>
    apiClient.post("/events/create", eventData, {
      timeout: 120000,
    }),

  updateEvent: (eventId, eventData) =>
    apiClient.patch(`/events/${eventId}`, eventData, {
      timeout: 120000,
    }),

  deleteEventImage: (eventId, imageIndex) =>
    apiClient.delete(`/events/${eventId}/images/${imageIndex}`),

  cancelEvent: (eventId) => 
    apiClient.patch(`/events/${eventId}/cancel`),

  completeEvent: (eventId) =>
    apiClient.put(`/events/${eventId}/complete`),

  deleteEvent: (eventId) => 
    apiClient.delete(`/events/${eventId}`),

  checkInAttendee: (eventId, ticketId) =>
    apiClient.post(`/events/${eventId}/check-in/${ticketId}`),

  // Live Location Sharing
  startLocationSharing: (eventId, locationData) =>
    apiClient.post(`/events/${eventId}/start-location-sharing`, locationData),

  updateLiveLocation: (eventId, locationData) =>
    apiClient.put(`/events/${eventId}/update-location`, locationData),

  stopLocationSharing: (eventId) =>
    apiClient.post(`/events/${eventId}/stop-location-sharing`),
};

// ============================================
// TICKET API CALLS
// ============================================
export const ticketAPI = {
  // ========== TICKET PURCHASE ==========
  purchaseTicket: (ticketData) =>
    apiClient.post("/purchase", ticketData),
  
  purchaseMultipleTickets: (ticketsData) =>
    apiClient.post("/purchase-multiple", ticketsData),
  
  // ========== USER TICKETS ==========
  getUserTickets: (params = {}) =>
    apiClient.get("/tickets/my-tickets", { params }),
  
  getTicketById: (ticketId) =>
    apiClient.get(`/tickets/${ticketId}`),
  
  // ========== ORGANIZER ROUTES ==========
  getEventTickets: (eventId, params = {}) =>
    apiClient.get(`/tickets/event/${eventId}`, { params }),
  
  getTicketAnalytics: (eventId) =>
    apiClient.get(`/tickets/analytics/event/${eventId}`),
  
  validateTicket: (ticketId, validationData = {}) =>
    apiClient.post(`/tickets/${ticketId}/validate`, validationData),
  
  // ========== TICKET MANAGEMENT ==========
  cancelTicket: (ticketId, cancelData = {}) =>
    apiClient.post(`/tickets/${ticketId}/cancel`, cancelData),
  
  transferTicket: (ticketId, transferData) =>
    apiClient.post(`/tickets/${ticketId}/transfer`, transferData),
  
  // ========== LOCATION TRACKING ==========
  addTicketLocation: (ticketId, locationData) =>
    apiClient.post(`/tickets/${ticketId}/location`, locationData),
  
  getTicketLocationHistory: (ticketId) =>
    apiClient.get(`/tickets/${ticketId}/location-history`),
  
  // ========== TICKET UTILITIES ==========
  downloadTicket: (ticketId) =>
    apiClient.get(`/tickets/${ticketId}/download`, {
      responseType: "blob",
    }),
  
  resendTicketEmail: (ticketId) =>
    apiClient.post(`/tickets/${ticketId}/resend-email`),
};

// ============================================
// ORGANIZER-SPECIFIC API CALLS
// ============================================
export const organizerAPI = {
  getMyEvents: (params = {}) =>
    apiClient.get("/events/organizer/my-events", { params }),

  getEventStats: (eventId) =>
    apiClient.get(`/events/organizer/events/${eventId}/stats`),

  getRevenueAnalytics: (params = {}) =>
    apiClient.get("/events/organizer/analytics/revenue", { params }),

  getAttendanceAnalytics: (params = {}) =>
    apiClient.get("/events/organizer/analytics/attendance", { params }),

  getDashboardStats: () => 
    apiClient.get("/events/organizer/dashboard/stats"),

  publishEvent: (eventId) =>
    apiClient.patch(`/events/organizer/events/${eventId}/publish`),

  unpublishEvent: (eventId) =>
    apiClient.patch(`/events/organizer/events/${eventId}/unpublish`),

  duplicateEvent: (eventId) =>
    apiClient.post(`/events/organizer/events/${eventId}/duplicate`),

  getEventAttendees: (eventId, params = {}) =>
    apiClient.get(`/events/organizer/events/${eventId}/attendees`, { params }),

  exportAttendees: (eventId) =>
    apiClient.get(`/events/organizer/events/${eventId}/attendees/export`, {
      responseType: "blob",
    }),

  sendBulkMessage: (eventId, messageData) =>
    apiClient.post(`/events/organizer/events/${eventId}/message`, messageData),
};

// ============================================
// TRANSACTION API CALLS
// ============================================
export const transactionAPI = {
  verifyPayment: (reference) =>
    apiClient.get(`/transactions/verify/${reference}`),

  initializePayment: (paymentData) =>
    apiClient.post("/transactions/initialize", paymentData),

  getMyTransactions: (params = {}) =>
    apiClient.get("/transactions/my-transactions", { params }),

  getTransaction: (transactionId) =>
    apiClient.get(`/transactions/${transactionId}`),

   initializeServiceFee: (paymentData) =>
    apiClient.post("/transactions/initialize-service-fee", paymentData),

  verifyServiceFee: (reference, verificationData) =>
    apiClient.post(`/transactions/verify-service-fee/${reference}`, verificationData),

  getEventTransactions: (eventId, params = {}) =>
    apiClient.get(`/transactions/event/${eventId}`, { params }),

  requestRefund: (transactionId, refundData) =>
    apiClient.post(`/transactions/${transactionId}/refund`, refundData),

  processRefund: (transactionId, refundData) =>
    apiClient.put(`/transactions/${transactionId}/refund/process`, refundData),

  getRevenueStats: (params = {}) =>
    apiClient.get("/transactions/stats/revenue", { params }),
};

// ============================================
// WALLET API CALLS
// ============================================
export const walletAPI = {
  getWalletBalance: () => 
    apiClient.get("/wallet/balance"),
  
  getWalletStats: (params = {}) => 
    apiClient.get("/wallet/stats", { params }),
  
  getTransactions: (params = {}) =>
    apiClient.get("/wallet/transactions", { params }),
  
  getTransactionById: (transactionId) =>
    apiClient.get(`/wallet/transactions/${transactionId}`),
  
  requestWithdrawal: (withdrawalData) =>
    apiClient.post("/wallet/withdraw", withdrawalData),
  
  getWithdrawals: (params = {}) =>
    apiClient.get("/wallet/withdrawals", { params }),
  
  getPaymentMethods: () => 
    apiClient.get("/wallet/payment-methods"),
  
  addPaymentMethod: (paymentData) =>
    apiClient.post("/wallet/payment-methods", paymentData),
  
  updatePaymentMethod: (methodId, paymentData) =>
    apiClient.patch(`/wallet/payment-methods/${methodId}`, paymentData),
  
  deletePaymentMethod: (methodId) =>
    apiClient.delete(`/wallet/payment-methods/${methodId}`),
  
  setPrimaryPaymentMethod: (methodId) =>
    apiClient.patch(`/wallet/payment-methods/${methodId}/set-primary`),
  
  getEventEarnings: (eventId, params = {}) =>
    apiClient.get(`/wallet/earnings/event/${eventId}`, { params }),
  
  getMonthlyEarnings: (params = {}) =>
    apiClient.get("/wallet/earnings/monthly", { params }),
  
  getPendingPayouts: () => 
    apiClient.get("/wallet/payouts/pending"),
  
  requestEventPayout: (eventId, payoutData) =>
    apiClient.post(`/wallet/payouts/event/${eventId}`, payoutData),
  
  getWalletAnalytics: (params = {}) =>
    apiClient.get("/wallet/analytics", { params }),
  
  exportTransactions: (format = "csv", params = {}) =>
    apiClient.get(`/wallet/transactions/export/${format}`, {
      params,
      responseType: "blob",
    }),
  
  getFeeStructure: () => 
    apiClient.get("/wallet/fees"),
  
  verifyBankAccount: (bankData) =>
    apiClient.post("/wallet/verify-bank-account", bankData),
  
  getBankList: () => 
    apiClient.get("/wallet/banks"),
  
  resolveAccountNumber: (bankCode, accountNumber) =>
    apiClient.post("/wallet/resolve-account", { bankCode, accountNumber }),
};

// ============================================
// SUPERADMIN API CALLS
// ============================================
export const superadminAPI = {
  createSuperadmin: (userData) =>
    apiClient.post("/admin/users/register", userData),
  
  getAllUsers: (params = {}) => 
    apiClient.get("/admin/users", { params }),
  
  updateUserRole: (userId, roleData) =>
    apiClient.patch(`/admin/users/${userId}/role`, roleData),
  
  updateUserStatus: (userId, statusData) =>
    apiClient.patch(`/admin/users/${userId}/status`, statusData),
  
  suspendUser: (userId, suspendData) =>
    apiClient.patch(`/admin/users/${userId}/suspend`, suspendData),
  
  deleteUser: (userId) => 
    apiClient.delete(`/admin/users/${userId}/delete`),
  
  getAllEventsAdmin: (params = {}) =>
    apiClient.get("/admin/events", { params }),
  
  updateEventAdmin: (eventId, eventData) =>
    apiClient.patch(`/admin/events/${eventId}`, eventData),
  
  deleteEventAdmin: (eventId) => 
    apiClient.delete(`/admin/events/${eventId}`),
  
  getPlatformStats: () => 
    apiClient.get("/admin/stats"),
  
  getPlatformAnalytics: (params = {}) =>
    apiClient.get("/admin/analytics", { params }),
};

// ============================================
// VOICE SEARCH API CALLS
// ============================================
export const voiceSearchAPI = {
  parseVoiceQuery: (voiceQuery) =>
    apiClient.post("/voice-search", { query: voiceQuery }),
  
  getVoiceSuggestions: (voiceQuery) =>
    apiClient.get(
      `/voice-search/suggestions?query=${encodeURIComponent(voiceQuery)}`
    ),
  
  getVoiceSearchHistory: () => 
    apiClient.get("/voice-search/history"),
  
  clearVoiceSearchHistory: () => 
    apiClient.delete("/voice-search/history"),
};

// ============================================
// NOTIFICATION API CALLS
// ============================================
export const notificationAPI = {
  getNotifications: (params = {}) =>
    apiClient.get("/notifications", { params }),
  
  getUnreadCount: () => 
    apiClient.get("/notifications/unread-count"),
  
  markAsRead: (notificationId) =>
    apiClient.patch(`/notifications/${notificationId}/read`),
  
  markAllAsRead: () => 
    apiClient.patch("/notifications/read-all"),
  
  deleteNotification: (notificationId) =>
    apiClient.delete(`/notifications/${notificationId}`),
  
  getStats: () => 
    apiClient.get("/notifications/stats"),
};

// ============================================
// UNIFIED API CALL WRAPPER
// ============================================
export const apiCall = async (apiFunction, ...args) => {
  try {
    // Execute the API function with any arguments
    const response = await (typeof apiFunction === 'function' 
      ? apiFunction(...args) 
      : apiFunction);
    
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("❌ API call failed:", error);

    let errorMessage = "An unexpected error occurred";
    let errorCode = error.response?.status;

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please check your connection.";
      errorCode = 408;
    } 
    // Handle network errors
    else if (error.code === "ERR_NETWORK") {
      errorMessage = "Network error. Please check your internet connection.";
      errorCode = 0;
    }
    // Handle response errors
    else if (error.response?.data) {
      errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        errorMessage;
    } 
    // Handle request errors
    else if (error.message) {
      errorMessage = error.message;
    }

    // Map common HTTP status codes to user-friendly messages
    switch (errorCode) {
      case 400:
        // Keep the specific error message from server for validation errors
        break;
      case 401:
        errorMessage = "Please log in to access this feature";
        break;
      case 403:
        errorMessage = "You don't have permission to perform this action";
        break;
      case 404:
        errorMessage = "The requested resource was not found";
        break;
      case 409:
        errorMessage = "A conflict occurred while processing your request";
        break;
      case 413:
        errorMessage = "File size too large. Please use smaller files";
        break;
      case 429:
        errorMessage = "Too many requests. Please try again later";
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = "Server error. Please try again later";
        break;
    }

    return {
      success: false,
      error: errorMessage,
      status: errorCode,
      details: error.response?.data,
    };
  }
};

export default apiClient;