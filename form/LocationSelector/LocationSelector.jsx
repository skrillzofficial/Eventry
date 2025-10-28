import React, { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

const LocationSelector = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  disabled = false,
  errors = {},
  register,
}) => {
  const [states, setStates] = useState([]);

  // Fetch states on component mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(
          "http://states-and-cities.com/api/v1/states"
        );
        const data = await response.json();
        setStates(data.data || []);
      } catch (error) {
        console.error("Error fetching states:", error);
        // Fallback to basic states list
        setStates([
          "Abia",
          "Adamawa",
          "Akwa Ibom",
          "Anambra",
          "Bauchi",
          "Bayelsa",
          "Benue",
          "Borno",
          "Cross River",
          "Delta",
          "Ebonyi",
          "Edo",
          "Ekiti",
          "Enugu",
          "FCT (Abuja)",
          "Gombe",
          "Imo",
          "Jigawa",
          "Kaduna",
          "Kano",
          "Katsina",
          "Kebbi",
          "Kogi",
          "Kwara",
          "Lagos",
          "Nasarawa",
          "Niger",
          "Ogun",
          "Ondo",
          "Osun",
          "Oyo",
          "Plateau",
          "Rivers",
          "Sokoto",
          "Taraba",
          "Yobe",
          "Zamfara",
        ]);
      }
    };

    fetchStates();
  }, []);

  const handleStateChange = (state) => {
    onStateChange(state);
    onCityChange(""); // Reset city when state changes
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-[#FF6B35]" />
        <h3 className="text-lg font-semibold text-gray-900">
          Location
          {(!selectedState || !selectedCity) && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              (Required to publish)
            </span>
          )}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
          >
            <option value="">Select your state</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* City Selection - Manual Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City/Town *
          </label>
          <input
            type="text"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
            placeholder="Enter your city or town"
          />
          {errors.city && (
            <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            Enter the specific city or local government area
          </p>
        </div>
      </div>

      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Address *
        </label>
        <input
          type="text"
          {...register("address")}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
          placeholder="Street address, area, landmark"
        />
        {errors.address && (
          <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Venue Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Venue Name *
        </label>
        <input
          type="text"
          {...register("venue")}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:opacity-50"
          placeholder="e.g., International Conference Center"
        />
        {errors.venue && (
          <p className="text-red-600 text-sm mt-1">{errors.venue.message}</p>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;