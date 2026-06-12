import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { Post } from '../types';

interface CommentDrawerProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CommentDrawer({ post, isOpen, onClose }: CommentDrawerProps) {
  const { addComment } = useStore();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await addComment(post.id, newComment);
      setNewComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-[3px]" onClick={onClose} />

      {/* Slide-in container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-purple-50 flex justify-between items-center bg-purple-50/50 h-16 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-primary" />
            <h3 className="font-display font-semibold text-gray-900 text-sm">Discussions ({post.comments.length})</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-purple-100 rounded-full text-gray-400 hover:text-gray-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Project Abstract Context */}
        <div className="p-4 border-b border-purple-50 flex gap-3 bg-purple-50/10 flex-shrink-0">
          <img src={post.mediaUrl} alt="Snippet" className="w-14 h-14 rounded-lg object-cover border border-purple-100 flex-shrink-0" />
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{post.category}</span>
            <p className="text-xs text-gray-650 line-clamp-2 mt-0.5 leading-relaxed">{post.caption || 'No description'}</p>
          </div>
        </div>

        {/* Discussions List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {post.comments.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-purple-200 mx-auto" />
              <p className="text-xs leading-relaxed font-medium">No design remarks yet.<br />Be the first to leave a feedback!</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-xs border-b border-gray-50 pb-3 h-auto">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-100 flex-shrink-0">
                  {comment.authorAvatar ? (
                    <img src={comment.authorAvatar} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-primary m-2" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{comment.authorName}</span>
                    <span className="text-[10px] text-gray-400">
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-gray-650 leading-relaxed font-normal bg-purple-50/30 p-2 rounded-lg">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Outbox Comment input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-purple-50 bg-white flex items-center gap-2 flex-shrink-0 h-18">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            placeholder="Review composition, typography, lightning..."
            className="flex-1 px-4 py-2 border border-purple-100 rounded-full focus:outline-none focus:border-primary text-xs"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="p-2.5 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all shadow-sm leading-none disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
