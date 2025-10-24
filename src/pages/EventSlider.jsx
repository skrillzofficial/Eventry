import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { eventAPI } from '../services/api';

const EventSlider = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch past events from backend
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch past events
        const response = await eventAPI.getPastEvents({ limit: 10 });
        
        console.log('Full API Response:', response);
        console.log('Response structure:', {
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          dataType: typeof response.data
        });
        
        // Try different possible response structures
        let allEvents = [];
        if (response.data?.data) {
          allEvents = response.data.data;
        } else if (response.data?.events) {
          allEvents = response.data.events;
        } else if (Array.isArray(response.data)) {
          allEvents = response.data;
        }
        
        console.log('Past events extracted:', allEvents);
        console.log('Events count:', allEvents.length);
        
        if (Array.isArray(allEvents) && allEvents.length > 0) {
          setEvents(allEvents);
        }
      } catch (err) {
        console.error('Error fetching past events:', err);
        console.error('Error details:', err.response || err.message);
        setError('Failed to load past events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length, currentIndex]);

  const nextSlide = useCallback(() => {
    if (isAnimating || events.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  }, [events.length, isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating || events.length <= 1) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
    
    setTimeout(() => setIsAnimating(false), 500);
  }, [events.length, isAnimating]);

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;
    
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 text-[#FF6B35] animate-spin" />
            <p className="text-gray-600 text-lg">Loading past events...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No events state
  if (events.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No past events to display</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Slider Container */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Arrows */}
        {events.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Slides */}
        <div className="relative h-96 md:h-[480px] overflow-hidden">
          {events.map((event, index) => (
            <div
              key={event._id || event.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentIndex
                  ? 'translate-x-0'
                  : index < currentIndex
                  ? '-translate-x-full'
                  : 'translate-x-full'
              }`}
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Event Image */}
                <div className="md:w-1/2 h-48 md:h-full bg-gray-100">
                  <img
                    src={event.images?.[0]?.url || event.images?.[0] || event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
                    }}
                  />
                </div>

                {/* Event Details */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="inline-block bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {event.category || 'Past Event'}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-[#FF6B35] mr-3 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-[#FF6B35] mr-3 flex-shrink-0" />
                        <span>{event.venue || event.location || 'Location TBA'}</span>
                      </div>
                      
                      {event.totalAttendees > 0 && (
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-[#FF6B35] mr-3 flex-shrink-0" />
                          <span>{event.totalAttendees.toLocaleString()} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        {events.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex space-x-2">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isAnimating}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[#FF6B35] scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {events.length > 1 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-[#FF6B35] h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${((currentIndex + 1) / events.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventSlider;