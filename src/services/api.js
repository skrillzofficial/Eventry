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

// Auth API calls with custom timeouts for specific operations
export const authAPI = {
  login: (email, password, userType = "attendee") =>
    apiClient.post("/login", {
      email,
      password,
      userType,
    }),

  // ✅ Registration with extended timeout for email sending
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

  updateUser: (userId, userData) =>
    apiClient.put(`/profile/${userId}`, userData),
};

// Utility function for API calls with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("API call failed:", error);

    let errorMessage = "An unexpected error occurred";

    // Handle timeout errors specifically
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
