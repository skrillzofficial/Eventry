import axios from "axios";

export const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "https://ecommerce-backend-tb8u.onrender.com/api/v1";

// Create axios instance 
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 50000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Content-Type for FormData with boundary
    if (config.data instanceof FormData) {
      if (config.headers["Content-Type"]) {
        delete config.headers["Content-Type"];
      }
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle ALL 401 errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle ALL 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear ALL auth-related data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userType");
      
      // Dispatch storage event to notify AuthContext across tabs
      window.dispatchEvent(new Event("storage"));
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper to build FormData for event creation/update
 * @param {Object} eventData - Event data object
 * @param {File[]} imageFiles - Array of image files
 * @param {File|null} socialBannerFile - Optional social banner file
 * @returns {FormData}
 */
const buildEventFormData = (eventData, imageFiles = [], socialBannerFile = null) => {
  const formData = new FormData();

  // Add all text/JSON fields
  Object.keys(eventData).forEach(key => {
    const value = eventData[key];
    
    // Skip null/undefined values
    if (value === null || value === undefined) {
      return;
    }
    
    // Handle different data types
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Stringify objects (like agreement, communityData)
      formData.append(key, JSON.stringify(value));
    } else if (Array.isArray(value)) {
      // Stringify arrays (like ticketTypes, tags, requirements)
      formData.append(key, JSON.stringify(value));
    } else {
      // Add primitive values directly
      formData.append(key, String(value));
    }
  });

  // Add image files - CRITICAL FOR BACKEND
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file); 
      }
    });
  }

  // Add social banner if exists
  if (socialBannerFile instanceof File) {
    formData.append('socialBanner', socialBannerFile);
  }

  // ENSURE TERMS ARE INCLUDED FOR ALL EVENTS
  if (!eventData.agreement || !eventData.agreement.acceptedTerms) {
    const defaultAgreement = {
      acceptedTerms: true,
      acceptedAt: new Date().toISOString(),
      serviceFee: { type: "percentage", amount: 5 },
      paymentTerms: "upfront",
      agreementVersion: "1.0"
    };
    formData.append('agreement', JSON.stringify(defaultAgreement));
  }

  // Ensure termsAccepted flag is set
  if (!eventData.termsAccepted) {
    formData.append('termsAccepted', 'true');
  }

  // Ensure status is set 
  if (!eventData.status) {
    formData.append('status', 'draft');
  }

  return formData;
};

// AUTH API CALLS
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


// USER API CALLS
export const userAPI = {
  updateUser: (userData) => apiClient.patch("/profile", userData),
  getUserProfile: () => apiClient.get("/users/profile"),
};


// EVENT API CALLS
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

  // Create event with proper FormData handling
  createEvent: (eventData, imageFiles = [], socialBannerFile = null) => {
    const formData = buildEventFormData(eventData, imageFiles, socialBannerFile);
    
    // Axios will automatically set Content-Type with boundary for FormData
    return apiClient.post("/events", formData, { 
      timeout: 120000,
    });
  },

  // Update event with proper FormData handling
  updateEvent: (eventId, eventData, imageFiles = [], socialBannerFile = null) => {
    const formData = buildEventFormData(eventData, imageFiles, socialBannerFile);
    
    return apiClient.patch(`/events/${eventId}`, formData, { 
      timeout: 120000,
    });
  },

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


// BOOKING API CALLS
export const bookingAPI = {
  getMyBookings: (params = {}) =>
    apiClient.get("/bookings/my-bookings", { params }),
  getBooking: (bookingId) => apiClient.get(`/bookings/${bookingId}`),
  initializeBookingPayment: (bookingId) =>
    apiClient.post(`/bookings/${bookingId}/pay`),
  cancelBooking: (bookingId) => apiClient.delete(`/bookings/${bookingId}`),
};


// TICKET API CALLS
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


// TRANSACTION API CALLS
export const transactionAPI = {
  // ========== PUBLIC ROUTES ==========
  verifyTransaction: (reference) =>
    apiClient.get(`/transactions/verify/${reference}`),

  // ========== USER ROUTES ==========
  initializeTransaction: (paymentData) =>
    apiClient.post("/transactions/initialize", paymentData),
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


// NOTIFICATION API CALLS
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


// SUPERADMIN API CALLS
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


// SIMPLIFIED API CALL WRAPPER
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await (typeof apiFunction === "function"
      ? apiFunction(...args)
      : apiFunction);

    // Return the data directly without nesting
    return {
      success: true,
      ...response.data, // Spread response data at top level
      status: response.status,
    };
  } catch (error) {
    let errorMessage = "An unexpected error occurred";
    let errorCode = error.response?.status;

    // Handle specific error types
    if (error.code === "ECONNABORTED") {
      errorMessage = "Request timeout. Please check your connection.";
      errorCode = 408;
    } else if (error.code === "ERR_NETWORK") {
      errorMessage = "Network error. Please check your internet connection.";
      errorCode = 0;
    } else if (error.response?.data) {
      errorMessage =
        error.response.data.message ||
        error.response.data.error ||
        errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: errorCode,
    };
  }
};

export default apiClient;