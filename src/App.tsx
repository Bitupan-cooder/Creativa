import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useStore } from './store';
import Navbar from './components/Navbar';
import CreatePostModal from './components/CreatePostModal';
import NotificationPanel from './components/NotificationPanel';
import ConsistencyPanel from './components/ConsistencyPanel';
import AiAssistant from './components/AiAssistant';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Network from './pages/Network';
import Chat from './pages/Chat';
import HireDashboard from './pages/HireDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Ideas from './pages/Ideas';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const location = useLocation();

  if (!user) {
    // Redirect unauthenticated user to login screen, saving history state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Inner Application Layout Layout defining sliders and triggers
function AppLayout() {
  const { user, fetchNotifications, notifications, checkAuth } = useStore();
  const location = useLocation();

  // On mount, verify the session if we have a token in localStorage
  useEffect(() => {
    checkAuth();
  }, []);

  // Overlay sliders states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isConsistencyOpen, setIsConsistencyOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Floating Toast notifications banner state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Poll notifications in container background if logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const ticker = setInterval(fetchNotifications, 15000);
      return () => clearInterval(ticker);
    }
  }, [user]);

  // Sync state if active notification of high priority arrives
  const activeUnreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    if (activeUnreadCount > 0) {
      // Play brief haptic tone or notify
    }
  }, [activeUnreadCount]);

  return (
    <div className="min-h-screen bg-[#fbfafb] text-[#1c1b22] flex flex-col font-sans transition-all">
      <Helmet>
        <title>Creativa | Portfolio & Networking</title>
        <meta name="description" content="Discover creative professionals and their inspiring work" />
        <meta property="og:title" content="Creativa | Portfolio & Networking" />
        <meta property="og:description" content="Discover creative professionals and their inspiring work" />
        <meta property="twitter:title" content="Creativa | Portfolio & Networking" />
      </Helmet>

      {/* Toast Banner overlay */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-55 bg-gray-950 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-lg border border-red-500/20 animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onToggleNotifDrawer={() => setIsNotifOpen(!isNotifOpen)}
        onOpenAiAssistant={() => setIsAiOpen(true)}
        onToggleConsistencyDrawer={() => setIsConsistencyOpen(!isConsistencyOpen)}
      />

      {/* Main Content viewport container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 pt-20 pb-12">
        <Routes>
          {/* Public authentication flows */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Secure protected professional features */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ideas"
            element={
              <ProtectedRoute>
                <Ideas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hire-dashboard"
            element={
              <ProtectedRoute>
                <HireDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback wildcard router */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Discovery creation post modal */}
      <CreatePostModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onShowToast={triggerToast}
      />

      {/* Sliding notifications drawer */}
      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Creator Consistency sidebar drawer */}
      <ConsistencyPanel
        isOpen={isConsistencyOpen}
        onClose={() => setIsConsistencyOpen(false)}
      />

      {/* Sliding AI mentor chat workspace */}
      <AiAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </HelmetProvider>
  );
}
