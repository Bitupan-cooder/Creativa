import React, { useState } from 'react';
import { X, Copy, Check, Twitter, Facebook, Linkedin } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export default function ShareModal({ isOpen, onClose, postId }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !postId) return null;

  const url = `${window.location.origin}/post/${postId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this amazing portfolio on Creativa!')}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-xl z-10 animate-fade-in p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Share this post</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors hidden-outline">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <button onClick={shareToTwitter} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               <Twitter className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-gray-600">Twitter</span>
          </button>
          <button onClick={shareToFacebook} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               <Facebook className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-gray-600">Facebook</span>
          </button>
          <button onClick={shareToLinkedIn} className="flex flex-col items-center gap-2 group">
             <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               <Linkedin className="w-5 h-5" />
             </div>
             <span className="text-xs font-medium text-gray-600">LinkedIn</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2">
          <div className="flex-1 overflow-hidden">
             <p className="truncate text-xs text-gray-500 px-2">{url}</p>
          </div>
          <button onClick={copyToClipboard} className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-600" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}
