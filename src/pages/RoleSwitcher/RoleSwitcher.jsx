import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, RefreshCw } from 'lucide-react';
import { authAPI, apiCall } from '../../services/api';

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async () => {
    setSwitching(true);
    
    try {
      const newRole = currentRole === 'attendee' ? 'organizer' : 'attendee';
      
      // Call API using the proper structure
      const response = await apiCall(authAPI.switchRole, newRole);

      if (response.success) {
        // Get the updated user data from response
        const updatedUser = response.data?.user;
        const newToken = response.data?.token;
        
        if (updatedUser && newToken) {
          // Update localStorage with new user data and token
          localStorage.setItem('user', JSON.stringify(updatedUser));
          localStorage.setItem('token', newToken);
          
          // Call parent callback if provided
          if (onRoleChange) {
            onRoleChange(newRole);
          }
          
          // Navigate to appropriate dashboard
          if (newRole === 'organizer') {
            navigate('/dashboard/organizer');
          } else {
            navigate('/dashboard');
          }
          
          // Reload to refresh all data with new token
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        throw new Error(response.error || 'Failed to switch role');
      }
    } catch (error) {
      console.error('Error switching role:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to switch role. Please try again.';
      alert(errorMessage);
    } finally {
      setSwitching(false);
    }
  };

  const isOrganizer = currentRole === 'organizer';

  return (
    <div className="relative">
      <button
        onClick={handleRoleSwitch}
        disabled={switching}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        title={`Switch to ${isOrganizer ? 'Attendee' : 'Organizer'} mode`}
      >
        <div className="relative">
          {switching ? (
            <RefreshCw className="h-5 w-5 text-[#FF6B35] animate-spin" />
          ) : (
            <>
              {isOrganizer ? (
                <User className="h-5 w-5 text-gray-600 group-hover:text-[#FF6B35] transition" />
              ) : (
                <Briefcase className="h-5 w-5 text-gray-600 group-hover:text-[#FF6B35] transition" />
              )}
            </>
          )}
        </div>
        
        <div className="text-left">
          <div className="text-xs text-gray-500 group-hover:text-gray-600">
            Switch to
          </div>
          <div className="text-sm font-semibold text-gray-900 group-hover:text-[#FF6B35] transition">
            {isOrganizer ? 'Attendee Mode' : 'Organizer Mode'}
          </div>
        </div>
      </button>
      
      {/* Role indicator badge */}
      <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-[#FF6B35] text-white text-xs font-medium rounded-full">
        {isOrganizer ? 'Organizer' : 'Attendee'}
      </div>
    </div>
  );
};

export default RoleSwitcher;