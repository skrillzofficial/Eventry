import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Loader, Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import axios from "axios";

const BACKEND_URL = "https://ecommerce-backend-tb8u.onrender.com/api/v1";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ✅ Check for token in URL on mount
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      console.log("Reset token found in URL, moving to step 2");
      setStep(2);
    }
  }, [searchParams]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
        setSuccess(response.data.message || "Check your email for the password reset link");
        
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      // Get token from URL
      const token = searchParams.get("token");

      if (!token) {
        throw new Error("Reset token not found. Please use the link from your email.");
      }

      console.log("Resetting password with token:", token.substring(0, 10) + "...");

      const response = await axios.post(
        `${BACKEND_URL}/reset-password?token=${token}`,
        { password: newPassword },
        { timeout: 10000 }
      );

      console.log("Password reset response:", response.data);

      if (response.data.success) {
        setSuccess("Password reset successfully!");
        
        // Store token if login data provided
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("userName", response.data.user.userName || response.data.user.firstName);
          localStorage.setItem("userRole", response.data.user.role);
        }

        // Auto-advance to success step
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setStep(3);
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to reset password. Please try again or request a new link."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setStep(1);
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    navigate("/forgot-password", { replace: true });
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
            {step === 1 && "Reset Your Password"}
            {step === 2 && "Create New Password"}
            {step === 3 && "Password Reset Successfully"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && "Enter your email address and we will send you a password reset link"}
            {step === 2 && "Enter your new password below"}
            {step === 3 && "Your password has been reset successfully"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= stepNumber
                      ? "bg-[#FF6B35] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-1 transition-all ${
                      step > stepNumber ? "bg-[#FF6B35]" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
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

        {/* Step 2: New Password */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handlePasswordReset}>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter new password (min 6 characters)"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 focus:border-[#FF6B35] transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your new password"
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#FF6B35] hover:bg-[#FF8535] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 hover:text-[#FF6B35] font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Request new link
              </Link>
            </div>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Password Reset Complete!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Your password has been successfully reset. You can now login with your new password.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#FF6B35] hover:bg-[#FF8535] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] transition-colors transform hover:scale-105"
              >
                Go to Login
              </button>

              <button
                onClick={resetProcess}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35] transition-colors"
              >
                Reset Another Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;