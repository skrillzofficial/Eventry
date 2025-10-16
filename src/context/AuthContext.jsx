import React, { createContext, useState, useEffect, useContext } from "react";
import { authAPI, apiCall } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

   const isOrganizer = user?.userType === "organizer" || user?.role === "organizer";

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const result = await apiCall(authAPI.getCurrentUser);
          if (result.success) {
            setToken(storedToken);
            setUser(result.data.user);
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(result.data.user));
          } else {
            // Token is invalid
            console.log("Token invalid during initialization");
            await performLogout();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          await performLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Perform actual logout 
  const performLogout = async () => {
    try {
      if (token) {
        await apiCall(authAPI.logout);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // Internal login function 
  const setLoginState = async (userData, authToken) => {
    try {
      console.log("Setting login state for user:", userData);
      const userWithType = {
        ...userData,
        userType: userData.userType || userData.role,
      };

      setUser(userWithType);
      setToken(authToken);
      setIsAuthenticated(true);

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userWithType));

      return { success: true };
    } catch (error) {
      console.error("Login context error:", error);
      return { success: false, error: error.message };
    }
  };

  // Login with credentials 
  const login = async (email, password, userType = "attendee") => {
    try {
      console.log("Attempting login with:", { email, userType });

      const result = await apiCall(authAPI.login, email, password, userType);

      if (result.success) {
        const { user: userData, token: authToken } = result.data;
        return await setLoginState(userData, authToken);
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const result = await apiCall(authAPI.register, userData);

      if (result.success) {
        // Check if registration returns user and token (auto-login)
        if (result.data.user && result.data.token) {
          const { user: registeredUser, token: authToken } = result.data;
          await setLoginState(registeredUser, authToken);
          return {
            success: true,
            requiresVerification: false,
            data: result.data,
          };
        } else {
          // Registration successful but requires email verification
          return {
            success: true,
            requiresVerification: true,
            message: result.data.message || result.message,
            data: result.data,
          };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    await performLogout();
  };

  // Update user profile
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const result = await apiCall(authAPI.getCurrentUser);
      if (result.success) {
        setUser(result.data.user);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        return { success: true };
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
    login,
    loginWithCredentials: login, 
    setAuthState: setLoginState, 
    register,
    logout,
    updateUser,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
