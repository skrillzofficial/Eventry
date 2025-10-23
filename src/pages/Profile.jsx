import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MapPin,
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
  Calendar,
  Loader,
  Upload,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { authAPI, eventAPI, apiCall } from "../services/api";

const Profile = () => {
  const {
    user: authUser,
    updateUser,
    refreshUser,
    isAuthenticated,
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    if (isAuthenticated && authUser) {
      loadUserData();
      loadProfileStats();
    }
  }, [isAuthenticated, authUser?._id]);

  const loadUserData = async () => {
    try {
      if (authUser) {
        setValue("firstName", authUser.firstName || authUser.userName || "");
        setValue("email", authUser.email || "");
        setValue("phone", authUser.phone || authUser.phoneNumber || "");
        setValue("bio", authUser.bio || "");
        setValue("location", authUser.location || authUser.city || "");
        setImagePreview(authUser.avatar || null);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileStats = async () => {
    try {
      const userRole = authUser?.role || authUser?.userType || "attendee";

      if (userRole === "organizer") {
        const eventsResult = await apiCall(eventAPI.getOrganizerEvents);

        if (eventsResult.success) {
          const events = eventsResult.data?.events || [];

          const totalAttendees = events.reduce((sum, event) => {
            const count =
              event.totalAttendees ||
              (Array.isArray(event.attendees) ? event.attendees.length : 0);
            return sum + count;
          }, 0);

          const totalRevenue = events.reduce((sum, event) => {
            const attendeeCount =
              event.totalAttendees ||
              (Array.isArray(event.attendees) ? event.attendees.length : 0);
            return sum + attendeeCount * (event.price || 0);
          }, 0);

          const upcomingEvents = events.filter(
            (e) => new Date(e.date) >= new Date() && e.status !== "cancelled"
          ).length;

          setStats({
            eventsHosted: events.length,
            totalAttendees,
            averageRating: 4.8,
            revenue: totalRevenue,
            upcomingEvents,
            ticketsSold: totalAttendees,
          });
        }
      } else {
        const bookingsResult = await apiCall(eventAPI.getMyBookings);

        if (bookingsResult.success) {
          const bookings = bookingsResult.data?.bookings || [];
          const totalTickets = bookings.reduce(
            (sum, booking) => sum + (booking.tickets || booking.quantity || 1),
            0
          );
          const totalSpent = bookings.reduce(
            (sum, booking) =>
              sum + (booking.totalAmount || booking.amount || 0),
            0
          );
          const upcomingEvents = bookings.filter((b) => {
            const eventDate = b.event?.date || b.eventDate;
            return eventDate && new Date(eventDate) >= new Date();
          }).length;

          setStats({
            eventsAttended: bookings.length,
            ticketsPurchased: totalTickets,
            favoriteCategories: ["Technology", "Business", "Music"],
            totalSpent,
            upcomingEvents,
            reviewsWritten: 0,
          });
        } else {
          setStats({
            eventsAttended: 0,
            ticketsPurchased: 0,
            favoriteCategories: [],
            totalSpent: 0,
            upcomingEvents: 0,
            reviewsWritten: 0,
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile stats:", error);
      setStats({
        eventsAttended: 0,
        ticketsPurchased: 0,
        upcomingEvents: 0,
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file");
        return;
      }

      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('avatar', imageFile);

      const result = await apiCall(authAPI.uploadAvatar, formData);
      
      if (result.success) {
        return result.data.avatarUrl;
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      let avatarUrl = imagePreview;

      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const result = await apiCall(authAPI.updateProfile, {
        firstName: data.firstName,
        email: data.email,
        phone: data.phone,
        bio: data.bio,
        location: data.location,
        avatar: avatarUrl,
      });

      if (result.success) {
        updateUser(result.data.user || { ...data, avatar: avatarUrl });
        setUpdateSuccess(true);
        setIsEditing(false);
        setImageFile(null);

        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    reset();
    loadUserData();
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(authUser?.avatar || null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-4">
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
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B35] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const userRole = authUser?.role || authUser?.userType || "attendee";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {updateSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Profile updated successfully!
            </p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            {userRole === "organizer" && (
              <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full border border-orange-200">
                <span className="text-sm font-medium text-orange-700">
                  Organizer
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-[#FF6B35] rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {imagePreview || authUser?.avatar ? (
                      <img
                        src={imagePreview || authUser.avatar}
                        alt={authUser.firstName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">
                        {(authUser?.firstName || authUser?.userName || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer border border-gray-200 transition-all hover:scale-110 hover:border-[#FF6B35]">
                      <Camera className="w-4 h-4 text-[#FF6B35]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {authUser?.firstName || authUser?.userName}
                </h2>
                <p className="text-gray-600 capitalize">{userRole}</p>
              </div>

              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile Information", icon: User },
                  { id: "preferences", label: "Preferences", icon: Bell },
                  { id: "security", label: "Security", icon: Shield },
                  ...(userRole === "organizer"
                    ? [
                        {
                          id: "organizer",
                          label: "Organizer Tools",
                          icon: Award,
                        },
                      ]
                    : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-[#FF6B35] text-white scale-105 shadow-lg"
                        : "text-gray-700 hover:bg-gray-100 hover:scale-102"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Profile Information
                  </h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#FF6B35] transition-all duration-200 hover:scale-105"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-105"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting || uploadingImage}
                        className="flex items-center px-4 py-2 text-sm font-medium bg-[#FF6B35] text-white rounded-lg hover:bg-[#E55A2B] disabled:opacity-50 transition-all duration-200 hover:scale-105"
                      >
                        {isSubmitting || uploadingImage ? (
                          <React.Fragment>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </React.Fragment>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        First Name
                      </label>
                      <input
                        type="text"
                        {...register("firstName", {
                          required: "Name is required",
                        })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Invalid email address",
                          },
                        })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register("phone")}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...register("bio")}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-2 text-[#FF6B35]" />
                        Location
                      </label>
                      <input
                        type="text"
                        {...register("location")}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                        placeholder="Lagos, Nigeria"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Account Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <span className="ml-2 text-gray-900">
                          {authUser?._id?.slice(-8) || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Account Type:</span>
                        <span className="ml-2 text-gray-900 capitalize">
                          {userRole}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Member Since:</span>
                        <span className="ml-2 text-gray-900">
                          {authUser?.createdAt
                            ? new Date(authUser.createdAt).toLocaleDateString(
                                "en-NG",
                                { year: "numeric", month: "long" }
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email Verified:</span>
                        <span className="ml-2 text-gray-900">
                          {authUser?.isVerified ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <PreferenceToggle
                    icon={Bell}
                    label="Event Notifications"
                    description="Get notified about new events in your area"
                    defaultChecked={
                      authUser?.preferences?.notifications ?? true
                    }
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

            {activeTab === "security" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Security Settings
                </h3>
                <div className="space-y-4">
                  <SecurityOption
                    icon={Shield}
                    title="Change Password"
                    description="Update your password regularly to keep your account secure"
                    action="Update Password"
                  />
                  <SecurityOption
                    icon={CreditCard}
                    title={userRole === "organizer" ? "Withdrawal Methods" : "Payment Methods"}
                    description={
                      userRole === "organizer" 
                        ? "Manage your withdrawal methods for receiving payments"
                        : "Manage your saved payment methods"
                    }
                    action="Manage"
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

            {activeTab === "organizer" && userRole === "organizer" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Organizer Tools
                </h3>
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
                    value={`${(
                      stats.totalAttendees || 0
                    ).toLocaleString()} total`}
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
                    value={authUser?.isVerified ? "Verified" : "Pending"}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const PreferenceToggle = ({
  icon: Icon,
  label,
  description,
  defaultChecked,
}) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <Icon className="w-5 h-5 text-[#FF6B35]" />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35] transition-all duration-200"></div>
    </label>
  </div>
);

const SecurityOption = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200">
    <div className="flex items-center space-x-4">
      <Icon className="w-5 h-5 text-[#FF6B35]" />
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <button className="px-4 py-2 text-sm font-medium text-[#FF6B35] hover:text-[#FF8535] transition-all duration-200 hover:scale-105">
      {action}
    </button>
  </div>
);

const OrganizerTool = ({ icon: Icon, title, description, value }) => (
  <div className="p-4 border border-gray-200 rounded-lg hover:border-[#FF6B35] transition-all duration-200 cursor-pointer hover:scale-105">
    <Icon className="w-8 h-8 text-[#FF6B35] mb-3 transition-all duration-200 hover:scale-110" />
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    {value && <p className="text-xs text-[#FF6B35] font-semibold">{value}</p>}
  </div>
);

export default Profile;