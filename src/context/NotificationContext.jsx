import React, { createContext, useContext, useReducer, useEffect } from "react";
import { notificationAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

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
  const { user } = useAuth();

  // Fetch notifications
  const fetchNotifications = async (options = {}) => {
    if (!user) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await notificationAPI.getNotifications(options);

      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: {
          notifications: response.data.notifications,
          total: response.data.total,
          unreadCount: response.data.unreadCount,
        },
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error.response?.data?.message || "Failed to fetch notifications",
      });
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      dispatch({ type: "MARK_AS_READ", payload: notificationId });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      dispatch({ type: "MARK_ALL_AS_READ" });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      dispatch({ type: "DELETE_NOTIFICATION", payload: notificationId });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Fetch unread count every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: { notifications: [], total: 0, unreadCount: 0 },
      });
    }
  }, [user]);

  // Fetch unread count separately
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await notificationAPI.getUnreadCount();
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: {
          notifications: state.notifications,
          total: state.total,
          unreadCount: response.data.count,
        },
      });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
    fetchUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
