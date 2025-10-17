import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Camera,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Award,
  Star,
  TrendingUp,
  Ticket,
  Calendar as CalendarIcon,
  Sparkles,
  Loader
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { authAPI, eventAPI, apiCall } from '../services/api';

const Profile = () => {
  const { user: authUser, updateUser, refreshUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm();

  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadUserData();
      loadProfileStats();
    }
  }, [isAuthenticated, authUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Refresh user data from server
      await refreshUser();
      
      // Populate form with current user data
      if (authUser) {
        setValue('name', authUser.name || authUser.fullName || '');
        setValue('email', authUser.email || '');
        setValue('phone', authUser.phone || authUser.phoneNumber || '');
        setValue('bio', authUser.bio || '');
        setValue('location', authUser.location || authUser.city || '');
        setValue('dateOfBirth', authUser.dateOfBirth || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileStats = async () => {
    try {
      const userRole = authUser?.userType || authUser?.role || 'attendee';
      
      if (userRole === 'organizer') {
        // Fetch organizer stats
        const eventsResult = await apiCall(eventAPI.getMyEvents);
        
        if (eventsResult.success) {
          const events = eventsResult.data?.events || [];
          const totalAttendees = events.reduce((sum, event) => 
            sum + (event.ticketsSold || event.attendees || 0), 0
          );
          const totalRevenue = events.reduce((sum, event) => 
            sum + ((event.ticketsSold || 0) * (event.price || 0)), 0
          );
          const upcomingEvents = events.filter(e => 
            new Date(e.date) >= new Date() && e.status !== 'cancelled'
          ).length;
          
          setStats({
            eventsHosted: events.length,
            totalAttendees,
            averageRating: 4.8,
            revenue: totalRevenue,
            upcomingEvents,
            ticketsSold: totalAttendees
          });
        }
      } else {
        // Fetch attendee stats
        const bookingsResult = await apiCall(eventAPI.getMyBookings);
        
        if (bookingsResult.success) {
          const bookings = bookingsResult.data?.bookings || [];
          const totalTickets = bookings.reduce((sum, booking) => 
            sum + (booking.tickets || booking.quantity || 1), 0
          );
          const totalSpent = bookings.reduce((sum, booking) => 
            sum + (booking.totalAmount || booking.amount || 0), 0
          );
          const upcomingEvents = bookings.filter(b => {
            const eventDate = b.event?.date || b.eventDate;
            return eventDate && new Date(eventDate) >= new Date();
          }).length;
          
          setStats({
            eventsAttended: bookings.length,
            ticketsPurchased: totalTickets,
            favoriteCategories: ['Technology', 'Business', 'Music'],
            totalSpent,
            upcomingEvents,
            reviewsWritten: 0
          });
        } else {
          // Set default stats if API fails
          setStats({
            eventsAttended: 0,
            ticketsPurchased: 0,
            favoriteCategories: [],
            totalSpent: 0,
            upcomingEvents: 0,
            reviewsWritten: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile stats:', error);
      // Set default stats on error
      setStats({
        eventsAttended: 0,
        ticketsPurchased: 0,
        upcomingEvents: 0
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      // Call update profile API
      const result = await apiCall(authAPI.updateProfile, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        location: data.location,
        dateOfBirth: data.dateOfBirth
      });
      
      if (result.success) {
        // Update local user state
        updateUser(result.data.user || data);
        setUpdateSuccess(true);
        setIsEditing(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    reset();
    loadUserData();
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to your backend/Cloudinary
      const reader = new FileReader();
      reader.onload = (e) => {
        // For now, just update locally
        updateUser({ avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center glass-morphism">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-300 mb-4">
              Please sign in to view your profile.
            </p>
            <a
              href="/login"
              className="inline-flex items-center bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8535] transition"
            >
              Sign In
            </a>
          </div>
        </div>
        <div className="bg-[#FF6B35]">
          <Footer />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userRole = authUser?.userType || authUser?.role || 'attendee';

  return (
    <div className="min-h-screen Homeimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 backdrop-blur-sm">
            <p className="text-green-200 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Profile updated successfully!
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            {userRole === 'organizer' && (
              <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-sm font-medium text-white">Organizer</span>
              </div>
            )}
          </div>
          <p className="text-gray-300">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-[#FF6B35] rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {authUser?.avatar ? (
                      <img src={authUser.avatar} alt={authUser.name} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <span className="text-3xl">
                        {(authUser?.name || authUser?.fullName || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white/20 backdrop-blur-sm rounded-full p-2 shadow-lg cursor-pointer border border-white/30 transition-all hover:scale-110">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{authUser?.name || authUser?.fullName}</h2>
                <p className="text-gray-300 capitalize">{userRole}</p>
                <p className="text-sm text-gray-400 flex items-center justify-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {authUser?.location || authUser?.city || 'Location not set'}
                </p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Information', icon: User },
                  { id: 'preferences', label: 'Preferences', icon: Bell },
                  { id: 'security', label: 'Security', icon: Shield },
                  ...(userRole === 'organizer' ? [{ id: 'organizer', label: 'Organizer Tools', icon: Award }] : [])
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#FF6B35] text-white scale-105 shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:scale-102'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mt-6 glass-morphism">
              <h3 className="font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                {userRole === 'organizer' ? (
                  <>
                    <StatItem icon={CalendarIcon} label="Events Hosted" value={stats.eventsHosted || 0} />
                    <StatItem icon={User} label="Total Attendees" value={(stats.totalAttendees || 0).toLocaleString()} />
                    <StatItem icon={Star} label="Average Rating" value={stats.averageRating || '0.0'} />
                  </>
                ) : (
                  <>
                    <StatItem icon={Ticket} label="Events Attended" value={stats.eventsAttended || 0} />
                    <StatItem icon={Star} label="Tickets Purchased" value={stats.ticketsPurchased || 0} />
                    <StatItem icon={TrendingUp} label="Upcoming Events" value={stats.upcomingEvents || 0} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Profile Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-[#FF8535] transition-all duration-200 hover:scale-105"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] disabled:opacity-50 transition-all duration-200 hover:scale-105"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <User className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-white/10 disabled:text-gray-400 text-white placeholder-gray-400 transition-all duration-200"
                      />
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-white/10 disabled:text-gray-400 text-white placeholder-gray-400 transition-all duration-200"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-white/10 disabled:text-gray-400 text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        {...register('dateOfBirth')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-white/10 disabled:text-gray-400 text-white placeholder-gray-400 transition-all duration-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register('bio')}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-white/10 disabled:text-gray-400 text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Location
                      </label>
                      <input
                        type="text"
                        {...register('location')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-white/10 disabled:text-gray-400 text-white placeholder-gray-400 transition-all duration-200"
                        placeholder="Lagos, Nigeria"
                      />
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-3">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">User ID:</span>
                        <span className="ml-2 text-white">{authUser?._id?.slice(-8) || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Account Type:</span>
                        <span className="ml-2 text-white capitalize">{userRole}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Member Since:</span>
                        <span className="ml-2 text-white">
                          {authUser?.createdAt 
                            ? new Date(authUser.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' })
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email Verified:</span>
                        <span className="ml-2 text-white">
                          {authUser?.isVerified ? '✓ Yes' : '✗ No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
                <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <PreferenceToggle
                    icon={Bell}
                    label="Event Notifications"
                    description="Get notified about new events in your area"
                    defaultChecked={authUser?.preferences?.notifications ?? true}
                  />
                  <PreferenceToggle
                    icon={Mail}
                    label="Email Newsletter"
                    description="Receive weekly updates and featured events"
                    defaultChecked={authUser?.preferences?.newsletter ?? true}
                  />
                  <PreferenceToggle
                    icon={Phone}
                    label="SMS Alerts"
                    description="Get text message reminders for your events"
                    defaultChecked={authUser?.preferences?.smsAlerts ?? false}
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
                <h3 className="text-lg font-semibold text-white mb-6">Security Settings</h3>
                <div className="space-y-4">
                  <SecurityOption
                    icon={Shield}
                    title="Change Password"
                    description="Update your password regularly to keep your account secure"
                    action="Update Password"
                  />
                  <SecurityOption
                    icon={CreditCard}
                    title="Payment Methods"
                    description="Manage your saved payment methods"
                    action="Manage Payments"
                  />
                  <SecurityOption
                    icon={Globe}
                    title="Login Activity"
                    description="Review recent login attempts and devices"
                    action="View Activity"
                  />
                </div>
              </div>
            )}

            {/* Organizer Tools Tab */}
            {activeTab === 'organizer' && userRole === 'organizer' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
                <h3 className="text-lg font-semibold text-white mb-6">Organizer Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OrganizerTool
                    icon={TrendingUp}
                    title="Event Analytics"
                    description="View detailed analytics for your events"
                    value={`${stats.eventsHosted || 0} events`}
                  />
                  <OrganizerTool
                    icon={User}
                    title="Attendee Management"
                    description="Manage attendee lists and check-ins"
                    value={`${(stats.totalAttendees || 0).toLocaleString()} total`}
                  />
                  <OrganizerTool
                    icon={CreditCard}
                    title="Revenue Reports"
                    description="Track your earnings and payments"
                    value={`₦${(stats.revenue || 0).toLocaleString()}`}
                  />
                  <OrganizerTool
                    icon={Award}
                    title="Organizer Badge"
                    description="Get verified as a professional organizer"
                    value={authUser?.isVerified ? 'Verified' : 'Pending'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-[#FF6B35]">
        <Footer />
      </div>
    </div>
  );
};

// Reusable Components
const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all duration-200">
    <div className="flex items-center">
      <Icon className="w-4 h-4 text-[#FF6B35] mr-2" />
      <span className="text-sm text-gray-300">{label}</span>
    </div>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

const PreferenceToggle = ({ icon: Icon, label, description, defaultChecked }) => (
  <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <Icon className="w-5 h-5 text-[#FF6B35]" />
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35] transition-all duration-200"></div>
    </label>
  </div>
);

const SecurityOption = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <Icon className="w-5 h-5 text-[#FF6B35]" />
      <div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
    </div>
    <button className="px-4 py-2 text-sm font-medium text-[#FF6B35] hover:text-[#FF8535] transition-all duration-200 hover:scale-105">
      {action}
    </button>
  </div>
);

const OrganizerTool = ({ icon: Icon, title, description, value }) => (
  <div className="p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 cursor-pointer hover:scale-105">
    <Icon className="w-8 h-8 text-[#FF6B35] mb-3 transition-all duration-200 hover:scale-110" />
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-300 mb-2">{description}</p>
    {value && (
      <p className="text-xs text-[#FF6B35] font-semibold">{value}</p>
    )}
  </div>
);

export default Profile;