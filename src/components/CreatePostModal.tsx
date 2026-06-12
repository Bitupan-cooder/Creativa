import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Image, Upload, AlertCircle, Sparkles, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function CreatePostModal({ isOpen, onClose, onShowToast }: CreatePostModalProps) {
  const { publishPost, fetchPosts, validatePost } = useStore();
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Illustration');
  const [tags, setTags] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Embedded baseline mock images for users who just want to quickly select predefined awesome illustrations
  const [mediaUrl, setMediaUrl] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const draft = localStorage.getItem('creativa_post_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setCaption(parsed.caption || '');
          setCategory(parsed.category || 'Illustration');
          setTags(parsed.tags || '');
          if (parsed.mediaUrl) {
            setMediaUrl(parsed.mediaUrl);
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isOpen]);

  const handleSaveDraft = () => {
    localStorage.setItem('creativa_post_draft', JSON.stringify({
      caption, category, tags, mediaUrl
    }));
    onShowToast('Draft saved to local storage!');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) {
      setError('A portfolio visual media link is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate content for plagiarism
      const validation = await validatePost({ caption, mediaUrl: mediaUrl.trim() });
      if (validation.duplicate) {
        setError(validation.message || 'Content copyright violation!');
        setLoading(false);
        return;
      }

      await publishPost({
        caption,
        category,
        tags,
        mediaUrl: mediaUrl.trim(),
        scheduledAt: isScheduled && scheduledAt ? scheduledAt : undefined
      });
      onShowToast('✨ Portfolio block published onto main discovery wall!');
      setCaption('');
      setTags('');
      localStorage.removeItem('creativa_post_draft');
      onClose();
      // Reset feed
      fetchPosts('All', true);
    } catch (err: any) {
      setError(err.message || 'Unable to publish project to catalog');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />

      {/* Frame panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-purple-50 flex justify-between items-center bg-purple-50/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg text-gray-900">Publish Design Artifact</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-purple-100 rounded-full text-gray-400 hover:text-gray-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project visual display & upload selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Visual preview slot */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Cover Preview</label>
              <div 
                className="aspect-square bg-purple-50 rounded-xl overflow-hidden border border-purple-100 relative flex items-center justify-center group shadow-inner cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {mediaUrl ? (
                  <img src={mediaUrl} alt="Cover preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="w-10 h-10 text-purple-200 mx-auto mb-2" />
                    <span className="text-xs text-gray-400">Click to upload image</span>
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
            </div>

            {/* Config */}
            <div className="flex flex-col justify-end space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Design Category / Grid Name</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Illustration, 3D Art, Photography"
                  className="w-full px-3 py-2 text-xs border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
                />
              </div>
            </div>
          </div>

          {/* Caption textarea */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Project Description / Caption</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell other creatives and recruiters about your design processes, challenges and conceptual alignments..."
              className="w-full px-3 py-2 text-xs border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-350"
            />
          </div>

          {/* Tags input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 block">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Figma, Octane Render, Adobe Illustrator, Minimal, Typography"
              className="w-full px-3 py-2 text-xs border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-350"
            />
          </div>

          <div className="space-y-2 border-t border-purple-50 pt-3">
             <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
               <input
                 type="checkbox"
                 checked={isScheduled}
                 onChange={(e) => setIsScheduled(e.target.checked)}
                 className="accent-primary"
               />
               Schedule Post
             </label>
             {isScheduled && (
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-gray-700 block">Select Publication Date & Time</label>
                 <input
                   type="datetime-local"
                   value={scheduledAt}
                   onChange={(e) => setScheduledAt(e.target.value)}
                   className="w-full px-3 py-2 text-xs border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
                 />
               </div>
             )}
          </div>

          {/* Bottom buttons */}
          <div className="pt-4 border-t border-purple-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-semibold text-xs rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-opacity-95 transition-all flex items-center gap-1.5"
            >
              {loading ? 'Publishing...' : 'Publish Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
