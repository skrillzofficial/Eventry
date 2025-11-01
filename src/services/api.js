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
      if (config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else if (!config.headers["Content-Type"]) {
      // Only set JSON Content-Type for non-FormData requests
      config.headers["Content-Type"] = "application/json";
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === "development") {
      console.log("📤 API Request:", {
        url: config.url,
        method: config.method,
        isFormData: config.data instanceof FormData,
        contentType: config.headers["Content-Type"],
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
    if (process.env.NODE_ENV === "development") {
      console.log("📥 API Response:", {
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
  searchEventsAdvanced: (params = {}) =>
    apiClient.get("/events/search/advanced", { params }),
  getTicketAvailability: (eventId) =>
    apiClient.get(`/events/${eventId}/ticket-availability`),

  // ========== VOICE SEARCH ==========
  parseVoiceSearch: (voiceQuery) =>
    apiClient.post("/events/voice-search", { query: voiceQuery }),
  getVoiceSuggestions: (voiceQuery) =>
    apiClient.get(
      `/events/voice-search/suggestions?query=${encodeURIComponent(voiceQuery)}`
    ),

  // ========== PROTECTED ROUTES ==========
  bookEventTicket: (eventId, bookingData) =>
    apiClient.post(`/events/${eventId}/book`, bookingData),
  toggleLikeEvent: (eventId) => apiClient.post(`/events/${eventId}/like`),

  // ========== ORGANIZER ROUTES ==========
  getOrganizerEvents: (params = {}) =>
    apiClient.get("/events/organizer/my-events", { params }),
  getOrganizerStatistics: () => apiClient.get("/events/organizer/statistics"),
  getEventsNeedingApproval: (params = {}) =>
    apiClient.get("/events/organizer/needing-approval", { params }),
  createEvent: (eventData) =>
    apiClient.post("/events/create", eventData, { timeout: 120000 }),
  updateEvent: (eventId, eventData) =>
    apiClient.patch(`/events/${eventId}`, eventData, { timeout: 120000 }),
  deleteEventImage: (eventId, imageIndex) =>
    apiClient.delete(`/events/${eventId}/images/${imageIndex}`),
  cancelEvent: (eventId) => apiClient.patch(`/events/${eventId}/cancel`),
  completeEvent: (eventId) => apiClient.put(`/events/${eventId}/complete`),
  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`),
  checkInAttendee: (eventId, ticketId, locationData = {}) =>
    apiClient.post(`/events/${eventId}/check-in/${ticketId}`, locationData),

  // ========== APPROVAL ROUTES ==========
  getEventApprovalStats: (eventId) =>
    apiClient.get(`/events/${eventId}/approval-stats`),
  updateApprovalSettings: (eventId, settings) =>
    apiClient.patch(`/events/${eventId}/approval-settings`, settings),

  // ========== BANNER ROUTES ==========
  updateShareableBanner: (eventId, bannerData) =>
    apiClient.patch(`/events/${eventId}/shareable-banner`, bannerData),
  removeShareableBannerTemplate: (eventId) =>
    apiClient.delete(`/events/${eventId}/shareable-banner/template`),
};

// ============================================
// BOOKING API CALLS
// ============================================
export const bookingAPI = {
  getMyBookings: (params = {}) =>
    apiClient.get("/bookings/my-bookings", { params }),
  getBooking: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  initializeBookingPayment: (bookingId) =>
    apiClient.post(`/bookings/${bookingId}/pay`),
  cancelBooking: (bookingId) => apiClient.delete(`/bookings/${bookingId}`),
};

// ============================================
// TICKET API CALLS
// ============================================
export const ticketAPI = {
  // ========== USER TICKETS ==========
  getUserTickets: (params = {}) =>
    apiClient.get("/tickets/my-tickets", { params }),
  getTicketById: (ticketId) => apiClient.get(`/tickets/${ticketId}`),
  downloadTicket: (ticketId) =>
    apiClient.get(`/tickets/${ticketId}/download`, { responseType: "blob" }),
  resendTicketEmail: (ticketId) =>
    apiClient.post(`/tickets/${ticketId}/resend-email`),

  // ========== BANNER ROUTES ==========
  uploadUserPhoto: (ticketId, formData) =>
    apiClient.post(`/tickets/${ticketId}/user-photo`, formData),
  generateShareableBanner: (ticketId) =>
    apiClient.post(`/tickets/${ticketId}/generate-banner`),

  // ========== ORGANIZER ROUTES ==========
  getEventTickets: (eventId, params = {}) =>
    apiClient.get(`/tickets/event/${eventId}`, { params }),
  getTicketAnalytics: (eventId) =>
    apiClient.get(`/tickets/analytics/event/${eventId}`),
  validateTicket: (ticketId, validationData = {}) =>
    apiClient.post(`/tickets/${ticketId}/validate`, validationData),
};

// ============================================
// TRANSACTION API CALLS
// ============================================
export const transactionAPI = {
  // ========== PUBLIC ROUTES ==========
  verifyTransaction: (reference) =>
    apiClient.get(`/transactions/verify/${reference}`),
  verifyServiceFee: (reference) =>
    apiClient.post(`/transactions/verify-service-fee/${reference}`),
  completeDraftEvent: (reference, eventData) =>
    apiClient.post(
      `/transactions/${reference}/complete-draft-event`,
      eventData
    ),

  // ========== USER ROUTES ==========
  initializeTransaction: (paymentData) =>
    apiClient.post("/transactions/initialize", paymentData),
  initializeServiceFee: (paymentData) =>
    apiClient.post("/transactions/initialize-service-fee", paymentData),
  getMyTransactions: (params = {}) =>
    apiClient.get("/transactions/my-transactions", { params }),
  getTransaction: (transactionId) =>
    apiClient.get(`/transactions/${transactionId}`),
  requestRefund: (transactionId, refundData) =>
    apiClient.post(`/transactions/${transactionId}/refund`, refundData),

  // ========== ORGANIZER ROUTES ==========
  getEventTransactions: (eventId, params = {}) =>
    apiClient.get(`/transactions/event/${eventId}`, { params }),
  processRefund: (transactionId, refundData) =>
    apiClient.put(`/transactions/${transactionId}/refund/process`, refundData),
  getRevenueStats: (params = {}) =>
    apiClient.get("/transactions/stats/revenue", { params }),
};

// ============================================
// NOTIFICATION API CALLS
// ============================================
export const notificationAPI = {
  getNotifications: (params = {}) =>
    apiClient.get("/notifications", { params }),
  getUnreadCount: () => apiClient.get("/notifications/unread-count"),
  markAsRead: (notificationId) =>
    apiClient.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
  deleteNotification: (notificationId) =>
    apiClient.delete(`/notifications/${notificationId}`),
};

// ============================================
// SUPERADMIN API CALLS
// ============================================
export const superadminAPI = {
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

// ============================================
// UNIFIED API CALL WRAPPER
// ============================================
export const apiCall = async (apiFunction, ...args) => {
  try {
    // Execute the API function with any arguments
    const response = await (typeof apiFunction === "function"
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
