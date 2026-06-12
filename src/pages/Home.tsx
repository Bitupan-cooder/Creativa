import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store';
import { Heart, MessageSquare, Repeat, Eye, Bookmark, Sparkles, Loader2, RefreshCw, Flame, Trophy, Calendar, Medal, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import CommentDrawer from '../components/CommentDrawer';
import MasonryGrid from '../components/MasonryGrid';
import SaveToBoardModal from '../components/SaveToBoardModal';
import ShareModal from '../components/ShareModal';

function BoardImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80'
  ];

  const handleError = () => {
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    setCurrentSrc(randomFallback);
  };

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      handleError();
    }
  }, [currentSrc]);

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
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

export default function Home() {
  const { posts, fetchPosts, activeCategory, likePost, repostPost, feedLoading, feedHasMore } = useStore();
  const [selectedPostForComments, setSelectedPostForComments] = useState<any>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [postToSave, setPostToSave] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<string | null>(null);

  // Helmet dynamic title
  const pageTitle = activeCategory === 'All' 
    ? "Creativa | Discover Creative Professionals"
    : `Creativa | ${activeCategory} Inspiration`;

  // Streak Tracker logic
  const [streakDays, setStreakDays] = useState(() => {
    return Number(localStorage.getItem('creativa_streak') || '4');
  });
  const [hasCheckedIn, setHasCheckedIn] = useState(() => {
    return localStorage.getItem('creativa_checked_in_today') === 'true';
  });

  const handleCheckIn = () => {
    if (!hasCheckedIn) {
      const newStreak = streakDays + 1;
      setStreakDays(newStreak);
      localStorage.setItem('creativa_streak', String(newStreak));
      localStorage.setItem('creativa_checked_in_today', 'true');
      setHasCheckedIn(true);
    }
  };

  // Leaderboard lists
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'monthly'>('weekly');
  const weeklyLeaders = [
    { rank: 1, name: 'Elena Rostova', username: 'elena', score: '1,420 pts', badge: '🏆 3D Shape Master', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAzNNc6Mtkq0KB0UiL3X6Ad2o_1GDIMgTd9kpVBIoeqAr7T3yD-fyePEqivTbAkMXSf40fQHmEV7Lh-qxVP1vmpMTosn8jyqM0Vzb8CSmTHishJ2cWRPmbZTZe_GDABoomql7VPK0coiRkdsalLBJmOHSiqxJQEXlA3l2c-QeDO1h_TPZ8_EPLWpntLUOV1lSHSo9EtAqs10qy4ih8uBrKAr4IX1Of9Zzi2ZKOKaBmnv6clPKVVQ0CBnH1HMuGY7hwW13ZZUmViRcQ' },
    { rank: 2, name: 'Marcus Chen', username: 'marcus', score: '1,280 pts', badge: '⚡ UI Interface Legend', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYlXBBf4JngeMaXv1n4oI532-0zjnkkUW5cz_7WyCewALzX0NGnrL8RalXOHUz_lKYU5Loll_h0jVoqCzIT_bUZzWKESpkLzXxHyr50sUrPl00S79ltQt0NCPD8Jyg8T0eIjvjBJsJP8CIOmFyumqBnmKSC8JYnNMo6sofSAfY2PGXpjpE2UqWtMWmpiOyc05xoXQXdhOAs7cicE9E3yHvCEHRcXX3VylhiWucDDVn3qFbPeBkGoGa-VJ0kFr-BbBslyOyMpYx9CI7' },
    { rank: 3, name: 'Sarah Jenkins', username: 'sarah', score: '990 pts', badge: '🎨 Branding Craft', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDybg0lIcvzqz36sEInhWj-rbtBla5_9-lmBMvgiCIkbQmmhFOjhs4cFGB5Syxu-VyY57hHrawKTBc4zPqWHaESEEvhi8AHYUsf-rZXSFa83z65gvOo_RUJN4EfLk8sDYl09iPDxn6menx_tdn2DJBLLgMkYuuJ4KZXWI2jzP6QIs5FlXs4nspYxGITvRiUvaV7lmFVxygN2utR_DpskAOKmcIuGIyrPRFe5zOn-QWSy0lvvfB2Ul3espMjvAPxJmi7WLdR2pItnpDq' }
  ];
  const monthlyLeaders = [
    { rank: 1, name: 'Marcus Chen', username: 'marcus', score: '5,800 pts', badge: '👑 Monthly King', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYlXBBf4JngeMaXv1n4oI532-0zjnkkUW5cz_7WyCewALzX0NGnrL8RalXOHUz_lKYU5Loll_h0jVoqCzIT_bUZzWKESpkLzXxHyr50sUrPl00S79ltQt0NCPD8Jyg8T0eIjvjBJsJP8CIOmFyumqBnmKSC8JYnNMo6sofSAfY2PGXpjpE2UqWtMWmpiOyc05xoXQXdhOAs7cicE9E3yHvCEHRcXX3VylhiWucDDVn3qFbPeBkGoGa-VJ0kFr-BbBslyOyMpYx9CI7' },
    { rank: 2, name: 'Elena Rostova', username: 'elena', score: '5,100 pts', badge: '🔮 Abstract Architect', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAzNNc6Mtkq0KB0UiL3X6Ad2o_1GDIMgTd9kpVBIoeqAr7T3yD-fyePEqivTbAkMXSf40fQHmEV7Lh-qxVP1vmpMTosn8jyqM0Vzb8CSmTHishJ2cWRPmbZTZe_GDABoomql7VPK0coiRkdsalLBJmOHSiqxJQEXlA3l2c-QeDO1h_TPZ8_EPLWpntLUOV1lSHSo9EtAqs10qy4ih8uBrKAr4IX1Of9Zzi2ZKOKaBmnv6clPKVVQ0CBnH1HMuGY7hwW13ZZUmViRcQ' },
    { rank: 3, name: 'David Lee', username: 'david', score: '4,450 pts', badge: '🌌 Cyber Illustrator', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdJKEbyqGUBE2hxlWz1gpRD5tcEioJ597ICSsuQr3f8kL822zxUwjjFY11a31MEaPhDSF2QMvnGrodTy5QS680BBVrh-D2r2ZZ5pnb4_Gxddk7e1JPgGADgOThnnYDVbW2jZyHoUE5hSjUDXNz9v9l5LU205diICSF2_fIDAFyrP9yR0OpHnrvBXxgOFNWShBCwxA_cTRTY9WBnQcGODdnU_pAtTwZsG6RNaoweP4pcR6oTGs1VqiNHC4utIXd_AgpYJtSoP64DeJg' }
  ];

  // Visual category list backed by Unsplash photos like Pinterest boards
  const visualCategories = [
    { name: 'All', count: '142 posts', img: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400' },
    { name: 'Illustration', count: '48 posts', img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400' },
    { name: '3D & Motion', count: '35 posts', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400' },
    { name: 'UI/UX', count: '29 posts', img: 'https://images.unsplash.com/photo-1581291518655-9523c932ebcf?auto=format&fit=crop&q=80&w=400' },
    { name: 'Photography', count: '22 posts', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400' },
    { name: 'Graphic Design', count: '18 posts', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400' },
    { name: 'Typography', count: '15 posts', img: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=400' },
    { name: 'Branding', count: '12 posts', img: 'https://images.unsplash.com/photo-1554188718-d01690b29f13?auto=format&fit=crop&q=80&w=400' }
  ];

  // Load posts on mount of component
  useEffect(() => {
    fetchPosts(activeCategory, true);
  }, []);

  const handleCategoryClick = (category: string) => {
    fetchPosts(category, true);
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    likePost(postId);
  };

  const handleRepost = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    repostPost(postId);
  };

  const handleOpenSaveModal = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPostToSave(postId);
    setIsSaveModalOpen(true);
  };

  const handleOpenComments = (e: React.MouseEvent, post: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPostForComments(post);
    setIsCommentsOpen(true);
  };

  const handleShare = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPostToShare(postId);
    setIsShareModalOpen(true);
  };

  const handleLoadMore = () => {
    fetchPosts(activeCategory, false);
  };

  const categories = [
    'All',
    'Illustration',
    '3D & Motion',
    'UI/UX',
    'Photography',
    'Graphic Design',
     'Branding'
  ];



  return (
    <div className="space-y-8 pt-4">
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
      </Helmet>

      {/* Category Explorer - Pinterest Style Visual Board Cards from outside */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-black text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
            Explore Boards
          </h3>
          <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full">Interactive visual grids</span>
        </div>

        {/* Pinterest styled category grid cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {visualCategories.map((catCard) => {
            const isSelected = activeCategory === catCard.name;
            return (
              <button
                key={catCard.name}
                onClick={() => handleCategoryClick(catCard.name)}
                className={`relative aspect-[4/3] rounded-2xl overflow-hidden group/cat cursor-pointer border-2 transition-all duration-300 text-left outline-none ${
                  isSelected 
                    ? 'border-red-600 shadow-md ring-2 ring-red-100 scale-[1.02]' 
                    : 'border-transparent hover:border-red-200 hover:scale-[1.01]'
                }`}
              >
                {/* Visual wallpaper placeholder */}
                <BoardImage
                  src={catCard.img} 
                  alt={catCard.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover/cat:scale-110" 
                />
                {/* Linear mask vignette overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/30 to-transparent transition-opacity duration-300 ${isSelected ? 'opacity-95' : 'opacity-80'}`} />
                
                {/* Board label titles */}
                <div className="absolute inset-0 p-3 flex flex-col justify-end text-white">
                  <span className="font-display font-black text-xs leading-none tracking-tight block drop-shadow-sm">
                    {catCard.name}
                  </span>
                  <span className="text-[8px] font-bold opacity-80 uppercase tracking-widest block mt-0.5">
                    {catCard.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Category Scroll Bar filter (Sleek backup) */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md py-4.5 -mx-4 px-4 md:-mx-12 md:px-12 border-b border-red-100/40 flex items-center gap-2.5 overflow-x-auto hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full font-display text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-red-500/10 text-gray-600 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Discovery masonry grid (Pinterest Style) using robust IntersectionObserver */}
      <MasonryGrid
        posts={posts}
        loading={feedLoading}
        hasMore={feedHasMore}
        onLoadMore={handleLoadMore}
        onLike={handleLike}
        onShare={handleShare}
        onRepost={handleRepost}
        onSaveToBoard={handleOpenSaveModal}
        onOpenComments={handleOpenComments}
        copiedId={copiedId}
        activeCategory={activeCategory}
      />

      {/* Slide-in Comment Drawer */}
      <CommentDrawer
        post={selectedPostForComments}
        isOpen={isCommentsOpen}
        onClose={() => {
          setIsCommentsOpen(false);
          setSelectedPostForComments(null);
        }}
      />

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
    </div>
  );
}
