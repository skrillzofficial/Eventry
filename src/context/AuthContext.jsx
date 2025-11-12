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
    
    // Listen for storage events (logout in another tab, or 401 errors)
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      
      if (!token && isAuthenticated) {
        clearAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      // Parse stored user
      const parsedUser = JSON.parse(storedUser);

      // Verify token is still valid by fetching current user
      const result = await apiCall(authAPI.getCurrentUser);
      
      // Check for result.user directly (apiCall spreads response.data)
      if (result.success && result.user) {
        const freshUser = result.user;
        
        setToken(storedToken);
        setUser(freshUser);
        setIsAuthenticated(true);
        
        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(freshUser));
        
        // Clean up any legacy keys
        localStorage.removeItem("userRole");
        localStorage.removeItem("userType");
      } else {
        await clearAuth();
      }
    } catch (error) {
      await clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Clear all auth state
  const clearAuth = async () => {
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

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Login with email/password
  const login = async (email, password, userType = "attendee") => {
    try {
      const result = await apiCall(authAPI.login, email, password, userType);

      // Check for result.user and result.token (apiCall spreads response.data)
      if (result.success && result.user && result.token) {
        const userData = result.user;
        const authToken = result.token;
        
        await setAuthState(userData, authToken);
        
        return { 
          success: true, 
          user: userData,
          role: userData.role 
        };
      } else {
        return { success: false, error: result.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const result = await apiCall(authAPI.register, userData);

      if (result.success) {
        // Check for result.user and result.token
        if (result.user && result.token) {
          await setAuthState(result.user, result.token);
          
          return {
            success: true,
            requiresVerification: false,
            user: result.user,
            token: result.token,
          };
        } else {
          return {
            success: true,
            requiresVerification: true,
            message: result.message || "Please verify your email",
          };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (token) {
        await apiCall(authAPI.logout);
      }
    } catch (error) {
      // Silently handle logout API errors
    } finally {
      await clearAuth();
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
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const result = await apiCall(authAPI.getCurrentUser);
      
      // Check for result.user directly
      if (result.success && result.user) {
        const freshUser = result.user;
        
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
        
        return { success: true, user: freshUser };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
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