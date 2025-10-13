import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        console.log('Verifying token:', token);
        const response = await axios.get(
          `https://ecommerce-backend-tb8u.onrender.com/api/v1/verify-email?token=${token}`
        );

        console.log('Verification response:', response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));

          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        console.error('Error response:', error.response?.data);
        
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          error.response?.data?.error ||
          'Email verification failed. The link may be invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    setStatus('resending');
    const email = prompt('Please enter your email address:');
    if (!email) {
      setStatus('error');
      return;
    }

    try {
      const response = await axios.post(
        `https://ecommerce-backend-tb8u.onrender.com/api/v1/resend-verification`,
        { email }
      );

      if (response.data.success) {
        setStatus('resent');
        setMessage('Verification email sent! Please check your inbox and click the new link.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to resend email');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4 py-8">
      <div className="w-11/12 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center mr-3">
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Eventry</h1>
          </div>
          <p className="text-gray-600">Your gateway to amazing events</p>
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Loader className="h-16 w-16 text-[#FF6B35] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#FF6B35] rounded-full"></div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <span className="font-semibold">Welcome to Eventry!</span> You'll be redirected to your dashboard shortly.
                </p>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Redirecting to dashboard...
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  className="w-full bg-[#FF6B35] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105 flex items-center justify-center"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Resend Verification Email
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors transform hover:scale-105 flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {status === 'resending' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Loader className="h-16 w-16 text-[#FF6B35] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-[#FF6B35]" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Sending Verification Email
              </h2>
              <p className="text-gray-600">Please wait while we send a new verification link...</p>
            </div>
          )}

          {status === 'resent' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Email Sent Successfully!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <span className="font-semibold">Check your inbox:</span> Look for an email from Eventry and click the verification link.
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#FF6B35] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#FF8535] transition-colors transform hover:scale-105"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;