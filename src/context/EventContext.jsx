import React, { createContext, useState, useContext, useCallback } from "react";
import { eventAPI, apiCall } from "../services/api";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear errors
  const clearError = () => setError(null);

  // Fetch all events
  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    clearError();

    const result = await apiCall(eventAPI.getAllEvents, params);

    if (result.success) {
      setEvents(result.data.events || result.data);
      return { success: true, data: result.data };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }

    setLoading(false);
  }, []);

  // Fetch featured events
  const fetchFeaturedEvents = useCallback(async () => {
    const result = await apiCall(eventAPI.getFeaturedEvents);

    if (result.success) {
      setFeaturedEvents(result.data.events || result.data);
    } else {
      setError(result.error);
    }

    return result;
  }, []);

  // Create event
  const createEvent = useCallback(async (eventData) => {
    setLoading(true);
    clearError();

    const result = await apiCall(eventAPI.createEvent, eventData);

    if (result.success) {
      // Add the new event to local state
      setEvents((prev) => [result.data.event, ...prev]);
      // Also add to organizer events if user is organizer
      setOrganizerEvents((prev) => [result.data.event, ...prev]);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, []);

  // Book event ticket
  const bookEventTicket = useCallback(async (eventId, bookingData) => {
    const result = await apiCall(
      eventAPI.bookEventTicket,
      eventId,
      bookingData
    );

    if (result.success) {
      // Update events list to reflect booking count
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId
            ? {
                ...event,
                booked: true,
                ticketsSold: (event.ticketsSold || 0) + 1,
              }
            : event
        )
      );
    }

    return result;
  }, []);

  // Fetch user's bookings
  const fetchMyBookings = useCallback(async (params = {}) => {
    const result = await apiCall(eventAPI.getMyBookings, params);

    if (result.success) {
      setMyBookings(result.data.bookings || result.data);
    }

    return result;
  }, []);

  // Fetch organizer events
  const fetchOrganizerEvents = useCallback(async (params = {}) => {
    const result = await apiCall(eventAPI.getOrganizerEvents, params);

    if (result.success) {
      setOrganizerEvents(result.data.events || result.data);
    }

    return result;
  }, []);

  // Toggle like
  const toggleLike = useCallback(async (eventId) => {
    const result = await apiCall(eventAPI.toggleLikeEvent, eventId);

    if (result.success) {
      // Update events with new like status
      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId
            ? {
                ...event,
                isLiked: result.data.isLiked,
                likesCount: result.data.likesCount,
              }
            : event
        )
      );
    }

    return result;
  }, []);

  // Get single event by ID
  const getEventById = useCallback(async (eventId) => {
    const result = await apiCall(eventAPI.getEventById, eventId);
    return result;
  }, []);

  // Update event
  const updateEvent = useCallback(async (eventId, eventData) => {
    const result = await apiCall(eventAPI.updateEvent, eventId, eventData);

    if (result.success) {
      // Update local state
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? result.data.event : event))
      );
      setOrganizerEvents((prev) =>
        prev.map((event) => (event._id === eventId ? result.data.event : event))
      );
    }

    return result;
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    const result = await apiCall(eventAPI.deleteEvent, eventId);

    if (result.success) {
      // Remove from local state
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setOrganizerEvents((prev) =>
        prev.filter((event) => event._id !== eventId)
      );
    }

    return result;
  }, []);

  const value = {
    // State
    events,
    featuredEvents,
    myBookings,
    organizerEvents,
    loading,
    error,

    // Actions
    fetchEvents,
    fetchFeaturedEvents,
    createEvent,
    bookEventTicket,
    fetchMyBookings,
    fetchOrganizerEvents,
    toggleLike,
    getEventById,
    updateEvent,
    deleteEvent,
    clearError,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
