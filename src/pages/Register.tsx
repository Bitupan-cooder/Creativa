import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Briefcase, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Register() {
  const { register, authLoading, authError, clearAuthError, user } = useStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('Illustration');
  const [formError, setFormError] = useState<string | null>(null);

  // Clear errors on mount
  useEffect(() => {
    clearAuthError();
    if (user) {
      navigate('/');
    }
  }, [user]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (username.length < 3) {
      setFormError('Username must be at least 3 characters long.');
      return false;
    }
    if (displayName.length < 3) {
      setFormError('Display name must be at least 3 characters long.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setFormError('Please input a valid email address.');
      return false;
    }
    if (password.length < 5) {
      setFormError('Password must be at least 5 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    try {
      await register({
        username: username.toLowerCase().trim(),
        displayName,
        email,
        password,
        category
      });
      navigate('/');
    } catch (err) {
      // Set by store
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
        {/* Decorative Bento Panel */}
        <div className="hidden md:flex flex-col gap-2">
          {/* Main Hero Tile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="bg-gray-950 rounded-[24px] p-8 flex-1 border border-gray-800 relative overflow-hidden flex flex-col justify-end group"
          >
            {/* Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay transition-transform duration-1000 group-hover:scale-105"
              alt="Register Background"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="relative z-10 text-white space-y-2">
              <div className="inline-flex items-center justify-center p-2.5 bg-white/10 backdrop-blur-md rounded-xl mb-2 border border-white/10">
                <User className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-3xl font-display font-medium tracking-tight drop-shadow-md">Your digital studio.</h4>
              <p className="text-sm text-gray-200 font-light leading-relaxed max-w-sm drop-shadow">
                Create a stunning portfolio, discover exceptional individuals, and manage your artistic career natively.
              </p>
            </div>
          </motion.div>
          
          {/* Secondary Features Tile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            className="bg-white rounded-[24px] p-6 text-left relative overflow-hidden border border-gray-100 flex items-center justify-between"
          >
            <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
               <div className="text-sm font-semibold text-gray-900 mb-1">Portfolio Validation</div>
               <div className="text-xs text-gray-500 max-w-[200px]">Peer-reviewed network for authenticity and professional growth.</div>
            </div>
            <div className="relative z-10 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
               <Globe className="w-4 h-4 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-[24px] p-8 lg:p-12 shadow-sm border border-gray-100 flex flex-col justify-center relative z-10 space-y-8">
      
      {/* Brand logo header */}
      <div className="text-center space-y-1.5 animate-fade-in">
        <h3 className="font-display font-bold text-3xl tracking-tight text-primary flex justify-center items-center">
          <span className="text-liquid">CR</span>
          <span>eativa</span>
        </h3>
        <p className="text-xs text-gray-400">Join the premium creative professional network circle.</p>
      </div>

      {(formError || authError) && (
        <div className="p-3 bg-red-50 text-red-650 rounded-lg flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 animate-bounce" />
          <span>{formError || authError}</span>
        </div>
      )}

      {/* Register form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Username ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ankit_dev"
                className="w-full pl-10 pr-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ankit Sharma"
              className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-300"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="illustrator@creativa.net"
              className="w-full pl-10 pr-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-300"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-400"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700 block">Primary Creative Field</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 text-xs"
            >
              <option value="Illustration">Illustration Focus</option>
              <option value="3D & Motion">3D & Motion Renderings</option>
              <option value="UI/UX">UI/UX Interface designing</option>
              <option value="Photography">Photography Capture</option>
              <option value="Graphic Design">Graphic Designing</option>
              <option value="Typography">Typography Accents</option>
              <option value="Branding">Corporate Branding</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-2.5 bg-primary hover:bg-opacity-95 text-white font-bold rounded-lg transition-all shadow-sm leading-none"
        >
          {authLoading ? 'Registering...' : 'Register Workspace account'}
        </button>

      </form>

      <div className="text-center pt-4 border-t border-gray-50">
        <span className="text-gray-500 text-xs">Already have an account? </span>
        <Link to="/login" className="text-primary hover:text-red-700 transition-colors text-xs font-bold inline-flex items-center gap-1">
          Sign In <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

        </div>
      </div>
    </motion.div>
  );
}
