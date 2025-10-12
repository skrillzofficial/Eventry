import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import google from "../assets/google.png";
import Brandlogo from "../assets/1.png";

// Constants
const PASSWORD_MIN_LENGTH = 8;

// Validation Schema
const schema = yup
  .object({
    userName: yup
      .string()
      .trim()
      .min(2, "Username must be at least 2 characters")
      .max(50, "Username must be less than 50 characters")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .required("Username is required"),
    email: yup
      .string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: yup
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
      )
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(
        /[@$!%*?&]/,
        "Password must contain at least one special character"
      )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
    agreeToTerms: yup
      .boolean()
      .oneOf([true], "You must accept the terms and conditions"),
    userType: yup
      .string()
      .oneOf(["attendee", "organizer"], "Please select a user type")
      .required("User type is required"),
  })
  .required();

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
    setError,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      userType: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const navigate = useNavigate();

  // Watch fields for real-time validation feedback
  const [passwordValue, emailValue, userNameValue, userTypeValue] = watch([
    "password",
    "email",
    "userName",
    "userType",
  ]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= PASSWORD_MIN_LENGTH) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[\d@$!%*?&]/.test(password)) strength += 25;
    
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 50) return "Weak";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const passwordStrength = calculatePasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      // Simulate API call with progress
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Show success animation
      setShowSuccessAnimation(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Redirect to login with success message
      navigate("/login", { 
        state: { 
          message: "Account created successfully! Please sign in.",
          email: data.email 
        } 
      });
      
    } catch (err) {
      setError("root.serverError", {
        message: "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowSuccessAnimation(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // In a real app, this would redirect to Google OAuth
      navigate("/dashboard");
    } catch (error) {
      setError("root.serverError", {
        message: "Google sign-up failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && userNameValue && emailValue && !errors.userName && !errors.email) {
      setCurrentStep(2);
    } else if (currentStep === 2 && userTypeValue) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Input field classes for consistency
  const inputClasses = (hasError) =>
    `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 ${
      hasError
        ? "border-red-500 focus:border-red-500 bg-red-50"
        : "border-gray-300 focus:border-[#FF6B35] hover:border-gray-400"
    }`;

  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

  // Success Animation Component
  const SuccessAnimation = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Eventry!</h3>
        <p className="text-gray-600">Your account has been created successfully</p>
        <div className="mt-4 animate-pulse">
          <div className="inline-flex items-center text-sm text-gray-500">
            <span>Redirecting to login</span>
            <span className="ml-2 animate-bounce">...</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center Homeimg Blend-overlay p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF8535]/10 rounded-full blur-3xl"></div>
      </div>

      {showSuccessAnimation && <SuccessAnimation />}

      <div className="relative w-full max-w-4xl">
        {/* Multi-step Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all">
          <div className="md:flex">
            {/* Left Side - Visual */}
            <div className="md:w-2/5 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] p-8 text-white relative hidden md:block">
              <div className="relative z-10">
                <Link to="/" className="flex items-center mb-8 group">
                  <img className="h-8 w-auto" src={Brandlogo} alt="Eventry Logo" />
                  <span className="ml-2 text-2xl font-bold group-hover:text-gray-100 transition-colors">Eventry</span>
                </Link>
                
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Join the Revolution
                </div>

                <div className="mt-8">
                  <h2 className="text-3xl font-bold mb-4">Create Amazing Experiences</h2>
                  <p className="text-white/80 text-lg">
                    Join Africa's first blockchain-powered event ecosystem
                  </p>
                </div>

                {/* Step Indicators */}
                <div className="mt-12 space-y-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep >= step ? 'bg-white text-[#FF6B35] border-white transform scale-110' : 'border-white/30 text-white/30'
                      }`}>
                        {step}
                      </div>
                      <span className={currentStep >= step ? 'text-white font-medium' : 'text-white/50'}>
                        {step === 1 && 'Basic Information'}
                        {step === 2 && 'Account Type'}
                        {step === 3 && 'Security Setup'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="md:w-3/5 p-8">
              {/* Mobile Header */}
              <div className="md:hidden mb-6">
                <Link to="/" className="flex items-center justify-center">
                  <img className="h-8 w-auto" src={Brandlogo} alt="Eventry Logo" />
                  <span className="ml-2 text-2xl font-bold text-gray-900">Eventry</span>
                </Link>
                <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35]/10 rounded-full text-[#FF6B35] text-sm mt-4 justify-center mx-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Join the Revolution
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900">Join <span className="text-[#FF6B35]">Eventry</span></h1>
                      <p className="text-gray-600 mt-2">Start your journey with us</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="userName" className={labelClasses}>
                          Username
                        </label>
                        <input
                          id="userName"
                          {...register("userName")}
                          placeholder="Choose a username"
                          className={inputClasses(!!errors.userName)}
                          aria-invalid={!!errors.userName}
                        />
                        {errors.userName && (
                          <p className="text-red-600 text-sm mt-1 flex items-center" role="alert">
                            <X className="w-4 h-4 mr-1" />
                            {errors.userName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className={labelClasses}>
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="Enter your email"
                          className={inputClasses(!!errors.email)}
                          aria-invalid={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1 flex items-center" role="alert">
                            <X className="w-4 h-4 mr-1" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Account Type */}
                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">Choose Your <span className="text-[#FF6B35]">Role</span></h2>
                      <p className="text-gray-600 mt-2">How will you use Eventry?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          value: "attendee",
                          title: "Event Attendee",
                          description: "Discover and attend amazing events",
                          icon: "🎫",
                        },
                        {
                          value: "organizer",
                          title: "Event Organizer",
                          description: "Create and manage your events",
                          icon: "🎪",
                        },
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                            userTypeValue === type.value
                              ? "border-[#FF6B35] bg-[#FF6B35]/5 transform scale-105"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                          }`}
                        >
                          <input
                            type="radio"
                            value={type.value}
                            {...register("userType")}
                            className="sr-only"
                          />
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <span className="font-semibold text-gray-900">{type.title}</span>
                          <span className="text-sm text-gray-600 mt-1">{type.description}</span>
                          {userTypeValue === type.value && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center transform scale-110">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>
                    {errors.userType && (
                      <p className="text-red-600 text-sm mt-2 flex items-center" role="alert">
                        <X className="w-4 h-4 mr-1" />
                        {errors.userType.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Step 3: Security Setup */}
                {currentStep === 3 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">Secure Your <span className="text-[#FF6B35]">Account</span></h2>
                      <p className="text-gray-600 mt-2">Create a strong password</p>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <label htmlFor="password" className={labelClasses}>
                          Password
                        </label>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          placeholder="Create a strong password"
                          className={`${inputClasses(!!errors.password)} pr-10`}
                          aria-invalid={!!errors.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                        {errors.password && (
                          <p className="text-red-600 text-sm mt-1 flex items-center" role="alert">
                            <X className="w-4 h-4 mr-1" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <label htmlFor="confirmPassword" className={labelClasses}>
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                          placeholder="Confirm your password"
                          className={`${inputClasses(!!errors.confirmPassword)} pr-10`}
                          aria-invalid={!!errors.confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-1"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm mt-1 flex items-center" role="alert">
                            <X className="w-4 h-4 mr-1" />
                            {errors.confirmPassword.message}
                          </p>
                        )}
                        {!errors.confirmPassword && passwordValue && touchedFields.confirmPassword && (
                          <p className="text-green-600 text-sm mt-1 flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            Passwords match
                          </p>
                        )}
                      </div>

                      {/* Enhanced Password Strength Indicator */}
                      {passwordValue && (
                        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Password strength:</span>
                            <span className={`text-sm font-semibold ${
                              passwordStrength < 50 ? "text-red-600" :
                              passwordStrength < 75 ? "text-yellow-600" : "text-green-600"
                            }`}>
                              {getPasswordStrengthText(passwordStrength)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            {[
                              { label: "8+ characters", met: passwordValue.length >= 8 },
                              { label: "Lowercase letter", met: /[a-z]/.test(passwordValue) },
                              { label: "Uppercase letter", met: /[A-Z]/.test(passwordValue) },
                              { label: "Number or special", met: /[\d@$!%*?&]/.test(passwordValue) },
                            ].map((req, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                {req.met ? (
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className={`text-xs ${req.met ? "text-green-600" : "text-gray-500"}`}>
                                  {req.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Terms Agreement */}
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          id="agreeToTerms"
                          type="checkbox"
                          {...register("agreeToTerms")}
                          className="mt-1 accent-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/50"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                          I agree to the{" "}
                          <Link
                            to="/terms"
                            className="text-[#FF6B35] hover:text-[#E55A2B] font-medium underline"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to="/privacy"
                            className="text-[#FF6B35] hover:text-[#E55A2B] font-medium underline"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                      {errors.agreeToTerms && (
                        <p className="text-red-600 text-sm mt-1 flex items-center" role="alert">
                          <X className="w-4 h-4 mr-1" />
                          {errors.agreeToTerms.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex space-x-4 pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors transform hover:scale-105 flex items-center justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && (!userNameValue || !emailValue || errors.userName || errors.email)) ||
                        (currentStep === 2 && !userTypeValue)
                      }
                      className="flex-1 py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105 flex items-center justify-center"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading || !isValid}
                      className="flex-1 py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105"
                    >
                      {isSubmitting || isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Creating Account...
                        </span>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  )}
                </div>

                {/* Quick Sign Up */}
                {currentStep === 1 && (
                  <>
                    <div className="flex items-center my-6">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-sm text-gray-500">Or sign up instantly</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <button
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                      type="button"
                      className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105"
                    >
                      <img src={google} alt="Google" className="w-5 h-5 mr-3" />
                      {isLoading ? "Signing up..." : "Sign up with Google"}
                    </button>
                  </>
                )}
              </form>

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#FF6B35] hover:text-[#E55A2B] font-semibold transition-colors underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to your CSS */}
      <style jsx>{`
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}