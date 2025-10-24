import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Eye, EyeOff, Check, X, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import google from "../assets/google.png";
import Brandlogo from "../assets/eventry white logo.PNG";
import { AuthContext } from "../context/AuthContext";

const PASSWORD_MIN_LENGTH = 6;
const BACKEND_URL = "https://ecommerce-backend-tb8u.onrender.com/api/v1";

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
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
    setError,
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, setAuthState } = useContext(AuthContext);

  const [passwordValue, emailValue, userNameValue, userTypeValue] = watch([
    "password",
    "email",
    "userName",
    "userType",
  ]);

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= PASSWORD_MIN_LENGTH) strength += 100;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 100) return "bg-red-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 100) return "Too Short";
    return "Good";
  };

  const passwordStrength = calculatePasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const userData = {
        userName: data.userName,
        email: data.email,
        password: data.password,
        userType: data.userType,
      };

      console.log("Registering user with data:", userData);

      const result = await registerUser(userData);

      console.log("Registration result:", result);

      if (result.success) {
        setShowSuccessAnimation(true);
        
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        if (result.requiresVerification) {
          navigate("/login", { 
            state: { 
              message: result.message || "Registration successful! Please check your email to verify your account.",
              email: data.email,
              type: "success"
            } 
          });
        } else {
          const user = result.data?.user;
          const redirectPath = user?.role === "organizer" ? "/dashboard/organizer" : "/dashboard";
          navigate(redirectPath, { replace: true });
        }
      } else {
        setError("root.serverError", { 
          message: result.error || "Registration failed. Please try again." 
        });
      }
      
    } catch (err) {
      console.error("Registration error:", err);
      setError("root.serverError", { 
        message: err.message || "Registration failed. Please try again." 
      });
    } finally {
      setIsLoading(false);
      setShowSuccessAnimation(false);
    }
  };

  const handleGoogleSignUp = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);

      if (!userTypeValue) {
        setError("root.serverError", {
          message: "Please select your account type first",
        });
        return;
      }

      console.log("Google credential received for signup, sending to backend...");

      const response = await axios.post(
        `${BACKEND_URL}/auth/google`,
        {
          token: credentialResponse.credential,
          userType: userTypeValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Google signup response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        await setAuthState(user, token);
        localStorage.setItem("authMethod", "google");

        setShowSuccessAnimation(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const redirectPath =
          user.role === "organizer" ? "/dashboard/organizer" : "/dashboard";

        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(
          response.data.message || "Google sign-up failed"
        );
      }
    } catch (error) {
      console.error("Google signup error:", error);

      let errorMessage = "Google sign-up failed. Please try again.";

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            errorMessage = data.message || "Invalid Google token";
            break;
          case 409:
            errorMessage =
              data.message ||
              "An account with this email already exists. Please sign in instead.";
            break;
          case 422:
            errorMessage = data.message || "Validation failed";
            break;
          default:
            errorMessage = data.message || "Google sign-up failed";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError("root.serverError", {
        type: "server",
        message: errorMessage,
      });
    } finally {
      setIsGoogleLoading(false);
      setShowSuccessAnimation(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-Up failed");
    setError("root.serverError", {
      type: "server",
      message: "Google Sign-Up was cancelled or failed. Please try again.",
    });
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

  const inputClasses = (hasError) =>
    `w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 ${
      hasError
        ? "border-red-500 focus:border-red-500 bg-red-50"
        : "border-gray-300 focus:border-[#FF6B35] hover:border-gray-400"
    }`;

  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

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
            <span>Processing...</span>
            <span className="ml-2 animate-bounce">...</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center Homeimg Blend-overlay p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF8535]/10 rounded-full blur-3xl"></div>
      </div>

      {showSuccessAnimation && <SuccessAnimation />}

      {errors.root?.serverError && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in max-w-md">
          <div className="flex items-center">
            <X className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{errors.root.serverError.message}</span>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all">
          <div className="md:flex">
            <div className="md:w-2/5 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] p-8 text-white relative hidden md:block">
              <div className="relative z-10">
                <Link to="/" className="flex items-center mb-8 group">
                  <img className="h-13 w-auto" src={Brandlogo} alt="Eventry Logo" />
                  <span className="ml-2 text-2xl font-bold group-hover:text-gray-100 transition-colors">Eventry</span>
                </Link>
                
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
                  Join the Revolution
                </div>

                <div className="mt-8">
                  <h2 className="text-3xl font-bold mb-4">Create Amazing Experiences</h2>
                  <p className="text-white/80 text-lg">
                    Join Africa's first blockchain-powered event ecosystem
                  </p>
                </div>

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

            <div className="md:w-3/5 p-8">
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
                          {...formRegister("userName")}
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
                          {...formRegister("email")}
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

                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">Choose Your <span className="text-[#FF6B35]">Role</span></h2>
                      <p className="text-gray-600 mt-2">How will you use Eventry?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                            {...formRegister("userType")}
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

                    {/* Google OAuth Button for Step 2 */}
                    <div className="mt-6">
                      <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-sm text-gray-500">Or sign up with</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>

                      <div className="flex justify-center">
                        {!userTypeValue ? (
                          <div className="w-full max-w-xs flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg text-gray-400 font-medium text-center bg-gray-50 cursor-not-allowed">
                            Select account type to continue with Google
                          </div>
                        ) : isGoogleLoading ? (
                          <div className="w-full max-w-xs flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg bg-gray-50">
                            <Loader2 className="animate-spin w-5 h-5 text-[#FF6B35] mr-2" />
                            <span className="text-gray-700">
                              Creating account with Google...
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-center w-full">
                            <GoogleLogin
                              onSuccess={handleGoogleSignUp}
                              onError={handleGoogleError}
                              useOneTap={false}
                              theme="outline"
                              size="large"
                              text="signup_with"
                              locale="en"
                              width="380"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-sm text-gray-500">Or continue with email</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                      </div>
                    </div>
                  </div>
                )}

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
                          {...formRegister("password")}
                          placeholder="Create a strong password"
                          className={`${inputClasses(!!errors.password)} pr-10`}
                          aria-invalid={!!errors.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-10 text-gray-600 hover:text-gray-800 transition-colors p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                          {...formRegister("confirmPassword")}
                          placeholder="Confirm your password"
                          className={`${inputClasses(!!errors.confirmPassword)} pr-10`}
                          aria-invalid={!!errors.confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-10 text-gray-600 hover:text-gray-800 transition-colors p-1"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

                      {passwordValue && (
                        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Password strength:</span>
                            <span className={`text-sm font-semibold ${
                              passwordStrength < 100 ? "text-red-600" : "text-green-600"
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
                          <div className="mt-2">
                            <p className="text-xs text-gray-600">
                              Password must be at least {PASSWORD_MIN_LENGTH} characters long
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <input
                          id="agreeToTerms"
                          type="checkbox"
                          {...formRegister("agreeToTerms")}
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
                      Continue with Email
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
              </form>

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
    </div>
  );
}