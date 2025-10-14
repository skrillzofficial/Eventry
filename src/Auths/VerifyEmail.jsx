import React, { useEffect, useState, useContext, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const VerifyEmail = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthState } = useContext(AuthContext);
  
  // Use ref to track if verification has been attempted
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple executions
      if (verificationAttempted.current) {
        console.log(" Verification already attempted, skipping...");
        return;
      }

      const token = searchParams.get("token");
      
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification link.");
        return;
      }

      // Mark as attempted immediately
      verificationAttempted.current = true;

      try {
        console.log(" Verifying email with token:", token);

        const response = await axios.get(
          `https://ecommerce-backend-tb8u.onrender.com/api/v1/verify-email?token=${token}`
        );

        console.log("✅ Verification response:", response.data);

        if (response.data.success) {
          const { user, token: authToken } = response.data;

          // Use setAuthState to directly set authentication
          await setAuthState(user, authToken);

          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");

          // Redirect after 2 seconds
          setTimeout(() => {
            if (user.role === "organizer") {
              navigate("/dashboard/organizer", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }, 2000);
        } else {
          throw new Error(response.data.message || "Verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, []); //  Empty dependency array - only run once

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 className="animate-spin text-[#FF6B35] w-16 h-16 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">Please wait while we verify your email address...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="text-green-500 w-16 h-16 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 flex items-center justify-center">
                <span className="animate-pulse">Redirecting to your dashboard</span>
                <span className="ml-2">...</span>
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="text-red-500 w-16 h-16 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 bg-[#FF6B35] text-white rounded-lg font-semibold hover:bg-[#FF8535] transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Login
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Need help?{" "}
              <a href="mailto:support@eventry.com" className="text-[#FF6B35] hover:underline">
                Contact Support
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;