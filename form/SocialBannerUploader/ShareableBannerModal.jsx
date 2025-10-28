import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Download, Share2, Check } from "lucide-react";

const ShareableBannerModal = ({ 
  isOpen, 
  onClose, 
  event, 
  userProfile,
  bookingData 
}) => {
  const [attendeeImage, setAttendeeImage] = useState(null);
  const [useProfilePicture, setUseProfilePicture] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBanner, setGeneratedBanner] = useState(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize with profile picture
  useEffect(() => {
    if (isOpen && userProfile?.profilePicture) {
      setPreviewImage(userProfile.profilePicture);
    }
  }, [isOpen, userProfile]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttendeeImage(file);
      setPreviewImage(event.target.result);
      setUseProfilePicture(false);
    };
    reader.readAsDataURL(file);
  };

  // Generate shareable banner
  const generateBanner = async () => {
    if (!event?.socialBanner) return;

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size (standard social media size)
      canvas.width = 1200;
      canvas.height = 630;

      // Load and draw banner background
      const bannerImg = new Image();
      bannerImg.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        bannerImg.onload = resolve;
        bannerImg.onerror = reject;
        bannerImg.src = event.socialBanner;
      });

      // Draw banner background
      ctx.drawImage(bannerImg, 0, 0, canvas.width, canvas.height);

      // Draw attendee image (circular) - positioned in bottom right
      if (previewImage) {
        const attendeeImg = new Image();
        attendeeImg.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
          attendeeImg.onload = resolve;
          attendeeImg.onerror = reject;
          attendeeImg.src = previewImage;
        });

        // Circle position and size
        const circleX = canvas.width - 150; // 150px from right
        const circleY = canvas.height - 150; // 150px from bottom
        const circleRadius = 80;

        // Draw circular mask
        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw attendee image
        ctx.drawImage(
          attendeeImg,
          circleX - circleRadius,
          circleY - circleRadius,
          circleRadius * 2,
          circleRadius * 2
        );

        ctx.restore();

        // Add white border around circle
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Add attendee name overlay (if provided)
      if (userProfile?.name || bookingData?.attendeeName) {
        const name = userProfile?.name || bookingData?.attendeeName;
        
        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

        // Draw name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${name} is attending!`, 40, canvas.height - 35);
      }

      // Convert to blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setGeneratedBanner(url);
        setDownloadReady(true);
        setIsGenerating(false);
      }, 'image/png');

    } catch (error) {
      console.error('Error generating banner:', error);
      alert('Failed to generate banner. Please try again.');
      setIsGenerating(false);
    }
  };

  // Download banner
  const downloadBanner = () => {
    if (!generatedBanner) return;

    const link = document.createElement('a');
    link.href = generatedBanner;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '-')}-ticket.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share banner
  const shareBanner = async () => {
    if (!generatedBanner) return;

    try {
      // Convert blob URL to actual blob
      const response = await fetch(generatedBanner);
      const blob = await response.blob();
      const file = new File([blob], 'event-ticket.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `I'm attending ${event.title}!`,
          text: `Join me at ${event.title}! Get your tickets now.`,
          files: [file],
        });
      } else {
        // Fallback: copy link
        await navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Unable to share. Please download and share manually.');
    }
  };

  if (!isOpen || !event?.socialBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create Your Event Banner
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your attendance on social media!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!generatedBanner ? (
            <>
              {/* Image Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Photo
                </label>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => {
                      setUseProfilePicture(true);
                      setPreviewImage(userProfile?.profilePicture);
                      setAttendeeImage(null);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      useProfilePicture
                        ? 'border-[#FF6B35] bg-[#FFF6F2]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Camera className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium text-gray-900">
                      Use Profile Picture
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      !useProfilePicture && attendeeImage
                        ? 'border-[#FF6B35] bg-[#FFF6F2]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium text-gray-900">
                      Upload New Photo
                    </div>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Preview */}
                {previewImage && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Banner Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Preview
                </label>
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={event.socialBanner}
                    alt="Event banner"
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-4 right-4">
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Your photo"
                        className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your photo will appear in the bottom right corner
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateBanner}
                disabled={!previewImage || isGenerating}
                className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8535] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Banner
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Generated Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Event Banner
                </label>
                <img
                  src={generatedBanner}
                  alt="Generated banner"
                  className="w-full rounded-lg border border-gray-200"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={downloadBanner}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Download
                </button>

                <button
                  onClick={shareBanner}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Check className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">Banner Ready!</div>
                    <div className="text-sm text-green-700">
                      Download and share on social media to spread the word!
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Another */}
              <button
                onClick={() => {
                  setGeneratedBanner(null);
                  setDownloadReady(false);
                }}
                className="w-full text-[#FF6B35] py-2 rounded-lg font-medium hover:bg-[#FFF6F2] transition-colors"
              >
                Create Another Banner
              </button>
            </>
          )}
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ShareableBannerModal;