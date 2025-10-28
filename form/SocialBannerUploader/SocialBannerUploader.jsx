import React, { useState } from "react";
import { Share2, Upload, X, Info, Eye, User } from "lucide-react";

const SocialBannerUploader = ({ 
  onBannerChange, 
  initialBanner = null,
  disabled = false 
}) => {
  const [bannerEnabled, setBannerEnabled] = useState(!!initialBanner);
  const [bannerTemplate, setBannerTemplate] = useState(initialBanner);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleBannerToggle = (enabled) => {
    setBannerEnabled(enabled);
    if (!enabled) {
      // Clear banner when disabled
      setBannerTemplate(null);
      setBannerFile(null);
      onBannerChange(null, false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Banner size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setBannerTemplate(result);
        setBannerFile(file);
        onBannerChange(file, true);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Failed to upload banner template");
      setUploading(false);
    }
  };

  const removeBanner = () => {
    setBannerTemplate(null);
    setBannerFile(null);
    onBannerChange(null, bannerEnabled);
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Share2 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Shareable Social Banner
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Let attendees create personalized event banners to share on social media
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={bannerEnabled}
            onChange={(e) => handleBannerToggle(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-2">How it works:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Upload a banner template (1200x630px recommended)</li>
              <li>During ticket purchase, attendees can upload their photo</li>
              <li>Their photo will be overlaid on your template</li>
              <li>Personalized banner is emailed with their ticket receipt</li>
              <li>If no photo is uploaded, their profile picture is used</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {bannerEnabled && (
        <div className="space-y-4">
          {!bannerTemplate ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Banner Template
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || disabled}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  )}
                  
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {uploading ? "Uploading..." : "Click to upload banner template"}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 10MB (1200x630px recommended)
                  </p>
                </label>
              </div>

              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {error}
                </p>
              )}

              {/* Design Tips */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Design Tips:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Leave space in the center or corner for attendee photos</li>
                  <li>• Include your event name and date on the banner</li>
                  <li>• Use high contrast colors for better visibility</li>
                  <li>• Keep important text away from photo overlay area</li>
                  <li>• Test with different photo positions before finalizing</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Banner Template Preview
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? "Hide" : "Show"} with Sample Photo
                </button>
              </div>

              <div className="relative">
                <img
                  src={bannerTemplate}
                  alt="Banner template"
                  className="w-full h-auto rounded-lg border border-gray-200"
                />
                
                {/* Sample photo overlay when preview is enabled */}
                {showPreview && (
                  <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-white shadow-lg bg--orange-400 flex items-center justify-center overflow-hidden">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={removeBanner}
                  disabled={disabled}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Banner template uploaded successfully! Attendees will be able to personalize this with their photos.
                </p>
              </div>

              {/* Upload New Button */}
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || disabled}
                  className="hidden"
                  id="banner-replace"
                />
                <label
                  htmlFor="banner-replace"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload Different Template
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Additional Options (if banner is enabled and uploaded) */}
      {bannerEnabled && bannerTemplate && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Photo Overlay Settings
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Photo Position</span>
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="center">Center</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Photo Size</span>
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="small">Small (100px)</option>
                <option value="medium">Medium (150px)</option>
                <option value="large">Large (200px)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Photo Shape</span>
              <select className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="rounded">Rounded Square</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialBannerUploader;