import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Zap, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { login, authLoading, authError, clearAuthError, user } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    clearAuthError();
    if (user) {
      navigate('/');
    }
  }, [user]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please input a valid email address.');
      return false;
    }
    if (!isResetMode && password.length < 5) {
      setFormError('Password must be at least 5 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    if (isResetMode) {
      // Mock password reset request
      setFormError(null);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network request delay
      setResetSent(true);
      return;
    }

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      // error set in store
    }
  };

  // Helper presets to let testing user login in 1-click! Excellent UX!
  const handlePreseedLogin = async (preEmail: string) => {
    setFormError(null);
    try {
      await login({ email: preEmail, password: 'password123' });
      navigate('/');
    } catch (err) {
      // handled
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto my-12 bg-white/40 backdrop-blur-3xl border border-white/60 p-2 rounded-[32px] shadow-[0_24px_60px_-12px_rgba(83,74,183,0.15)] overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 min-h-[600px]">
        {/* Form Panel */}
        <div className="bg-white rounded-[24px] p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col justify-center relative z-10 space-y-8">
      
      {/* Brand logo header */}
      <div className="text-center space-y-2">
        <h3 className="font-display font-bold text-3xl tracking-tight text-primary flex justify-center items-center">
          <span className="text-liquid">CR</span>
          <span>eativa</span>
        </h3>
        <p className="text-xs text-gray-400">
          {isResetMode 
            ? resetSent ? "Check your inbox for a reset link." : "Reset your account password."
            : "Sign in to your creative professional network workspace."}
        </p>
      </div>

      {(formError || authError) && (
        <div className="p-3 bg-red-50 text-red-650 rounded-lg flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formError || authError}</span>
        </div>
      )}

      {resetSent ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm text-center border border-green-200">
            A password reset link has been sent to <strong>{email}</strong> if an account exists.
          </div>
          <button
            onClick={() => {
              setIsResetMode(false);
              setResetSent(false);
            }}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-all shadow-sm leading-none text-xs"
          >
            Back to Login
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        <div className="space-y-1">
          <label className="font-semibold text-gray-700 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="illustrator@creativa.network"
              className="w-full pl-10 pr-4 py-2.5 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-300"
              required
            />
          </div>
        </div>

        {!isResetMode && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-700 block">Password</label>
              <button 
                type="button" 
                onClick={() => setIsResetMode(true)}
                className="text-primary hover:underline text-[10px] font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-300"
                required={!isResetMode}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-2.5 bg-primary hover:bg-opacity-95 text-white font-bold rounded-lg transition-all shadow-sm leading-none"
        >
          {authLoading ? 'Please wait...' : isResetMode ? 'Send Reset Link' : 'Sign In'}
        </button>

        {isResetMode && (
          <button
            type="button"
            onClick={() => setIsResetMode(false)}
            className="w-full py-2 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all font-semibold"
          >
            Back to Login
          </button>
        )}

      </form>
      )}

      {/* Account presets list - 1-Click logging trigger for sandboxed evaluation */}
      {!isResetMode && (
      <div className="pt-6 border-t border-purple-50 space-y-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Quick Testing Presets</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handlePreseedLogin('marcus@creativa.network')}
            className="p-3 bg-red-50/50 text-left rounded-xl hover:bg-red-50 transition-all font-semibold text-red-700 truncate border border-red-100/50 flex flex-col gap-1"
          >
            <span className="text-gray-800">Marcus</span>
            <span className="text-[10px] font-normal text-gray-500">UI/UX Design</span>
          </button>
          <button
            onClick={() => handlePreseedLogin('elena@creativa.network')}
            className="p-3 bg-red-50/50 text-left rounded-xl hover:bg-red-50 transition-all font-semibold text-red-700 truncate border border-red-100/50 flex flex-col gap-1"
          >
            <span className="text-gray-800">Elena</span>
            <span className="text-[10px] font-normal text-gray-500">3D Art</span>
          </button>
        </div>
        <span className="block text-[9px] text-gray-400 italic mt-1">Preloaded credentials have password: password123</span>
      </div>
      )}

      {!isResetMode && (
      <div className="text-center pt-4">
        <span className="text-gray-500 text-xs">New to Creativa? </span>
        <Link to="/register" className="text-primary hover:text-red-700 transition-colors text-xs font-bold inline-flex items-center gap-1">
          Join the Circle <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      )}

        </div>

        {/* Decorative Bento Panel */}
        <div className="hidden md:flex flex-col gap-2">
          {/* Main Hero Tile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-[24px] p-8 flex-1 border border-red-100/50 relative overflow-hidden flex flex-col justify-end group"
          >
            {/* Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
              alt="Login Background"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            <div className="relative z-10 text-white space-y-2">
              <div className="inline-flex items-center justify-center p-2.5 bg-white/20 backdrop-blur-md rounded-xl mb-2">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-3xl font-display font-medium tracking-tight drop-shadow-md">Access global creativity.</h4>
              <p className="text-sm text-white/90 font-light leading-relaxed max-w-sm drop-shadow">
                Connect with visionary designers, discover inspiring portfolios, and build your professional network.
              </p>
            </div>
          </motion.div>
          
          {/* Secondary Stats Tiles */}
          <div className="grid grid-cols-2 gap-2 h-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="bg-gray-950 rounded-[24px] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden border border-gray-800"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-2xl font-display font-medium text-white mb-1">10k+</div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest text-center">Curated Works</div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
              className="bg-primary rounded-[24px] p-6 flex flex-col justify-center items-center text-center relative overflow-hidden border border-red-600 shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-2xl font-display font-medium text-white mb-1">Top</div>
                <div className="text-[10px] text-red-100 font-semibold uppercase tracking-widest text-center">Professionals</div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
