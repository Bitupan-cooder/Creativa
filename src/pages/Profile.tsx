import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore, apiRequest } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Mail, Star, Edit3, CheckCheck, Map, Clock, AlertCircle, Heart, MessageSquare, Repeat, Eye, Plus, Sparkles, Loader2, Flame, Camera, Zap, Trash2, Bookmark, Settings } from 'lucide-react';
import HireModal from '../components/HireModal';
import SaveToBoardModal from '../components/SaveToBoardModal';
import ShareModal from '../components/ShareModal';
import SettingsModal from '../components/SettingsModal';

function PostImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80'
  ];

  const handleError = () => {
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    setCurrentSrc(randomFallback);
  };

  React.useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      handleError();
    }
  }, [currentSrc]);

  return (
    <>
      {!isLoaded && (
        <div className="w-full h-[250px] bg-gray-100 animate-pulse flex items-center justify-center border-b border-gray-100">
        </div>
      )}
      <img
        ref={imgRef}
        referrerPolicy="no-referrer"
        src={currentSrc}
        alt={alt}
        className={`${className} ${!isLoaded ? 'hidden' : 'block'}`}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />
    </>
  );
}

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser, token, updateProfile, likePost, repostPost } = useStore();

  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [profileScrollLoading, setProfileScrollLoading] = useState(false);
  const [connStatus, setConnStatus] = useState('none');
  const [connId, setConnId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hire flow overlay state
  const [isHireOpen, setIsHireOpen] = useState(false);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editHireRate, setEditHireRate] = useState('');
  const [editOpenToWork, setEditOpenToWork] = useState(false);
  const [editOpenToCollab, setEditOpenToCollab] = useState(false);
  const [editCover, setEditCover] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Post Actions Modal state
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [postToEdit, setPostToEdit] = useState<{ id: string, caption: string } | null>(null);
  const [editPostCaption, setEditPostCaption] = useState('');
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [postToSave, setPostToSave] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'boards'>('portfolio');

  // Pre-built customizable banner presets
  const coverPresets = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=80'
  ];

  const fetchProfileDetails = async () => {
    if (!token || !username) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiRequest(`/api/users/${username}`, 'GET', undefined, token);
      setProfileUser(data.user);
      setPosts(data.posts);
      setConnStatus(data.connectionStatus);
      setConnId(data.connectionId);

      // Pre-populate edit boxes
      setEditDisplayName(data.user.displayName || '');
      setEditBio(data.user.bio || '');
      setEditLocation(data.user.location || 'Remote');
      setEditSkills(data.user.skills?.join(', ') || '');
      setEditCategory(data.user.category || 'Illustration');
      setEditHireRate(data.user.hireRate || '$50/hr');
      setEditOpenToWork(data.user.openToWork || false);
      setEditOpenToCollab(data.user.openToCollab || false);
      setEditCover(data.user.coverImage || coverPresets[0]);
      setEditAvatar(data.user.avatar || '');

      useStore.getState().fetchBoards(data.user.id);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Creative professional profile not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [username]);

  useEffect(() => {
    const handleScroll = () => {
      if (visibleCount >= posts.length || profileScrollLoading) return;
      const threshold = 150;
      const totalHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
      const scrollPosition = window.innerHeight + scrollTop;

      if (totalHeight - scrollPosition <= threshold) {
        setProfileScrollLoading(true);
        setVisibleCount((prev) => Math.min(prev + 3, posts.length));
        setTimeout(() => {
          setProfileScrollLoading(false);
        }, 150); // small lock time to allow layout to settle before the next increment
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, posts, profileScrollLoading]);

  const handleConnect = async () => {
    if (!token || !profileUser) return;
    try {
      await apiRequest(`/api/connections/request/${profileUser.id}`, 'POST', {}, token);
      setConnStatus('pending_sent');
    } catch (e) {
      console.error(e);
    }
  };

  const handleMessage = () => {
    // Jump straight into conversation channel
    navigate('/chat', { state: { recipientId: profileUser.id } });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: editDisplayName,
      bio: editBio,
      location: editLocation,
      skills: editSkills.split(',').map((s) => s.trim()).filter(Boolean),
      category: editCategory,
      hireRate: editHireRate,
      openToWork: editOpenToWork,
      openToCollab: editOpenToCollab,
      coverImage: editCover,
      avatar: editAvatar
    });
    setIsEditing(false);
    fetchProfileDetails();
  };

  const handleLikePost = async (postId: string) => {
    await likePost(postId);
    // Refresh list locally
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const liked = p.likes.includes(authUser!.id);
          const next = liked ? p.likes.filter((id: string) => id !== authUser!.id) : [...p.likes, authUser!.id];
          return { ...p, likes: next };
        }
        return p;
      })
    );
  };

  const handleDeletePost = async () => {
    if (!token || !authUser || !postToDelete) return;
    try {
      await useStore.getState().deletePost(postToDelete);
      setPostToDelete(null);
    } catch (e: any) {
      alert(e.message || 'Error deleting post');
      console.error(e);
    }
  };

  const submitEditPost = async () => {
    if (!token || !authUser || !postToEdit) return;
    try {
      await useStore.getState().editPost(postToEdit.id, { caption: editPostCaption });
      setPostToEdit(null);
    } catch (e: any) {
      alert(e.message || 'Error editing post');
      console.error(e);
    }
  };

  const handleRepostPost = async (postId: string) => {
    try {
      await repostPost(postId);
      fetchProfileDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isOwnProfile = authUser?.username === username;

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Helmet><title>Creativa | Loading Profile...</title></Helmet>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="text-xs text-gray-450 font-medium font-sans">Connecting portfolio database pipeline...</span>
      </div>
    );
  }

  if (errorMsg || !profileUser) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-status-coral mx-auto" />
        <h4 className="font-display font-medium text-lg text-gray-900">Portfolio Catalog Off-Grid</h4>
        <p className="text-xs text-gray-500 leading-normal">{errorMsg || 'The creative user database record could not be resolved.'}</p>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-primary text-white font-semibold text-xs rounded-lg shadow-sm">
          Return to Discovery Wall
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>{profileUser.displayName} | Creativa Portfolio</title>
        <meta name="description" content={profileUser.bio || "Check out this creative portfolio on Creativa"} />
        <meta property="og:title" content={`${profileUser.displayName} | Creativa`} />
        <meta property="og:description" content={profileUser.bio || "Check out this creative portfolio on Creativa"} />
        {profileUser.avatar && <meta property="og:image" content={profileUser.avatar} />}
        <meta property="twitter:title" content={`${profileUser.displayName} | Creativa`} />
      </Helmet>
      
      {/* Portfolio Header Canvas */}
      <div className="relative rounded-[24px] overflow-hidden bg-white border border-red-500/10 shadow-[0_4px_12px_rgba(220,38,38,0.03)]">
        
        {/* Cover Canvas Banner */}
        <div className="h-44 w-full bg-red-50/20 relative">
          <img src={profileUser.coverImage || coverPresets[0]} className="w-full h-full object-cover" alt="Banner cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Profile Card Specs */}
        <div className="px-6 pb-6 relative pt-12">
          
          {/* Avatar frame */}
          <div 
            className={`absolute -top-12 left-6 w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-purple-100 shadow-sm ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <img src={isEditing ? (editAvatar || profileUser.avatar) : profileUser.avatar} className="w-full h-full object-cover" alt="Avatar" />
            
            {isEditing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold">Change</span>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            
            {/* Core credentials */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-xl text-gray-950 leading-none">{profileUser.displayName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary-light text-primary text-[9px] font-bold uppercase tracking-wider">
                  {profileUser.category}
                </span>
                
                {profileUser.openToWork && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-100 text-status-teal text-[9px] font-bold uppercase tracking-wider">
                    ● open to work
                  </span>
                )}
                {profileUser.openToCollab && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-status-coral text-[9px] font-bold uppercase tracking-wider">
                    ● open to collab
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-650 max-w-xl leading-relaxed font-sans font-normal italic">
                "{profileUser.bio || 'This creative professional is yet to set a bio dialogue.'}"
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400 font-medium pt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profileUser.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Rate: {profileUser.hireRate || '$50/hr'}</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100 text-orange-600 font-bold text-[10px]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{profileUser.rating?.toFixed(1) || '5.0'} rating</span>
                </div>
                
                <div className="flex items-center gap-1 bg-gradient-to-r from-red-50 to-rose-100 border border-red-200/50 px-2.5 py-0.5 rounded text-red-600 font-black text-[10px]" title="Creativa posting streak">
                  <Flame className="w-3.5 h-3.5 fill-current text-red-600 animate-pulse" />
                  <span>{profileUser.streakDays || 0} Day Streak 🔥</span>
                </div>

                {/* Visual Consistency / Activity Levels Summary */}
                <div className="flex items-center gap-1 ml-1 pl-3 border-l border-gray-200" title="Weekly Activity">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, ix) => {
                    const todayIdx = (new Date().getDay() + 6) % 7;
                    const isToday = ix === todayIdx;
                    let isChecked = false;
                    if (ix < todayIdx) {
                      isChecked = true; 
                    } else if (ix === todayIdx) {
                      isChecked = !!profileUser.checkedInToday;
                    }
                    
                    return (
                      <div 
                        key={ix} 
                        className={`w-2.5 h-2.5 rounded-sm ${
                          isChecked 
                            ? 'bg-red-500 shadow-[0_0_2px_rgba(239,68,68,0.5)]' 
                            : 'bg-gray-200'
                        } ${isToday ? 'ring-[1.5px] ring-red-300 ring-offset-1' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CTA panel buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-start">
              {isOwnProfile ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 hover:bg-primary hover:text-white border border-primary text-primary font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                    title="Platform Settings & Support"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Connect button - LinkedIn flow */}
                  {connStatus === 'connected' ? (
                    <button
                      onClick={handleMessage}
                      className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-opacity-95 shadow-sm transition-all flex items-center gap-1"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  ) : connStatus === 'pending_sent' ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-purple-50 border border-purple-150 text-gray-400 font-semibold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Pending Sent</span>
                    </button>
                  ) : connStatus === 'pending_received' ? (
                    <button
                      onClick={() => navigate('/network')}
                      className="px-4 py-2 bg-status-teal text-white font-bold text-xs rounded-xl hover:bg-opacity-95 flex items-center gap-1 shadow-sm"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Review Request</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="px-4 py-2 bg-primary text-white font-semibold text-xs rounded-xl hover:bg-opacity-95 shadow-sm transition-all"
                    >
                      Connect
                    </button>
                  )}

                  {/* Hire button trigger - accessible if recruiter & creative open-to-work */}
                  {profileUser.openToWork && (
                    <button
                      onClick={() => setIsHireOpen(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-650 to-indigo-650 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 bg-[#8a4900]!"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Hire Creative</span>
                    </button>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Render Skills pill chips */}
          {profileUser.skills && profileUser.skills.length > 0 && (
            <div className="mt-4 border-t border-purple-50/50 pt-3">
              <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase mb-1.5">Expertise Tags</span>
              <div className="flex gap-1.5 flex-wrap">
                {profileUser.skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-gray-600 rounded-md border border-purple-100/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Editor Panel Drawer */}
      {isOwnProfile && isEditing && (
        <form onSubmit={handleSaveProfile} className="p-6 bg-white border border-purple-100 rounded-2xl shadow-sm space-y-4 text-xs">
          <h4 className="font-display font-semibold text-gray-900 text-sm border-b border-purple-50 pb-2 flex items-center gap-2">
            <Edit3 className="w-4.5 h-4.5 text-primary" />
            Update Workspace Credentials
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 block">Display Name</label>
              <input
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 block">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 block">Category Focus</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
              >
                <option value="Illustration">Illustration</option>
                <option value="3D & Motion">3D & Motion</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Branding">Branding</option>
                <option value="Photography">Photography</option>
                <option value="Graphic Design">Graphic Design</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 block">Hire Hourly/Flat Rate</label>
              <input
                type="text"
                value={editHireRate}
                onChange={(e) => setEditHireRate(e.target.value)}
                className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Personal Profile Bio dialogue</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Expertise (comma-separated)</label>
            <input
              type="text"
              value={editSkills}
              onChange={(e) => setEditSkills(e.target.value)}
              placeholder="UI/UX, Figma, Web Design, Adobe Illustrator"
              className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
            />
          </div>

          {/* Cover presets selector */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 block">Choose Canvas Banner background:</label>
            <div className="flex gap-2">
              {coverPresets.map((bg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEditCover(bg)}
                  className={`h-11 w-20 rounded-md overflow-hidden border-2 transition-all ${
                    editCover === bg ? 'border-primary scale-95 shadow-sm' : 'border-transparent opacity-80'
                  }`}
                >
                  <img src={bg} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Status Switches */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-750">
              <input
                type="checkbox"
                checked={editOpenToWork}
                onChange={(e) => setEditOpenToWork(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4 border-purple-200"
              />
              <span>Open to professional hire job inquiries</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-750">
              <input
                type="checkbox"
                checked={editOpenToCollab}
                onChange={(e) => setEditOpenToCollab(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4 border-purple-200"
              />
              <span>Available for active collaboration boarding</span>
            </label>
          </div>

          {/* Submission button */}
          <button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm">
            Save Credentials Changes
          </button>
        </form>
      )}


      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-2 rounded-none px-2 font-semibold text-sm transition-all ${
            activeTab === 'portfolio' ? 'border-b-2 border-red-600 text-gray-900' : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'
          }`}
        >
          Creative Portfolio
        </button>
        <button
          onClick={() => setActiveTab('boards')}
          className={`pb-2 rounded-none px-2 font-semibold text-sm transition-all ${
            activeTab === 'boards' ? 'border-b-2 border-red-600 text-gray-900' : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'
          }`}
        >
          Boards
        </button>
      </div>

      {activeTab === 'portfolio' && (
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-purple-50 pb-2">
          <h3 className="font-display font-semibold text-sm text-gray-950">Creative Portfolio Grid</h3>
          <span className="text-[10px] text-gray-400 font-semibold">{posts.length} design files</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-purple-100 rounded-2xl bg-white text-gray-500 space-y-2">
            <span className="text-3xl">🏜️</span>
            <p className="text-xs font-semibold">Portfolio is vacant</p>
            {isOwnProfile ? (
              <p className="text-[10px] leading-relaxed">Publish your first design slice from Navbar above to showcase your brilliance!</p>
            ) : (
              <p className="text-[10px]">This creative user has not published items to display yet.</p>
            )}
          </div>
        ) : (
          Array.from(new Set(posts.map(p => p.category))).map(category => (
            <section key={category} className="mb-10">
              <div className="flex justify-between items-center border-b border-purple-50 pb-2 mb-4">
                <h3 className="font-display font-semibold text-sm text-gray-950">{category}</h3>
                <span className="text-[10px] text-gray-400 font-semibold">{posts.filter(p => p.category === category).length} design files</span>
              </div>
              <div className="columns-1 sm:columns-2 md:columns-3 gap-6">
                {posts
                  .filter(p => p.category === category)
                  .slice(0, visibleCount)
                  .map((post) => (
                  <div
                    key={post.id}
                    className="break-inside-avoid mb-6 flex flex-col group"
                  >
                    {/* Image Frame with hover action overlays */}
                    <div className="relative rounded-[20px] overflow-hidden border border-gray-150 shadow-sm shadow-red-500/5 bg-[#f5f5f5] cursor-pointer">
                      <PostImage src={post.mediaUrl} alt="portfolio Cover" className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300" />
    
                      {/* Cover Hover actions */}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-205 flex flex-col justify-between p-3.5">
                        <div className="flex justify-end gap-2">
                          {authUser?.id === post.authorId && (
                            <>
                              <button
                                onClick={(e) => { e.preventDefault(); setPostToEdit({ id: post.id, caption: post.caption }); setEditPostCaption(post.caption); }}
                                className="p-2 rounded-full bg-white/95 hover:bg-purple-50 text-gray-800 hover:text-purple-600 transition-colors shadow-sm"
                                title="Edit Description"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); setPostToDelete(post.id); }}
                                className="p-2 rounded-full bg-white/95 hover:bg-red-50 text-gray-800 hover:text-red-600 transition-colors shadow-sm"
                                title="Delete Post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); handleLikePost(post.id); }}
                            className="p-2 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 transition-colors shadow-sm"
                            title="Like"
                          >
                            <Heart className={`w-3.5 h-3.5 ${post.likes.includes(authUser!.id) ? 'fill-current text-red-600' : ''}`} />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setPostToSave(post.id); setIsSaveModalOpen(true); }}
                            className="p-2 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 shadow-sm transition-all hover:scale-110"
                            title="Save to Board"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setPostToShare(post.id); setIsShareModalOpen(true); }}
                            className="p-2 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 shadow-sm transition-all hover:scale-110"
                            title="Share Link"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                          </button>
                        </div>
    
                        <div className="flex justify-between items-center bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-[10px] text-white font-semibold">
                          <span className="uppercase text-[8px] text-red-200 font-bold tracking-wider">{post.category}</span>
                          <div className="flex gap-2">
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3 text-red-250" />
                              {post.comments?.length || 0}
                            </span>
                            <button onClick={(e) => { e.preventDefault(); handleRepostPost(post.id); }} className="hover:text-red-200 flex items-center gap-0.5" title="Repost onto your grid">
                              <Repeat className="w-3.5 h-3.5 text-red-250" />
                              {post.reposts?.length || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
    
                    {/* Caption description & interactions below card */}
                    <h4 className="font-sans font-bold text-sm text-gray-950 leading-snug line-clamp-1 mt-2.5 px-0.5">
                      {post.caption || 'Concept Artwork'}
                    </h4>
    
                    <div className="flex justify-between items-center mt-1 px-0.5 text-[10px] text-gray-450 font-medium">
                      <span className="text-gray-500 font-semibold">{post.category}</span>
                      <div className="flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span>{post.views * 10} views</span>
                      </div>
                    </div>
    
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      )}

      {activeTab === 'boards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useStore.getState().boards.length === 0 ? (
              <p className="text-gray-500 text-sm max-w-[200px] col-span-3">No boards found.</p>
            ) : (
              useStore.getState().boards.map((board) => (
                <div key={board.id} className="p-4 border border-gray-150 rounded-xl bg-white shadow-sm flex flex-col gap-2">
                  <h4 className="font-bold text-gray-900">{board.title}</h4>
                  <span className="text-xs text-gray-500">{board.isPublic ? 'Public' : 'Private'} • {board.posts?.length || 0} posts saved</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Hire Modal overlay */}
      <HireModal
        creativeId={profileUser.id}
        creativeName={profileUser.displayName}
        isOpen={isHireOpen}
        onClose={() => setIsHireOpen(false)}
        onShowToast={() => navigate('/hire-dashboard')}
      />

      {/* Delete Post Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Post</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPostToDelete(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleDeletePost} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {postToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Post Description</h3>
            <textarea
              className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              rows={4}
              value={editPostCaption}
              onChange={(e) => setEditPostCaption(e.target.value)}
              placeholder="What's this design about?"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setPostToEdit(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
              <button onClick={submitEditPost} className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      <SaveToBoardModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setPostToSave(null);
        }}
        postId={postToSave}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setPostToShare(null);
        }}
        postId={postToShare}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
