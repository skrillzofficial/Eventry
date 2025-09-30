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
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset
  } = useForm();

  useEffect(() => {
    loadUserData();
    loadProfileStats();
  }, []);

  const loadUserData = () => {
    // Get user data from localStorage/auth context
    const userData = {
      id: 'user_123',
      name: localStorage.getItem('userName') || 'John Doe',
      email: localStorage.getItem('userEmail') || 'john.doe@example.com',
      phone: '+234 812 345 6789',
      role: localStorage.getItem('userRole') || 'attendee',
      joinDate: '2024-01-15',
      avatar: null,
      bio: 'Event enthusiast passionate about technology and networking events across Nigeria.',
      location: 'Lagos, Nigeria',
      dateOfBirth: '1990-05-15',
      preferences: {
        notifications: true,
        newsletter: true,
        smsAlerts: false
      },
      socialLinks: {
        twitter: '@johndoe',
        linkedin: 'john-doe',
        website: 'johndoe.com'
      }
    };
    setUser(userData);
    // Populate form with current data
    Object.keys(userData).forEach(key => {
      if (typeof userData[key] !== 'object') {
        setValue(key, userData[key]);
      }
    });
  };

  const loadProfileStats = () => {
    const userRole = localStorage.getItem('userRole') || 'attendee';
    
    if (userRole === 'organizer') {
      setStats({
        eventsHosted: 12,
        totalAttendees: 2847,
        averageRating: 4.8,
        revenue: 125600,
        upcomingEvents: 3,
        ticketsSold: 1245
      });
    } else {
      setStats({
        eventsAttended: 24,
        ticketsPurchased: 32,
        favoriteCategories: ['Technology', 'Business', 'Music'],
        totalSpent: 85600,
        upcomingEvents: 5,
        reviewsWritten: 8
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user data
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userEmail', data.email);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    reset();
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUser(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen Homeimg Blend-overlay flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen Homeimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Sparkles Badge */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <div className="flex items-center gap-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-white">Premium</span>
            </div>
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
                  <div className="w-24 h-24 bg-[#FF6B35] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <User className="w-12 h-12" />
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
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-300 capitalize">{user.role}</p>
                <p className="text-sm text-gray-400 flex items-center justify-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.location}
                </p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Information', icon: User },
                  { id: 'preferences', label: 'Preferences', icon: Bell },
                  { id: 'security', label: 'Security', icon: Shield },
                  ...(user.role === 'organizer' ? [{ id: 'organizer', label: 'Organizer Tools', icon: Award }] : [])
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
                {user.role === 'organizer' ? (
                  <>
                    <StatItem icon={CalendarIcon} label="Events Hosted" value={stats.eventsHosted} />
                    <StatItem icon={User} label="Total Attendees" value={stats.totalAttendees?.toLocaleString()} />
                    <StatItem icon={Star} label="Average Rating" value={stats.averageRating} />
                  </>
                ) : (
                  <>
                    <StatItem icon={Ticket} label="Events Attended" value={stats.eventsAttended} />
                    <StatItem icon={Star} label="Reviews Written" value={stats.reviewsWritten} />
                    <StatItem icon={TrendingUp} label="Upcoming Events" value={stats.upcomingEvents} />
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
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
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
                        placeholder="Your city and country"
                      />
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
                    defaultChecked={user.preferences?.notifications}
                  />
                  <PreferenceToggle
                    icon={Mail}
                    label="Email Newsletter"
                    description="Receive weekly updates and featured events"
                    defaultChecked={user.preferences?.newsletter}
                  />
                  <PreferenceToggle
                    icon={Phone}
                    label="SMS Alerts"
                    description="Get text message reminders for your events"
                    defaultChecked={user.preferences?.smsAlerts}
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
            {activeTab === 'organizer' && user.role === 'organizer' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 glass-morphism">
                <h3 className="text-lg font-semibold text-white mb-6">Organizer Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <OrganizerTool
                    icon={TrendingUp}
                    title="Event Analytics"
                    description="View detailed analytics for your events"
                  />
                  <OrganizerTool
                    icon={User}
                    title="Attendee Management"
                    description="Manage attendee lists and check-ins"
                  />
                  <OrganizerTool
                    icon={CreditCard}
                    title="Revenue Reports"
                    description="Track your earnings and payments"
                  />
                  <OrganizerTool
                    icon={Award}
                    title="Organizer Badge"
                    description="Get verified as a professional organizer"
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

const ActivityItem = ({ activity }) => (
  <div className="flex items-center space-x-4 p-3 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 hover:scale-102">
    <div className="w-10 h-10 bg-[#FF6B35]/20 rounded-full flex items-center justify-center">
      <Ticket className="w-5 h-5 text-[#FF6B35]" />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-white">{activity.title}</h4>
      <p className="text-sm text-gray-300">{activity.description}</p>
      <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
    </div>
    {activity.amount && (
      <span className="font-semibold text-[#FF6B35]">₦{activity.amount.toLocaleString()}</span>
    )}
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

const OrganizerTool = ({ icon: Icon, title, description }) => (
  <div className="p-4 border border-white/20 rounded-lg hover:border-[#FF6B35] transition-all duration-200 cursor-pointer hover:scale-105">
    <Icon className="w-8 h-8 text-[#FF6B35] mb-3 transition-all duration-200 hover:scale-110" />
    <h4 className="font-semibold text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-300">{description}</p>
  </div>
);

export default Profile;