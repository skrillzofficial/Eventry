import React, { createContext, useContext, useReducer, useEffect } from "react";
import { notificationAPI, apiCall } from "../services/api";
import { useAuth } from "./AuthContext";

// Create context with undefined to detect missing provider
const NotificationContext = createContext(undefined);

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload.notifications,
        total: action.payload.total,
        unreadCount: action.payload.unreadCount,
        loading: false,
      };

    case "ADD_NOTIFICATION":
      const newNotification = action.payload;
      const exists = state.notifications.find(
        (n) => n._id === newNotification._id
      );

      if (!exists) {
        return {
          ...state,
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
          total: state.total + 1,
        };
      }
      return state;

    case "MARK_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case "MARK_ALL_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      };

    case "DELETE_NOTIFICATION":
      const deletedNotification = state.notifications.find(
        (n) => n._id === action.payload
      );
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n._id !== action.payload
        ),
        unreadCount:
          deletedNotification && !deletedNotification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        total: Math.max(0, state.total - 1),
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "UPDATE_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: action.payload,
      };

    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  error: null,
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  // Get auth context - this should now work properly
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Fetch notifications using the unified apiCall wrapper
  const fetchNotifications = React.useCallback(async (options = {}) => {
    if (!user || !isAuthenticated) {
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      
      const result = await apiCall(notificationAPI.getNotifications, options);

      if (result.success) {
        const data = result.data;
        dispatch({
          type: "SET_NOTIFICATIONS",
          payload: {
            notifications: data.notifications || data.data?.notifications || [],
            total: data.total || data.pagination?.total || 0,
            unreadCount: data.unreadCount || data.stats?.unread || 0,
          },
        });
      } else {
        dispatch({
          type: "SET_ERROR",
          payload: result.error || "Failed to fetch notifications",
        });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Failed to fetch notifications",
      });
    }
  }, [user, isAuthenticated]);

  // Mark notification as read
  const markAsRead = React.useCallback(async (notificationId) => {
    if (!user || !isAuthenticated) return;

    try {
      const result = await apiCall(notificationAPI.markAsRead, notificationId);
      
      if (result.success) {
        dispatch({ type: "MARK_AS_READ", payload: notificationId });
      } else {
        throw new Error(result.error || 'Failed to mark as read');
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }, [user, isAuthenticated]);

  // Mark all as read
  const markAllAsRead = React.useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      const result = await apiCall(notificationAPI.markAllAsRead);
      
      if (result.success) {
        dispatch({ type: "MARK_ALL_AS_READ" });
      } else {
        throw new Error(result.error || 'Failed to mark all as read');
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }, [user, isAuthenticated]);

  // Delete notification
  const deleteNotification = React.useCallback(async (notificationId) => {
    if (!user || !isAuthenticated) return;

    try {
      const result = await apiCall(notificationAPI.deleteNotification, notificationId);
      
      if (result.success) {
        dispatch({ type: "DELETE_NOTIFICATION", payload: notificationId });
      } else {
        throw new Error(result.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  }, [user, isAuthenticated]);

  // Clear error
  const clearError = React.useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Fetch unread count separately
  const fetchUnreadCount = React.useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      const result = await apiCall(notificationAPI.getUnreadCount);
      
      if (result.success) {
        const count = result.data?.count || result.data?.unreadCount || 0;
        dispatch({
          type: "UPDATE_UNREAD_COUNT",
          payload: count,
        });
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [user, isAuthenticated]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) {
      return;
    }

    if (user && isAuthenticated) {
      fetchNotifications();
      
      // Fetch unread count every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      // Clear notifications when user logs out
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: { notifications: [], total: 0, unreadCount: 0 },
      });
    }
  }, [user, isAuthenticated, authLoading, fetchNotifications, fetchUnreadCount]);

  const value = React.useMemo(() => ({
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
    fetchUnreadCount,
  }), [state, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, clearError, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationContext;