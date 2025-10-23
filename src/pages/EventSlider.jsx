import React, { useState, useEffect, useCallback } from 'react';
import {  Calendar, MapPin, Users } from 'lucide-react';

const EventSlider = ({ events = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Sample events data structure if none provided
  const defaultEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      date: "2024-03-15",
      location: "Lagos, Nigeria",
      attendees: 1200,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      category: "Technology"
    },
    {
      id: 2,
      title: "African Music Festival",
      date: "2024-02-20",
      location: "Accra, Ghana",
      attendees: 8500,
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
      category: "Music"
    },
    {
      id: 3,
      title: "Startup Funding Workshop",
      date: "2024-01-10",
      location: "Nairobi, Kenya",
      attendees: 300,
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
      category: "Business"
    },
    {
      id: 4,
      title: "Art & Culture Exhibition",
      date: "2024-04-05",
      location: "Cape Town, South Africa",
      attendees: 2200,
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800",
      category: "Art"
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  if (displayEvents.length === 0) {
    return (
      <div className="w-full bg-gray-100 rounded-2xl p-12 text-center">
        <p className="text-gray-600 text-lg">No past events to display</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Slider Container */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Arrows */}
        {displayEvents.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className=""
            >
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className=""
            >
            </button>
          </>
        )}

        {/* Slides */}
        <div className="relative h-96 md:h-[480px] overflow-hidden">
          {displayEvents.map((event, index) => (
            <div
              key={event.id}
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
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Event Details */}
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <span className="inline-block bg-[#FF6B35] text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {event.category}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-[#FF6B35] mr-3" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-[#FF6B35] mr-3" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-[#FF6B35] mr-3" />
                        <span>{event.attendees.toLocaleString()} attendees</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors">
                      View Event Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        {displayEvents.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex space-x-2">
              {displayEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isAnimating}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-[#FF6B35] scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  } ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {displayEvents.length > 1 && (
        <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-[#FF6B35] h-1 rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${((currentIndex + 1) / displayEvents.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventSlider;