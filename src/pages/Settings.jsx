import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Globe,
  CreditCard,
  Palette,
  Languages,
  Moon,
  Sun,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  UserX,
  Download,
  Trash2,
  Lock,
  Key,
  Smartphone,
  Database
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
        sms: false,
        eventReminders: true,
        promotional: false,
        newsletter: true
      },
      privacy: {
        profileVisibility: 'public',
        showAttendance: true,
        allowMessages: true,
        dataSharing: false
      },
      security: {
        twoFactor: false,
        loginAlerts: true,
        sessionTimeout: 30
      },
      appearance: {
        theme: 'light',
        density: 'comfortable',
        fontSize: 'medium'
      },
      language: 'en',
      currency: 'NGN'
    };

    const settings = { ...defaultSettings, ...savedSettings };
    
    // Set form values
    Object.keys(settings).forEach(key => {
      if (typeof settings[key] === 'object') {
        Object.keys(settings[key]).forEach(subKey => {
          setValue(`${key}.${subKey}`, settings[key][subKey]);
        });
      } else {
        setValue(key, settings[key]);
      }
    });

    setTheme(settings.appearance.theme);
    setLanguage(settings.language);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(data));
      localStorage.setItem('userTheme', data.appearance.theme);
      localStorage.setItem('userLanguage', data.language);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('userSettings');
      reset();
      loadSettings();
      setSaveStatus('reset');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleExportData = () => {
    const userData = {
      profile: {
        name: localStorage.getItem('userName'),
        email: localStorage.getItem('userEmail'),
        role: localStorage.getItem('userRole')
      },
      events: JSON.parse(localStorage.getItem('userEvents') || '[]'),
      settings: JSON.parse(localStorage.getItem('userSettings') || '{}')
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eventra-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?')) {
      // Simulate account deletion
      alert('Account deletion requested. This feature would typically send a confirmation email in a production environment.');
    }
  };

  const notificationSettings = watch('notifications') || {};

  return (
    <div className="Min-h-screen Homeimg Blend-overlay">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-300">
            Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveStatus === 'success' ? 'bg-green-50 border border-green-200' :
            saveStatus === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`flex items-center ${
              saveStatus === 'success' ? 'text-green-700' :
              saveStatus === 'error' ? 'text-red-700' :
              'text-blue-700'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : saveStatus === 'error' ? (
                <AlertCircle className="h-5 w-5 mr-2" />
              ) : (
                <RotateCcw className="h-5 w-5 mr-2" />
              )}
              {saveStatus === 'success' ? 'Settings saved successfully!' :
               saveStatus === 'error' ? 'Failed to save settings. Please try again.' :
               'Settings reset to default!'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-sm border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } p-6`}>
              <nav className="space-y-2">
                {[
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'privacy', label: 'Privacy', icon: Shield },
                  { id: 'security', label: 'Security', icon: Lock },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'language', label: 'Language & Region', icon: Globe },
                  { id: 'data', label: 'Data Management', icon: Database },
                  { id: 'account', label: 'Account', icon: UserX },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#006F6A] text-white'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={`rounded-xl shadow-sm border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } p-6`}>
                
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notification Preferences
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Communication">
                        <ToggleSetting
                          name="notifications.email"
                          label="Email Notifications"
                          description="Receive updates and announcements via email"
                          icon={Mail}
                          register={register}
                        />
                        <ToggleSetting
                          name="notifications.push"
                          label="Push Notifications"
                          description="Get browser notifications for important updates"
                          icon={Bell}
                          register={register}
                        />
                        <ToggleSetting
                          name="notifications.sms"
                          label="SMS Alerts"
                          description="Receive text messages for critical updates"
                          icon={Phone}
                          register={register}
                        />
                      </SettingSection>

                      <SettingSection title="Event Updates">
                        <ToggleSetting
                          name="notifications.eventReminders"
                          label="Event Reminders"
                          description="Get reminders for upcoming events you're attending"
                          icon={Bell}
                          register={register}
                        />
                        <ToggleSetting
                          name="notifications.promotional"
                          label="Promotional Offers"
                          description="Receive special offers and discounts"
                          icon={MessageSquare}
                          register={register}
                        />
                        <ToggleSetting
                          name="notifications.newsletter"
                          label="Weekly Newsletter"
                          description="Get curated event recommendations"
                          icon={Mail}
                          register={register}
                        />
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Privacy Settings
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Profile Visibility">
                        <SelectSetting
                          name="privacy.profileVisibility"
                          label="Profile Visibility"
                          description="Control who can see your profile"
                          options={[
                            { value: 'public', label: 'Public' },
                            { value: 'friends', label: 'Friends Only' },
                            { value: 'private', label: 'Private' }
                          ]}
                          register={register}
                        />
                        <ToggleSetting
                          name="privacy.showAttendance"
                          label="Show Event Attendance"
                          description="Allow others to see events you're attending"
                          icon={Eye}
                          register={register}
                        />
                        <ToggleSetting
                          name="privacy.allowMessages"
                          label="Allow Direct Messages"
                          description="Let other users send you messages"
                          icon={MessageSquare}
                          register={register}
                        />
                      </SettingSection>

                      <SettingSection title="Data Sharing">
                        <ToggleSetting
                          name="privacy.dataSharing"
                          label="Analytics Sharing"
                          description="Help improve Eventra by sharing anonymous usage data"
                          icon={Database}
                          register={register}
                        />
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Security Settings
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Password">
                        <div className="space-y-4">
                          <PasswordInput
                            label="Current Password"
                            name="currentPassword"
                            showPassword={showCurrentPassword}
                            onToggleVisibility={() => setShowCurrentPassword(!showCurrentPassword)}
                            register={register}
                          />
                          <PasswordInput
                            label="New Password"
                            name="newPassword"
                            showPassword={showNewPassword}
                            onToggleVisibility={() => setShowNewPassword(!showNewPassword)}
                            register={register}
                          />
                        </div>
                      </SettingSection>

                      <SettingSection title="Advanced Security">
                        <ToggleSetting
                          name="security.twoFactor"
                          label="Two-Factor Authentication"
                          description="Add an extra layer of security to your account"
                          icon={Shield}
                          register={register}
                        />
                        <ToggleSetting
                          name="security.loginAlerts"
                          label="Login Alerts"
                          description="Get notified when someone logs into your account"
                          icon={Bell}
                          register={register}
                        />
                        <SelectSetting
                          name="security.sessionTimeout"
                          label="Session Timeout"
                          description="Automatically log out after period of inactivity"
                          options={[
                            { value: 15, label: '15 minutes' },
                            { value: 30, label: '30 minutes' },
                            { value: 60, label: '1 hour' },
                            { value: 1440, label: '24 hours' }
                          ]}
                          register={register}
                        />
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Appearance
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Theme">
                        <div className="grid grid-cols-2 gap-4">
                          <ThemeOption
                            icon={Sun}
                            label="Light"
                            value="light"
                            currentTheme={theme}
                            onClick={() => setTheme('light')}
                          />
                          <ThemeOption
                            icon={Moon}
                            label="Dark"
                            value="dark"
                            currentTheme={theme}
                            onClick={() => setTheme('dark')}
                          />
                        </div>
                        <input type="hidden" {...register('appearance.theme')} value={theme} />
                      </SettingSection>

                      <SettingSection title="Interface">
                        <SelectSetting
                          name="appearance.density"
                          label="Density"
                          description="Control the spacing of interface elements"
                          options={[
                            { value: 'compact', label: 'Compact' },
                            { value: 'comfortable', label: 'Comfortable' },
                            { value: 'spacious', label: 'Spacious' }
                          ]}
                          register={register}
                        />
                        <SelectSetting
                          name="appearance.fontSize"
                          label="Font Size"
                          description="Adjust the text size across the application"
                          options={[
                            { value: 'small', label: 'Small' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'large', label: 'Large' }
                          ]}
                          register={register}
                        />
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Language & Region Tab */}
                {activeTab === 'language' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Language & Region
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Language">
                        <SelectSetting
                          name="language"
                          label="Interface Language"
                          description="Choose your preferred language"
                          options={[
                            { value: 'en', label: 'English' },
                            { value: 'fr', label: 'French' },
                            { value: 'es', label: 'Spanish' },
                            { value: 'pt', label: 'Portuguese' }
                          ]}
                          register={register}
                        />
                      </SettingSection>

                      <SettingSection title="Region">
                        <SelectSetting
                          name="currency"
                          label="Currency"
                          description="Select your preferred currency for payments"
                          options={[
                            { value: 'NGN', label: 'Nigerian Naira (₦)' },
                            { value: 'USD', label: 'US Dollar ($)' },
                            { value: 'EUR', label: 'Euro (€)' },
                            { value: 'GBP', label: 'British Pound (£)' }
                          ]}
                          register={register}
                        />
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Data Management Tab */}
                {activeTab === 'data' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Data Management
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Export Data">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-4">
                            Download a copy of your personal data including profile information, event history, and preferences.
                          </p>
                          <button
                            type="button"
                            onClick={handleExportData}
                            className="flex items-center px-4 py-2 text-sm font-medium text-[#006F6A] hover:text-[#005a55] transition-colors"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export Data
                          </button>
                        </div>
                      </SettingSection>

                      <SettingSection title="Clear Data">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-gray-600 mb-4">
                            Clear your event history and temporary data. This action cannot be undone.
                          </p>
                          <button
                            type="button"
                            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Event History
                          </button>
                        </div>
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <UserX className="w-5 h-5 mr-2" />
                      Account Management
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Danger Zone">
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                          <p className="text-sm text-red-700 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 mt-6 border-t">
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Default
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-6 py-2 bg-[#006F6A] text-white rounded-lg font-medium hover:bg-[#005a55] disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Reusable Components
const SettingSection = ({ title, children }) => (
  <div>
    <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ToggleSetting = ({ name, label, description, icon: Icon, register }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg">
    <div className="flex items-center space-x-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" {...register(name)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006F6A]"></div>
    </label>
  </div>
);

const SelectSetting = ({ name, label, description, options, register }) => (
  <div className="space-y-2">
    <label className="font-medium text-gray-900">{label}</label>
    <p className="text-sm text-gray-600">{description}</p>
    <select
      {...register(name)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A]"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const PasswordInput = ({ label, name, showPassword, onToggleVisibility, register }) => (
  <div>
    <label className="font-medium text-gray-900">{label}</label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        {...register(name)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006F6A] pr-10"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

const ThemeOption = ({ icon: Icon, label, value, currentTheme, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-4 border-2 rounded-lg text-left transition-all ${
      currentTheme === value
        ? 'border-[#006F6A] bg-[#006F6A]/5'
        : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <Icon className="w-6 h-6 mb-2" />
    <p className="font-medium">{label}</p>
  </button>
);

export default Settings;