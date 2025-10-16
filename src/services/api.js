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
    if (error.response?.status === 401) {
      // Token expired or invalid
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
  updateProfile: (userData) => apiClient.put("/profile", userData),
};

// User API calls
export const userAPI = {
  getUserProfile: (userId) => apiClient.get(`/profile/${userId}`),
  updateUser: (userId, userData) => apiClient.put(`/profile/${userId}`, userData),
};

// Event API calls
export const eventAPI = {
  // Public routes
  getFeaturedEvents: () => apiClient.get("/events/featured"),
  getUpcomingEvents: () => apiClient.get("/events/upcoming"),
  getAllEvents: (params = {}) => apiClient.get("/events", { params }),
  getEventById: (id) => apiClient.get(`/events/${id}`),

  // Protected routes (require authentication)
  getMyBookings: (params = {}) => apiClient.get("/events/my-bookings", { params }),
  bookEventTicket: (eventId, bookingData) => 
    apiClient.post(`/events/${eventId}/book`, bookingData),
  cancelBooking: (eventId) => 
    apiClient.delete(`/events/${eventId}/cancel-booking`),
  toggleLikeEvent: (eventId) => 
    apiClient.post(`/events/${eventId}/like`),

  // Organizer-only routes
  getOrganizerEvents: (params = {}) => 
    apiClient.get("/events/organizer/my-events", { params }),
  getOrganizerStatistics: () => 
    apiClient.get("/events/organizer/statistics"),
  createEvent: (eventData) => 
    apiClient.post("/events/create", eventData, {
      timeout: 120000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  updateEvent: (eventId, eventData) => 
    apiClient.patch(`/events/${eventId}`, eventData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  deleteEventImage: (eventId, imageIndex) => 
    apiClient.delete(`/events/${eventId}/images/${imageIndex}`),
  cancelEvent: (eventId) => 
    apiClient.patch(`/events/${eventId}/cancel`),
  deleteEvent: (eventId) => 
    apiClient.delete(`/events/${eventId}`),
};

// Superadmin API calls - NEW SECTION
export const superadminAPI = {
  // User Management
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

  // Platform Statistics
  getPlatformStats: () => 
    apiClient.get("/admin/stats"),
};

// Utility function for API calls with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API call failed:", error);

    let errorMessage = "An unexpected error occurred";

    if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
      errorMessage =
        "Request took too long. Please check your connection and try again.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};

export default apiClient;