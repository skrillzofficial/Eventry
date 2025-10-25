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
};

// User API calls - SIMPLIFIED
export const userAPI = {
  // Single update function for all user profile data including image and phone
  updateUser: (userData) => {
    // If userData is FormData (contains file), use multipart form-data
    if (userData instanceof FormData) {
      return apiClient.patch("/profile", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    // Otherwise use regular JSON
    return apiClient.patch("/profile", userData);
  },

  getUserProfile: () => apiClient.get("/users/profile"),
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

  // Organizer-only routes
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

  getEventAnalytics: (eventId) => apiClient.get(`/events/${eventId}/analytics`),

  updateEventStatus: (eventId, status) =>
    apiClient.patch(`/events/${eventId}/status`, { status }),
};

// Organizer-specific API calls
export const organizerAPI = {
  getMyEvents: (params = {}) =>
    apiClient.get("/events/organizer/my-events", { params }),

  getEventStats: (eventId) =>
    apiClient.get(`/events/organizer/events/${eventId}/stats`),

  getRevenueAnalytics: (params = {}) =>
    apiClient.get("/events/organizer/analytics/revenue", { params }),

  getAttendanceAnalytics: (params = {}) =>
    apiClient.get("/events/organizer/analytics/attendance", { params }),

  getDashboardStats: () => apiClient.get("/events/organizer/dashboard/stats"),

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

// Transaction API calls
export const transactionAPI = {
  verifyPayment: (reference) =>
    apiClient.get(`/transactions/verify/${reference}`),

  initializePayment: (paymentData) =>
    apiClient.post("/transactions/initialize", paymentData),

  getMyTransactions: (params = {}) =>
    apiClient.get("/transactions/my-transactions", { params }),

  getTransaction: (transactionId) =>
    apiClient.get(`/transactions/${transactionId}`),

  getEventTransactions: (eventId, params = {}) =>
    apiClient.get(`/transactions/event/${eventId}`, { params }),

  requestRefund: (transactionId, refundData) =>
    apiClient.post(`/transactions/${transactionId}/refund`, refundData),

  processRefund: (transactionId, refundData) =>
    apiClient.put(`/transactions/${transactionId}/refund/process`, refundData),

  getRevenueStats: (params = {}) =>
    apiClient.get("/transactions/stats/revenue", { params }),
};

// Wallet API calls
export const walletAPI = {
  getWalletBalance: () => apiClient.get("/wallet/balance"),
  getWalletStats: (params = {}) => apiClient.get("/wallet/stats", { params }),
  getTransactions: (params = {}) =>
    apiClient.get("/wallet/transactions", { params }),
  getTransactionById: (transactionId) =>
    apiClient.get(`/wallet/transactions/${transactionId}`),
  requestWithdrawal: (withdrawalData) =>
    apiClient.post("/wallet/withdraw", withdrawalData),
  getWithdrawals: (params = {}) =>
    apiClient.get("/wallet/withdrawals", { params }),
  getPaymentMethods: () => apiClient.get("/wallet/payment-methods"),
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
  getPendingPayouts: () => apiClient.get("/wallet/payouts/pending"),
  requestEventPayout: (eventId, payoutData) =>
    apiClient.post(`/wallet/payouts/event/${eventId}`, payoutData),
  getWalletAnalytics: (params = {}) =>
    apiClient.get("/wallet/analytics", { params }),
  exportTransactions: (format = "csv", params = {}) =>
    apiClient.get(`/wallet/transactions/export/${format}`, {
      params,
      responseType: "blob",
    }),
  getFeeStructure: () => apiClient.get("/wallet/fees"),
  verifyBankAccount: (bankData) =>
    apiClient.post("/wallet/verify-bank-account", bankData),
  getBankList: () => apiClient.get("/wallet/banks"),
  resolveAccountNumber: (bankCode, accountNumber) =>
    apiClient.post("/wallet/resolve-account", { bankCode, accountNumber }),
};

// Superadmin API calls
export const superadminAPI = {
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
  getAllEventsAdmin: (params = {}) =>
    apiClient.get("/admin/events", { params }),
  updateEventAdmin: (eventId, eventData) =>
    apiClient.patch(`/admin/events/${eventId}`, eventData),
  deleteEventAdmin: (eventId) => apiClient.delete(`/admin/events/${eventId}`),
  getPlatformStats: () => apiClient.get("/admin/stats"),
  getPlatformAnalytics: (params = {}) =>
    apiClient.get("/admin/analytics", { params }),
};

// Voice Search API calls
export const voiceSearchAPI = {
  parseVoiceQuery: (voiceQuery) =>
    apiClient.post("/voice-search", { query: voiceQuery }),
  getVoiceSuggestions: (voiceQuery) =>
    apiClient.get(
      `/voice-search/suggestions?query=${encodeURIComponent(voiceQuery)}`
    ),
  getVoiceSearchHistory: () => apiClient.get("/voice-search/history"),
  clearVoiceSearchHistory: () => apiClient.delete("/voice-search/history"),
};

// Notification API calls
export const notificationAPI = {
  getNotifications: (params = {}) =>
    apiClient.get("/notifications", { params }),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
  markAsRead: (notificationId) =>
    apiClient.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
  deleteNotification: (notificationId) =>
    apiClient.delete(`/notifications/${notificationId}`),
  getStats: () => apiClient.get("/notifications/stats"),
};

// SIMPLIFIED API CALL FUNCTION
export const apiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error("API call failed:", error);

    let errorMessage = "An unexpected error occurred";
    let errorCode = error.response?.status;

    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please check your connection.";
      errorCode = 408;
    } else if (error.response?.data) {
      errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Common error codes
    if (errorCode === 401)
      errorMessage = "Please log in to access this feature";
    else if (errorCode === 403)
      errorMessage = "You don't have permission to perform this action";
    else if (errorCode === 404)
      errorMessage = "The requested resource was not found";
    else if (errorCode === 409)
      errorMessage = "A conflict occurred while processing your request";
    else if (errorCode >= 500)
      errorMessage = "Server error. Please try again later";

    return {
      success: false,
      error: errorMessage,
      status: errorCode,
    };
  }
};

export default apiClient;
