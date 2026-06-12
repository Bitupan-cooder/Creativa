import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Repeat, Eye, Bookmark, Sparkles, Loader2, Check } from 'lucide-react';
import { Post } from '../types';
import MasonrySkeleton from './MasonrySkeleton';

interface MasonryGridProps {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onLike: (e: React.MouseEvent, postId: string) => void;
  onShare: (e: React.MouseEvent, postId: string) => void;
  onRepost: (e: React.MouseEvent, postId: string) => void;
  onSaveToBoard: (e: React.MouseEvent, postId: string) => void;
  onOpenComments: (e: React.MouseEvent, post: Post) => void;
  copiedId: string | null;
  activeCategory: string;
}

function PostImage({ src, alt, onClick }: { src: string; alt: string; onClick: (e: React.MouseEvent) => void }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

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

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      handleError();
    }
  }, [currentSrc]);

  return (
    <>
      {!isLoaded && (
        <div className="w-full h-[300px] bg-gray-100 animate-pulse flex items-center justify-center border-b border-gray-100" />
      )}
      <img
        ref={imgRef}
        referrerPolicy="no-referrer"
        src={currentSrc}
        alt={alt}
        className={`w-full h-auto object-cover max-h-[480px] hover:scale-[1.02] transition-transform duration-300 ${!isLoaded ? 'hidden' : 'block'}`}
        onClick={onClick}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
      />
    </>
  );
}

export default function MasonryGrid({
  posts,
  loading,
  hasMore,
  onLoadMore,
  onLike,
  onShare,
  onRepost,
  onSaveToBoard,
  onOpenComments,
  copiedId,
  activeCategory,
}: MasonryGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: '250px',
        threshold: 0.05,
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
      observer.disconnect();
    };
  }, [hasMore, loading, onLoadMore]);

  if (posts.length === 0 && loading) {
    return <MasonrySkeleton />;
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-24 text-gray-500 space-y-3">
        <span className="text-4xl">🏜️</span>
        <p className="font-display font-medium text-lg">Discovery grid is vacant</p>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          No art pieces match your current filters or search query. 
          Try a different keyword or category.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="columns-1 sm:columns-2 md:columns-3 xl:columns-4 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="break-inside-avoid mb-6 flex flex-col group">
            {/* Image Frame with hover actions */}
            <div className="relative rounded-[20px] overflow-hidden border border-gray-150 shadow-sm shadow-red-500/5 bg-[#f5f5f5] cursor-pointer">
              <PostImage
                src={post.mediaUrl}
                alt={post.caption || 'Creativa Work'}
                onClick={(e) => onOpenComments(e, post)}
              />

              {/* Repost banner label indicators */}
              {post.isRepost && (
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-red-100 px-2.5 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-red-600 shadow-sm">
                  <Repeat className="w-3 h-3 text-red-600" />
                  <span>@{post.repostedBy}</span>
                </div>
              )}

              {/* Hover controls overlay */}
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto flex flex-col justify-between p-3.5">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={(e) => onLike(e, post.id)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 shadow-sm transition-all hover:scale-110"
                    title={post.likes && post.likes.includes(post.authorId) ? 'Unlike' : 'Like'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        post.likes && post.likes.includes(post.authorId) ? 'fill-current text-red-600' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => onSaveToBoard(e, post.id)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 shadow-sm transition-all hover:scale-110"
                    title="Save to Board"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => onShare(e, post.id)}
                    className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 hover:text-red-600 shadow-sm transition-all hover:scale-110 animate-fade-in"
                    title="Copy Link"
                  >
                    {copiedId === post.id ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    )}
                  </button>
                </div>

                <div className="flex justify-between items-center bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-[10px] font-semibold text-white">
                  <span className="uppercase text-[8px] text-red-200 font-bold tracking-wider">{post.category}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => onOpenComments(e, post)} className="hover:text-red-200 flex items-center gap-0.5">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.comments?.length || 0}</span>
                    </button>
                    <button
                      onClick={(e) => onRepost(e, post.id)}
                      className="hover:text-red-200 flex items-center gap-0.5"
                      title="Repost onto your grid"
                    >
                      <Repeat className="w-3 h-3" />
                      <span>{post.reposts?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Creator below image card container (PINTEREST STYLE) */}
            <h4
              className="font-sans font-bold text-sm text-gray-950 leading-snug line-clamp-1 mt-2.5 px-0.5 hover:text-[#dc2626] transition-colors cursor-pointer"
              onClick={(e) => onOpenComments(e, post)}
            >
              {post.caption || 'Concept Artwork'}
            </h4>

            <div className="flex items-center justify-between mt-1 px-0.5">
              <Link to={`/profile/${post.authorUsername}`} className="flex items-center gap-2 group/author max-w-[70%]">
                <img
                  src={post.authorAvatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23dfe5e7"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23ffffff"/></svg>'}
                  alt="Creator"
                  className="w-5.5 h-5.5 rounded-full object-cover border border-gray-150"
                />
                <span className="text-xs text-gray-700 font-bold group-hover/author:underline group-hover/author:text-red-600 truncate">
                  {post.authorName}
                </span>
              </Link>
              <div className="flex items-center gap-1 text-[10px] text-gray-450 font-medium">
                <Eye className="w-3 h-3 text-gray-400" />
                <span>{post.views * 10}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IntersectionObserver Sentinel & Loading indicator */}
      <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center w-full min-h-[80px]">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            <span className="text-xs text-gray-400 font-medium">Syncing more recommended curation...</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <span className="text-xs text-gray-400 font-medium tracking-tight">You've reached the end of the design gallery.</span>
        )}
      </div>
    </div>
  );
}
