import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

const VoiceSearch = ({ onVoiceResult, navbarBg = "light" }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();

      // Configuration
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setShowFeedback(true);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;

        setTranscript(transcriptText);

        // If it's a final result
        if (event.results[current].isFinal) {
          onVoiceResult(transcriptText);
          setIsListening(false);

          setTimeout(() => {
            setShowFeedback(false);
            setTranscript("");
          }, 1000);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setShowFeedback(false);

        const errorMessages = {
          "no-speech": "No speech detected. Please try again.",
          "audio-capture": "Microphone not found. Please check your device.",
          "not-allowed":
            "Microphone permission denied. Please enable it in your browser settings.",
          network: "Network error. Please check your connection.",
        };

        const message =
          errorMessages[event.error] || "An error occurred. Please try again.";
        alert(message);
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
      setIsListening(false);
      setShowFeedback(false);
      setTranscript("");
    }
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
      >
        {isListening ? (
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

      {/* Voice Feedback Overlay */}
      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            {/* Animated Microphone */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-[#FF6B35] animate-ping opacity-75"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#FF6B35] animate-pulse"></div>
              </div>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Listening...
              </h3>
              <p className="text-gray-600 text-sm">
                Speak now to search for events
              </p>
            </div>

            {transcript && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-800 text-center font-medium">
                  "{transcript}"
                </p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800 font-medium mb-2">
                Try saying:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• "Tech events in Lagos"</li>
                <li>• "Music concerts this weekend"</li>
                <li>• "Business conferences"</li>
              </ul>
            </div>

            <button
              onClick={stopListening}
              className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceSearch;

