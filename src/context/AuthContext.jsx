import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI, apiCall } from "../services/api";

// Create context with undefined to ensure we can detect missing provider
export const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Computed property for organizer check
  const isOrganizer = user?.role === "organizer";
  const userRole = user?.role || null;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    console.log("🔄 Initializing auth...");
    
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      console.log("❌ No stored credentials found");
      setLoading(false);
      return;
    }

    try {
      // Parse stored user
      const parsedUser = JSON.parse(storedUser);
      console.log("📦 Stored user:", parsedUser);

      // Verify token is still valid by fetching current user
      const result = await apiCall(authAPI.getCurrentUser);
      
      if (result.success && result.data?.user) {
        const freshUser = result.data.user;
        console.log("✅ Token valid, user verified:", freshUser);
        
        setToken(storedToken);
        setUser(freshUser);
        setIsAuthenticated(true);
        
        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(freshUser));
        
        // Clean up any legacy keys
        localStorage.removeItem("userRole");
        localStorage.removeItem("userType");
      } else {
        console.log("❌ Token invalid or expired");
        await clearAuth();
      }
    } catch (error) {
      console.error("❌ Auth initialization error:", error);
      await clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Clear all auth state
  const clearAuth = async () => {
    console.log("🧹 Clearing auth state...");
    
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear all possible auth-related keys
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userType");
  };

  // Set authentication state (internal use)
  const setAuthState = async (userData, authToken) => {
    try {
      console.log("🔐 Setting auth state for:", userData.email, "| Role:", userData.role);
      
      // Normalize user data - ONLY use 'role' field
      const normalizedUser = {
        ...userData,
        role: userData.role || userData.userType || "attendee",
      };
      
      // Remove any userType field to avoid confusion
      delete normalizedUser.userType;

      setUser(normalizedUser);
      setToken(authToken);
      setIsAuthenticated(true);

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      
      // Clean up any legacy keys
      localStorage.removeItem("userRole");
      localStorage.removeItem("userType");

      console.log("✅ Auth state set successfully");
      console.log("👤 User role:", normalizedUser.role);

      return { success: true };
    } catch (error) {
      console.error("❌ Error setting auth state:", error);
      return { success: false, error: error.message };
    }
  };

  // Login with email/password
  const login = async (email, password, userType = "attendee") => {
    try {
      console.log("🔑 Attempting login:", email, "| Type:", userType);

      const result = await apiCall(authAPI.login, email, password, userType);

      if (result.success && result.data) {
        const { user: userData, token: authToken } = result.data;
        
        console.log("✅ Login successful");
        console.log("👤 User data:", userData);
        
        await setAuthState(userData, authToken);
        
        return { 
          success: true, 
          user: userData,
          role: userData.role 
        };
      } else {
        console.log("❌ Login failed:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      console.log("📝 Attempting registration:", userData.email);

      const result = await apiCall(authAPI.register, userData);

      if (result.success) {
        // Check if registration auto-logs in user
        if (result.data?.user && result.data?.token) {
          console.log("✅ Registration successful with auto-login");
          await setAuthState(result.data.user, result.data.token);
          
          return {
            success: true,
            requiresVerification: false,
            data: result.data,
          };
        } else {
          console.log("✅ Registration successful, verification required");
          return {
            success: true,
            requiresVerification: true,
            message: result.data?.message || "Please verify your email",
            data: result.data,
          };
        }
      } else {
        console.log("❌ Registration failed:", result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    console.log("👋 Logging out...");
    
    try {
      if (token) {
        await apiCall(authAPI.logout);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await clearAuth();
      console.log("✅ Logged out successfully");
    }
  };

  // Update user profile locally
  const updateUser = (updates) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    
    // Ensure role is preserved correctly
    if (updates.role) {
      updatedUser.role = updates.role;
    }
    
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    console.log("✅ User updated locally:", updatedUser);
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user data...");
      
      const result = await apiCall(authAPI.getCurrentUser);
      
      if (result.success && result.data?.user) {
        const freshUser = result.data.user;
        
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
        
        console.log("✅ User data refreshed:", freshUser);
        return { success: true, user: freshUser };
      }
      
      console.log("❌ Failed to refresh user:", result.error);
      return { success: false, error: result.error };
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isOrganizer,
    userRole,
    login,
    loginWithCredentials: login,
    setAuthState,
    register,
    logout,
    updateUser,
    refreshUser,
    setUser,
  };

  // Don't render children until initial auth check is complete
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
          <p className="text-gray-600 mt-4 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};