import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  ArrowRight,
  LogIn,
  Mail,
  Lock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Brandlogo from "../assets/1.png";
import google from "../assets/google.png";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  userType: yup
    .string()
    .oneOf(["attendee", "organizer"], "Please select your account type")
    .required("Account type is required"),
});

const BACKEND_URL = "https://ecommerce-backend-tb8u.onrender.com/api/v1";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthState } = useContext(AuthContext);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: localStorage.getItem("rememberedEmail") || "",
      password: "",
      userType: "attendee",
    },
  });

  const [userType, emailValue] = watch(["userType", "email"]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setUnverifiedEmail(null);

      const loginData = {
        email: data.email,
        password: data.password,
        userType: data.userType,
      };

      console.log("Sending login request with:", loginData);

      const response = await axios.post(`${BACKEND_URL}/login`, loginData, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("Login response:", response.data);

      if (response.data.success) {
        const { token, user } = response.data;

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", data.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        await setAuthState(user, token);

        setShowSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const redirectPath =
          user.role === "organizer" ? "/dashboard/organizer" : "/dashboard";
        
        console.log("Navigating to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";
      let isUnverifiedError = false;

      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorMessage = data.message || "Invalid request data";
            break;
          case 401:
            // Check if it's an unverified email error
            if (data.message && data.message.includes("verify your email")) {
              isUnverifiedError = true;
              setUnverifiedEmail(emailValue);
              errorMessage = data.message;
            } else {
              errorMessage = data.message || "Invalid email or password";
            }
            break;
          case 403:
            errorMessage = data.message || "Account suspended or deactivated";
            break;
          case 404:
            errorMessage = data.message || "User not found";
            break;
          case 422:
            errorMessage = data.message || "Validation failed";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data.message || "Login failed";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      }

      setError("root.serverError", {
        type: "server",
        message: errorMessage,
        isUnverified: isUnverifiedError,
      });
    } finally {
      setIsLoading(false);
      setShowSuccess(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setUnverifiedEmail(null);

      if (!userType) {
        setError("root.serverError", {
          message: "Please select your account type first",
        });
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const demoUser = {
        _id: "google-demo-id",
        email: `google-${userType}@eventra.com`,
        firstName: "Google",
        lastName: userType === "organizer" ? "Organizer" : "Attendee",
        userName: `google_${userType}`,
        role: userType,
      };

      await setAuthState(demoUser, "google-demo-token");
      localStorage.setItem("authMethod", "google");

      setShowSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const redirectPath =
        userType === "organizer" ? "/dashboard/organizer" : "/dashboard";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError("root.serverError", {
        type: "server",
        message: "Google sign-in failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setShowSuccess(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && userType) {
      setCurrentStep(2);
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Welcome {userType === "organizer" ? "Organizer" : "Attendee"}!
        </h3>
        <p className="text-gray-600">Successfully signed in</p>
        <div className="mt-4 animate-pulse">
          <div className="inline-flex items-center text-sm text-gray-500">
            <span>Redirecting to dashboard</span>
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

      {showSuccess && <SuccessAnimation />}

      <div className="relative w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all">
          <div className="md:flex">
            <div className="md:w-2/5 bg-gradient-to-br from-[#FF6B35] to-[#FF8535] p-8 text-white relative hidden md:block">
              <div className="relative z-10">
                <Link to="/" className="flex items-center mb-8 group">
                  <img
                    className="h-8 w-auto"
                    src={Brandlogo}
                    alt="Eventry Logo"
                  />
                  <span className="ml-2 text-2xl font-bold group-hover:text-gray-100 transition-colors">
                    Eventry
                  </span>
                </Link>

                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Welcome Back!
                </div>

                <div className="mt-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Continue Your Event Journey
                  </h2>
                  <p className="text-white/80 text-lg">
                    Access your personalized event experience and discover
                    what's next
                  </p>
                </div>

                <div className="mt-12 space-y-6">
                  {[1, 2].map((step) => (
                    <div key={step} className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          currentStep >= step
                            ? "bg-white text-[#FF6B35] border-white transform scale-110"
                            : "border-white/30 text-white/30"
                        }`}
                      >
                        {step}
                      </div>
                      <span
                        className={
                          currentStep >= step
                            ? "text-white font-medium"
                            : "text-white/50"
                        }
                      >
                        {step === 1 && "Account Type"}
                        {step === 2 && "Login Details"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:w-3/5 p-8">
              <div className="md:hidden mb-6">
                <Link to="/" className="flex items-center justify-center">
                  <img
                    className="h-8 w-auto"
                    src={Brandlogo}
                    alt="Eventry Logo"
                  />
                  <span className="ml-2 text-2xl font-bold text-gray-900">
                    Eventry
                  </span>
                </Link>
                <div className="inline-flex items-center px-4 py-2 bg-[#FF6B35]/10 rounded-full text-[#FF6B35] text-sm mt-4 justify-center mx-auto">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Welcome Back!
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h1 className="text-3xl font-bold text-gray-900">
                        Welcome Back
                      </h1>
                      <p className="text-gray-600 mt-2">
                        Select your account type to continue
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className={labelClasses}>
                        I am signing in as:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            value: "attendee",
                            label: "Event Attendee",
                            description: "Discover and attend events",
                          },
                          {
                            value: "organizer",
                            label: "Event Organizer",
                            description: "Create and manage events",
                          },
                        ].map((type) => (
                          <label
                            key={type.value}
                            className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                              userType === type.value
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
                            <span className="font-semibold text-gray-900">
                              {type.label}
                            </span>
                            <span className="text-sm text-gray-600 mt-1">
                              {type.description}
                            </span>
                            {userType === type.value && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center transform scale-110">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                      {errors.userType && (
                        <p className="text-red-600 text-sm mt-2 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.userType.message}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={!userType || isLoading}
                      type="button"
                      className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4 transform hover:scale-105"
                    >
                      <img src={google} alt="Google" className="w-5 h-5 mr-3" />
                      {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        `Continue with Google as ${
                          userType
                            ? userType === "organizer"
                              ? "Organizer"
                              : "Attendee"
                            : "..."
                        }`
                      )}
                    </button>

                    <div className="flex items-center my-6">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-3 text-sm text-gray-500">
                        Or continue with email
                      </span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Enter Your Details
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Sign in as{" "}
                        {userType === "organizer" ? "Organizer" : "Attendee"}
                      </p>
                    </div>

                    {errors.root?.serverError && (
                      <div className={`mb-6 p-4 rounded-lg border ${
                        errors.root.serverError.isUnverified
                          ? "bg-orange-50 border-orange-200"
                          : "bg-red-50 border-red-200"
                      }`}>
                        <p className={`text-sm font-medium flex items-start gap-2 ${
                          errors.root.serverError.isUnverified
                            ? "text-orange-700"
                            : "text-red-600"
                        }`}>
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{errors.root.serverError.message}</span>
                        </p>
                        
                        {errors.root.serverError.isUnverified && (
                          <div className="mt-3 pt-3 border-t border-orange-200">
                            <p className="text-xs text-orange-600 mb-2">
                              Haven't received the verification email? You can:
                            </p>
                            <ul className="text-xs text-orange-600 space-y-1 mb-3">
                              <li>• Check your spam or junk folder</li>
                              <li>• Request a new verification link</li>
                            </ul>
                            <Link
                              to="/resend-verification"
                              className="inline-block px-4 py-2 bg-[#FF6B35] text-white rounded text-xs font-semibold hover:bg-[#FF8535] transition-all"
                            >
                              Request New Verification Email
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className={labelClasses}>
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="Enter your email address"
                            className={`${inputClasses(
                              !!errors.email
                            )} pl-10 pr-4`}
                            aria-invalid={!!errors.email}
                            autoComplete="email"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <X className="w-4 h-4 mr-1" />
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="password" className={labelClasses}>
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="Enter your password"
                            className={`${inputClasses(
                              !!errors.password
                            )} pl-10 pr-10`}
                            aria-invalid={!!errors.password}
                            autoComplete="current-password"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-1"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-sm mt-2 flex items-center">
                            <X className="w-4 h-4 mr-1" />
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              className="w-5 h-5 text-[#FF6B35] focus:ring-[#FF6B35] border-gray-300 rounded transition-colors"
                              disabled={isLoading}
                            />
                            {rememberMe && (
                              <Check className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            Remember me
                          </span>
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-sm text-[#FF6B35] hover:text-[#E55A2B] font-medium transition-colors"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isLoading}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105"
                    >
                      Back
                    </button>
                  )}

                  {currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!userType || isLoading}
                      className="flex-1 py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105 flex items-center justify-center"
                    >
                      Continue with Email
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!isValid || isLoading || !isDirty}
                      className="flex-1 py-3 px-4 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-[#FF8535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-105 flex items-center justify-center"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Signing In...
                        </span>
                      ) : (
                        <>
                          Sign In
                          <LogIn className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>

              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-[#FF6B35] hover:text-[#E55A2B] font-semibold transition-colors underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;