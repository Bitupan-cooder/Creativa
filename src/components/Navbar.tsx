import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { Search, Flame, Bell, LogOut, Bot, User, Briefcase, Plus, Menu } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  onOpenUpload: () => void;
  onToggleNotifDrawer: () => void;
  onOpenAiAssistant: () => void;
  onToggleConsistencyDrawer: () => void;
}

export default function Navbar({ onOpenUpload, onToggleNotifDrawer, onOpenAiAssistant, onToggleConsistencyDrawer }: NavbarProps) {
  const { user, logout, notifCount, searchQuery, setSearchQuery, feedLoading } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSearchExpanded = searchExpanded || localQuery.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery, searchQuery, setSearchQuery]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-red-500/15 py-3 h-16 px-4 md:px-12 flex justify-between items-center transition-all">
      {/* Brand logo & main routes */}
      <div className="flex items-center gap-8">
        <Link to="/" className="font-display font-black text-2xl tracking-tight text-gray-950 transition-all hover:text-red-600 flex items-center">
          <span className="text-liquid">CR</span>
          <span>eativa</span>
        </Link>
        {user && (
          <div className="hidden md:flex items-center gap-6 ml-4">
            <Link
              to="/"
              className={`font-medium transition-all py-1 border-b-2 text-sm ${
                isActive('/')
                  ? 'text-primary border-primary font-semibold'
                  : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              Discovery
            </Link>
            <Link
              to="/network"
              className={`font-medium transition-all py-1 border-b-2 text-sm ${
                isActive('/network')
                  ? 'text-primary border-primary font-semibold'
                  : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              Network
            </Link>
            <Link
              to="/ideas"
              className={`font-medium transition-all py-1 border-b-2 text-sm ${
                isActive('/ideas')
                  ? 'text-primary border-primary font-semibold'
                  : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              Ideas
            </Link>
            <Link
              to="/chat"
              className={`font-medium transition-all py-1 border-b-2 text-sm ${
                isActive('/chat')
                  ? 'text-primary border-primary font-semibold'
                  : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              Chat
            </Link>
            <Link
              to="/hire-dashboard"
              className={`font-medium transition-all py-1 border-b-2 text-sm ${
                isActive('/hire-dashboard')
                  ? 'text-primary border-primary font-semibold'
                  : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              Jobs Workspace
            </Link>
          </div>
        )}
      </div>

      {/* User profile controls & search */}
      <div className="flex items-center gap-3">
        {/* Search query */}
        <div 
          className="relative mr-2 flex items-center justify-end h-8"
          onMouseEnter={() => setSearchExpanded(true)}
          onMouseLeave={() => {
            if (document.activeElement !== searchInputRef.current) {
              setSearchExpanded(false);
            }
          }}
        >
          <div
            className={`absolute z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 pointer-events-none ${
               isSearchExpanded ? 'left-1 text-primary' : 'right-0 text-gray-500'
            }`}
          >
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setSearchExpanded(true)}
            onBlur={() => setSearchExpanded(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/');
                searchInputRef.current?.blur();
              }
            }}
            placeholder={isSearchExpanded ? "Search creatives..." : ""}
            className={`h-full bg-red-50/40 text-xs text-gray-800 rounded-full border placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-500 ease-out origin-right pl-9 pr-4 ${
              isSearchExpanded 
                ? 'w-40 sm:w-48 lg:w-64 border-red-100 opacity-100 cursor-text shadow-sm bg-white' 
                : 'w-8 border-transparent opacity-0 sm:opacity-100 bg-transparent cursor-pointer !pl-0 !pr-0'
            }`}
          />
          
          {/* Skeleton Search Results Dropdown */}
          {searchExpanded && localQuery.trim().length > 0 && feedLoading && (
            <div className="absolute top-10 right-0 mt-1 w-64 bg-white rounded-xl border border-gray-100 shadow-2xl overflow-hidden py-2 z-50">
              <div className="px-3 pb-1 pt-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Searching Network...
              </div>
              <div className="space-y-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                    <div className="w-8 h-8 bg-gray-100 rounded-md flex-shrink-0 border border-gray-50/50"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-50 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <>
            {/* Upload project quick CTA */}
            <button
              onClick={onOpenUpload}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-xs font-semibold text-white rounded-full hover:bg-opacity-90 transition-all shadow-sm leading-none"
              title="Publish New Work"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publish</span>
            </button>

            {/* Consistency & Leaderboard Flame tracker trigger button */}
            <button
              onClick={onToggleConsistencyDrawer}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all flex items-center gap-0.5"
              title="View Creator Streak & Leaderboard"
            >
              <Flame className="w-4.5 h-4.5 fill-current text-red-600 animate-pulse" />
              {user && (
                <span className="text-[11px] font-black tracking-tight text-gray-900 select-none">
                  {(user as any).streakDays !== undefined ? (user as any).streakDays : 4} 🔥
                </span>
              )}
            </button>

            {/* Notification triggers */}
            <button
              onClick={onOpenAiAssistant}
              className="p-2 text-gray-500 hover:text-primary hover:bg-red-50 rounded-full transition-all"
              title="AI Foundry IQ Copilot"
            >
              <Bot className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onToggleNotifDrawer}
              className="relative p-2 text-gray-500 hover:text-primary hover:bg-red-50 rounded-full transition-all"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm scale-bounce">
                  {notifCount}
                </span>
              )}
            </button>

            {/* Own profile link button */}
            <Link
              to={`/profile/${user.username}`}
              className="w-8 h-8 rounded-full overflow-hidden border border-red-100 flex-shrink-0 hover:border-primary transition-all flex items-center justify-center bg-red-50/20"
              title="My Portfolio Grid"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile photo" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </Link>

            {/* Logout button */}
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-status-coral hover:bg-red-50 rounded-full transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-500 text-sm font-medium hover:text-primary py-1.5 px-3">
              Login
            </Link>
            <Link to="/register" className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-opacity-90 shadow-sm transition-all">
              Join Network
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
