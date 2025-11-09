import React, { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, Users, Loader2 } from "lucide-react";

const EventSlider = ({ events = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Auto-rotate slides
  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [events.length, currentIndex, nextSlide]);

  const goToSlide = (index) => {
    if (isAnimating || index === currentIndex) return;

    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

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
      <div className="relative bg-gray-100 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Arrows */}
        {events.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Slides */}
        <div className="relative h-96 md:h-[480px] overflow-hidden">
          {events.map((event, index) => (
            <div
              key={event.id || event._id || index}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentIndex
                  ? "translate-x-0"
                  : index < currentIndex
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              <div className="flex flex-col md:flex-row h-full">
                {/* Event Image */}
                <div className="md:w-1/2 h-48 md:h-full bg-gray-100">
                  <img
                    src={
                      event.image ||
                      event.images?.[0]?.url ||
                      event.images?.[0] ||
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                    }
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
                    }}
                  />
                </div>

                {/* Event Details */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="inline-block bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {event.category || "Past Event"}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {event.title}
                    </h3>

                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-[#FF6B35] mr-3 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-[#FF6B35] mr-3 flex-shrink-0" />
                        <span>
                          {event.venue || event.location || `${event.city}${event.state ? `, ${event.state}` : ''}` || "Location TBA"}
                        </span>
                      </div>

                      {(event.attendees || event.totalAttendees) > 0 && (
                        <div className="hidden md:block">
                          <div className="flex justify-start">
                            <Users className="h-5 w-5 text-[#FF6B35] mr-3 flex-shrink-0" />
                            <span>
                              {(event.attendees || event.totalAttendees).toLocaleString()} attendees
                            </span>
                          </div>
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
                      ? "bg-[#FF6B35] scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  } ${isAnimating ? "cursor-not-allowed" : "cursor-pointer"}`}
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
              width: `${((currentIndex + 1) / events.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventSlider;