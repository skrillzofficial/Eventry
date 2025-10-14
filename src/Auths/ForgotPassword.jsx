import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Loader, Shield, AlertCircle } from "lucide-react";
import axios from "axios";

const BACKEND_URL = "https://ecommerce-backend-tb8u.onrender.com/api/v1";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      console.log("Requesting password reset for:", email);

      const response = await axios.post(
        `${BACKEND_URL}/forgot-password`,
        { email: email.toLowerCase() },
        { timeout: 10000 }
      );

      console.log("Password reset response:", response.data);

      if (response.data.success) {
        setSuccess(true);
      } else {
        throw new Error(response.data.message || "Failed to send reset email");
      }
    } catch (err) {
      console.error("Email submit error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to send reset email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen Homeimg Blend-overlay flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-[#FF6B35] rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {success ? "Check Your Email" : "Forgot Password?"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {success 
              ? "We've sent you a password reset link" 
              : "Enter your email address and we'll send you a link to reset your password"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success State */}
        {success ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Email sent successfully!</p>
                  <p>We've sent a password reset link to <strong>{email}</strong></p>
                  <p className="mt-2">Click the link in the email to reset your password.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong><br />
                • Check your spam folder<br />
                • Make sure you entered the correct email<br />
                • Wait a few minutes and check again
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Try Different Email
              </button>

              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 text-sm font-medium text-[#FF6B35] hover:text-[#FF8535] transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Email Input Form */
          <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you a password reset link to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#FF6B35] hover:bg-[#FF8535] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-[#FF6B35] hover:text-[#E55A2B] font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;