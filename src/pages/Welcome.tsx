import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-950">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      {/* Centered Glassmorphism Card */}
      <div className="h-screen w-screen flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-lg mx-auto backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 md:p-12">
          {/* Title with Gradient */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Fitness Challenge Tracker
          </h1>

          {/* Quote Section */}
          <div className="text-center mb-10">
            <p className="text-lg md:text-xl text-gray-200 mb-4 leading-relaxed font-light italic">
              "The only bad workout is the one that didn't happen..."
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-px bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <span className="text-purple-400 font-semibold tracking-wide">Stay Committed</span>
              <div className="w-10 h-px bg-gradient-to-r from-purple-500 to-blue-500"></div>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-10 py-4 border-2 border-purple-400/50 hover:border-purple-400 hover:bg-purple-400/10 text-purple-300 hover:text-white font-bold text-lg rounded-xl backdrop-blur-sm transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Login
            </button>
          </div>

          {/* Decorative Bottom Line */}
          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};

export default Welcome;
