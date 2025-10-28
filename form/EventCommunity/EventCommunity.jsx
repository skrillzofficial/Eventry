import React, { useState } from "react";
import { Users, Plus, X, Info, Link as LinkIcon, Check, MessageCircle, Send, Hash } from "lucide-react";

// Platform configurations
const SOCIAL_PLATFORMS = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    placeholder: "https://chat.whatsapp.com/...",
    description: "WhatsApp group invite link",
    validation: (url) => url.includes("chat.whatsapp.com") || url.includes("wa.me"),
    format: "WhatsApp group invite link (https://chat.whatsapp.com/...)"
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    placeholder: "https://t.me/...",
    description: "Telegram group/channel link",
    validation: (url) => url.includes("t.me"),
    format: "Telegram group or channel link (https://t.me/...)"
  },
  {
    id: "discord",
    name: "Discord",
    icon: Hash,
    color: "bg-indigo-600",
    hoverColor: "hover:bg-indigo-700",
    placeholder: "https://discord.gg/...",
    description: "Discord server invite link",
    validation: (url) => url.includes("discord.gg") || url.includes("discord.com/invite"),
    format: "Discord server invite link (https://discord.gg/...)"
  }
];

const EventCommunity = ({ 
  onCommunityChange, 
  initialCommunity = null,
  disabled = false 
}) => {
  const [communityEnabled, setCommunityEnabled] = useState(!!initialCommunity || false);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    initialCommunity?.platforms || []
  );
  const [platformLinks, setPlatformLinks] = useState(
    initialCommunity?.links || {}
  );
  const [errors, setErrors] = useState({});
  const [showAddPlatform, setShowAddPlatform] = useState(false);

  const handleCommunityToggle = (enabled) => {
    setCommunityEnabled(enabled);
    if (!enabled) {
      // Clear all data when disabled
      setSelectedPlatforms([]);
      setPlatformLinks({});
      setErrors({});
      onCommunityChange(null, false);
    } else {
      onCommunityChange({ platforms: selectedPlatforms, links: platformLinks }, true);
    }
  };

  const handleAddPlatform = (platformId) => {
    if (!selectedPlatforms.includes(platformId)) {
      const newPlatforms = [...selectedPlatforms, platformId];
      setSelectedPlatforms(newPlatforms);
      setShowAddPlatform(false);
      onCommunityChange({ platforms: newPlatforms, links: platformLinks }, true);
    }
  };

  const handleRemovePlatform = (platformId) => {
    const newPlatforms = selectedPlatforms.filter(p => p !== platformId);
    const newLinks = { ...platformLinks };
    delete newLinks[platformId];
    
    setSelectedPlatforms(newPlatforms);
    setPlatformLinks(newLinks);
    
    // Clear error for this platform
    const newErrors = { ...errors };
    delete newErrors[platformId];
    setErrors(newErrors);
    
    onCommunityChange({ platforms: newPlatforms, links: newLinks }, true);
  };

  const handleLinkChange = (platformId, value) => {
    const newLinks = { ...platformLinks, [platformId]: value };
    setPlatformLinks(newLinks);
    
    // Validate the link
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (value && !platform.validation(value)) {
      setErrors({ ...errors, [platformId]: `Invalid ${platform.name} link format` });
    } else {
      const newErrors = { ...errors };
      delete newErrors[platformId];
      setErrors(newErrors);
    }
    
    onCommunityChange({ platforms: selectedPlatforms, links: newLinks }, true);
  };

  const getPlatformConfig = (platformId) => {
    return SOCIAL_PLATFORMS.find(p => p.id === platformId);
  };

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    p => !selectedPlatforms.includes(p.id)
  );

  const hasErrors = Object.keys(errors).length > 0;
  const hasEmptyLinks = selectedPlatforms.some(p => !platformLinks[p] || platformLinks[p].trim() === '');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Event Community Groups
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Connect attendees through dedicated social media groups
            </p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={communityEnabled}
            onChange={(e) => handleCommunityToggle(e.target.checked)}
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
              <li>Add links to your WhatsApp, Telegram, or Discord communities</li>
              <li>Attendees receive these links with their ticket email</li>
              <li>Build engagement before, during, and after the event</li>
              <li>Foster networking and community connections</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Community Setup */}
      {communityEnabled && (
        <div className="space-y-6">
          {/* Selected Platforms */}
          {selectedPlatforms.length > 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Community Platforms ({selectedPlatforms.length})
              </label>
              
              {selectedPlatforms.map((platformId) => {
                const platform = getPlatformConfig(platformId);
                const Icon = platform.icon;
                const hasError = errors[platformId];
                const hasValue = platformLinks[platformId]?.trim();

                return (
                  <div key={platformId} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className={`${platform.color} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                            <p className="text-xs text-gray-500">{platform.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePlatform(platformId)}
                            disabled={disabled}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="url"
                              value={platformLinks[platformId] || ""}
                              onChange={(e) => handleLinkChange(platformId, e.target.value)}
                              disabled={disabled}
                              className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                                hasError 
                                  ? 'border-red-300 bg-red-50' 
                                  : hasValue 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-gray-300 bg-white'
                              }`}
                              placeholder={platform.placeholder}
                            />
                            {hasValue && !hasError && (
                              <Check className="h-5 w-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                            )}
                          </div>
                          
                          {hasError && (
                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                              <X className="h-3 w-3" />
                              {errors[platformId]}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-1">
                            {platform.format}
                          </p>
                        </div>

                        {/* Link Preview */}
                        {hasValue && !hasError && (
                          <div className="mt-3 p-2 bg-white border border-gray-200 rounded">
                            <p className="text-xs text-gray-500 mb-1">Preview:</p>
                            <a 
                              href={platformLinks[platformId]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-orange-600 hover:text-blue-700 break-all"
                            >
                              {platformLinks[platformId]}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Platform Button */}
          {availablePlatforms.length > 0 && (
            <div>
              {!showAddPlatform ? (
                <button
                  type="button"
                  onClick={() => setShowAddPlatform(true)}
                  disabled={disabled}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Community Platform
                </button>
              ) : (
                <div className="border-2 border-orange-300 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Select a platform to add:</p>
                    <button
                      type="button"
                      onClick={() => setShowAddPlatform(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {availablePlatforms.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => handleAddPlatform(platform.id)}
                          disabled={disabled}
                          className={`${platform.color} ${platform.hoverColor} text-white p-3 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50`}
                        >
                          <Icon className="h-5 w-5" />
                          <div className="text-left">
                            <p className="font-semibold">{platform.name}</p>
                            <p className="text-xs opacity-90">{platform.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Summary */}
          {selectedPlatforms.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Community Status
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} configured
                  </p>
                </div>
                
                <div className="text-right">
                  {hasErrors ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <X className="h-4 w-4" />
                      <span className="text-sm font-medium">Invalid links</span>
                    </div>
                  ) : hasEmptyLinks ? (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">Links required</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Ready to go!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedPlatforms.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm mb-4">
                No community platforms added yet
              </p>
              <button
                type="button"
                onClick={() => setShowAddPlatform(true)}
                disabled={disabled}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Your First Platform
              </button>
            </div>
          )}

          {/* Best Practices */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              💡 Best Practices:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Create dedicated groups/channels for your event</li>
              <li>• Set clear community guidelines and pin them</li>
              <li>• Add moderators to manage the community</li>
              <li>• Test all invite links before publishing the event</li>
              <li>• Consider time zones when scheduling group activities</li>
              <li>• Keep groups active with updates and engagement</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCommunity;