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
  Database,
  Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('security');
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
    link.download = `eventry-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?')) {
      // Simulate account deletion
      alert('Account deletion requested. This feature would typically send a confirmation email in a production environment.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Account Settings
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Settings & <span className="text-[#FF6B35]">Preferences</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
            saveStatus === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <p className={`flex items-center`}>
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
              <nav className="space-y-2">
                {[
                  { id: 'security', label: 'Security', icon: Lock },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'language', label: 'Language & Region', icon: Globe },
                  { id: 'data', label: 'Data Management', icon: Database },
                  { id: 'account', label: 'Account', icon: UserX },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all group ${
                      activeTab === tab.id
                        ? 'bg-[#FF6B35] text-white transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all">
                
                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-[#FF6B35]" />
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Palette className="w-5 h-5 mr-2 text-[#FF6B35]" />
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-[#FF6B35]" />
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Database className="w-5 h-5 mr-2 text-[#FF6B35]" />
                      Data Management
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Export Data">
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600 mb-4">
                            Download a copy of your personal data including profile information, event history, and preferences.
                          </p>
                          <button
                            type="button"
                            onClick={handleExportData}
                            className="flex items-center px-4 py-2 text-sm font-medium text-[#FF6B35] hover:text-[#FF8535] transition-colors group"
                          >
                            <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Export Data
                          </button>
                        </div>
                      </SettingSection>

                      <SettingSection title="Clear Data">
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-600 mb-4">
                            Clear your event history and temporary data. This action cannot be undone.
                          </p>
                          <button
                            type="button"
                            className="flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors group"
                          >
                            <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <UserX className="w-5 h-5 mr-2 text-[#FF6B35]" />
                      Account Management
                    </h3>
                    <div className="space-y-6">
                      <SettingSection title="Danger Zone">
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <h4 className="font-semibold text-gray-900 mb-2">Delete Account</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors transform hover:scale-105"
                          >
                            Delete Account
                          </button>
                        </div>
                      </SettingSection>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleResetSettings}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
                  >
                    <RotateCcw className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Reset to Default
                  </button>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => reset()}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-6 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] disabled:opacity-50 transition-colors transform hover:scale-105"
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
      
      <div className="bg-[#E55A2B]">
        <Footer />
      </div>
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
  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all group">
    <div className="flex items-center space-x-3">
      <Icon className="w-4 h-4 text-[#FF6B35] group-hover:scale-110 transition-transform" />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" {...register(name)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
    </label>
  </div>
);

const SelectSetting = ({ name, label, description, options, register }) => (
  <div className="space-y-2">
    <label className="font-medium text-gray-900">{label}</label>
    <p className="text-sm text-gray-600">{description}</p>
    <select
      {...register(name)}
      className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] transition-all"
    >
      {options.map(option => (
        <option key={option.value} value={option.value} className="text-gray-900">
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
        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] pr-10 transition-all"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
    className={`p-4 border-2 rounded-lg text-left transition-all group ${
      currentTheme === value
        ? 'border-[#FF6B35] bg-orange-50 transform scale-105'
        : 'border-gray-300 hover:border-[#FF6B35] hover:bg-gray-50'
    }`}
  >
    <Icon className="w-6 h-6 mb-2 text-gray-700 group-hover:scale-110 transition-transform" />
    <p className="font-medium text-gray-900">{label}</p>
  </button>
);

export default Settings;