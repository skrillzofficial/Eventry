import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { voiceSearchAPI } from "../../services/api";

const VoiceSearch = forwardRef(({ onVoiceResult, navbarBg = "light" }, ref) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const modalRef = useRef(null);

  // Expose stopListening function to parent
  useImperativeHandle(ref, () => ({
    stopListening: () => {
      stopListening();
    },
    isListening: isListening
  }));

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      // Configuration
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setShowFeedback(true);
      };

      recognition.onresult = async (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        // Process immediately without showing transcript
        await processVoiceQuery(transcriptText);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onVoiceResult]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFeedback && modalRef.current && !modalRef.current.contains(event.target)) {
        stopListening();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFeedback]);

  // Process voice query with backend parsing
  const processVoiceQuery = async (voiceQuery) => {
    if (!voiceQuery.trim()) return;

    setIsProcessing(true);

    try {
      // Send voice query to backend for parsing
      const response = await voiceSearchAPI.parseVoiceQuery(voiceQuery);
      
      if (response.data.success) {
        const { parsedQuery, searchParams, confidence, suggestions } = response.data;

        // Pass both original and parsed data to parent component
        if (onVoiceResult) {
          onVoiceResult({
            originalQuery: voiceQuery,
            parsedQuery: parsedQuery,
            searchParams: searchParams,
            confidence: confidence,
            suggestions: suggestions
          });
        }

        // Close feedback modal quickly
        setTimeout(() => {
          setShowFeedback(false);
        }, 500);

      } else {
        throw new Error(response.data.message || "Failed to process voice query");
      }
    } catch (error) {
      console.error("Voice search processing error:", error);
      
      // Fallback: use original query if backend processing fails
      if (onVoiceResult) {
        onVoiceResult({
          originalQuery: voiceQuery,
          parsedQuery: voiceQuery,
          searchParams: { query: voiceQuery },
          confidence: 0.5,
          isFallback: true
        });
      }

      // Close modal quickly even on error
      setTimeout(() => {
        setShowFeedback(false);
      }, 500);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!isSupported) {
      alert(
        "Voice search is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setShowFeedback(false);
    setIsProcessing(false);
  };

  if (!isSupported) {
    return null;
  }

  const buttonColor =
    navbarBg === "light"
      ? "text-gray-600 hover:text-[#FF6B35]"
      : "text-white/70 hover:text-[#FF6B35]";
  const bgColor =
    navbarBg === "light" ? "hover:bg-gray-100" : "hover:bg-white/10";

  return (
    <>
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-full ${bgColor} ${buttonColor} transition-all duration-200 transform hover:scale-110 ${
          isListening ? "animate-pulse" : ""
        }`}
        title={isListening ? "Stop listening" : "Voice search"}
        type="button"
        disabled={isProcessing}
      >
        {isListening || isProcessing ? (
          <div className="relative">
            <MicOff className="h-5 w-5 text-red-500" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {/* Minimal Voice Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
          <div 
            ref={modalRef}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 max-w-xs w-full mx-4 transform animate-scaleIn"
          >
            {/* Simple Animated Microphone */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">
                {isProcessing ? "Searching..." : "Listening..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

VoiceSearch.displayName = "VoiceSearch";
export default VoiceSearch;