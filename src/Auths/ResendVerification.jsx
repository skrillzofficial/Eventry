import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [message, setMessage] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      console.log("🔄 Requesting verification email resend for:", email);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "https://ecommerce-backend-tb8u.onrender.com"}/api/v1/resend-verification`,
        { email: email.toLowerCase() },
        {
          timeout: 10000,
        }
      );

      console.log("✅ Resend response:", response.data);

      if (response.data.success) {
        setStatus("success");
        setMessage(
          response.data.message ||
            "Verification email sent successfully! Check your inbox."
        );
        setEmail("");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } else {
        throw new Error(response.data.message || "Failed to resend email");
      }
    } catch (error) {
      console.error("❌ Resend error:", error);

      setStatus("error");

      // Check for rate limiting error
      if (error.response?.status === 429) {
        setMessage(
          "Too many attempts. Please wait 1 hour before trying again."
        );
        setRemainingAttempts(0);
      } else if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message === "Network Error") {
        setMessage(
          "Network error. Please check your connection and try again."
        );
      } else {
        setMessage(
          "Failed to resend verification email. Please try again later."
        );
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Go Back</span>
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {(status === "idle" || status === "loading" || status === "error") && (
            <>
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 p-4 rounded-full">
                  <Mail className="text-[#FF6B35] w-8 h-8" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Resend Verification Email
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Enter your email address and we'll send you a new verification link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={status === "loading"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-all transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Send Verification Email</span>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Helpful Tips:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Verification link expires in 24 hours</li>
                  <li>• You can request a new link up to 3 times per hour</li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[#FF6B35] hover:underline font-semibold"
                  >
                    Back to Login
                  </button>
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="text-green-500 w-16 h-16" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                Email Sent!
              </h2>
              <p className="text-gray-600 text-center mb-6">{message}</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  Check your inbox at <strong>{email}</strong> for the verification link.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  <span className="animate-pulse">Redirecting to login</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
                    .
                  </span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                    .
                  </span>
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full mt-4 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Go to Login
              </button>
            </>
          )}
        </div>

        {/* Support card */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Still need help?{" "}
            <a
              href="mailto:support@eventry.com"
              className="text-[#FF6B35] hover:underline font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;