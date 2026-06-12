import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Send, Loader2, ArrowRight, MessageSquare } from 'lucide-react';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistant({ isOpen, onClose }: AiAssistantProps) {
  const { fetchAiAdvice, aiAdvice, aiLoading, clearAiAdvice, user } = useStore();
  const [customPrompt, setCustomPrompt] = useState('');

  // Auto-fetch inspirational onboarding tips if open
  useEffect(() => {
    if (isOpen && !aiAdvice && !aiLoading) {
      fetchAiAdvice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    fetchAiAdvice(customPrompt);
    setCustomPrompt('');
  };

  const handleSuggestionClick = (prompt: string) => {
    fetchAiAdvice(prompt);
  };

  const suggestions = [
    { label: '🖼️ Portfolio review', prompt: 'Review my latest portfolio projects and provide constructive feedback.' },
    { label: '💡 Idea generation', prompt: 'Help me generate new creative ideas for my next project.' },
    { label: '🚀 Project recommendations', prompt: 'Suggest project ideas that fit my skill set.' },
    { label: '🎓 Internship suggestions', prompt: 'Find internship opportunities matching my expertise.' },
    { label: '⚖️ Copyright check', prompt: 'Check my content for potential copyright issues.' },
    { label: '🤝 Collaboration match', prompt: 'Help me find potential collaborators for my work.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-[3px]" onClick={onClose} />

      {/* Slide-in Assistant panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Header toolbar */}
        <div className="px-5 py-4 border-b border-sky-100 flex justify-between items-center h-16 bg-gradient-to-r from-blue-600 to-sky-700 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-yellow-300" />
            <span className="font-display font-semibold text-sm">IQ Copilot</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisor Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Welcome Banner */}
          <div className="p-3 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100/50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">IQ Copilot Assistant</span>
            <p className="text-xs text-blue-900 leading-relaxed">
              Hello <span className="font-semibold">{user?.displayName || 'Creative'}</span>! I'm your IQ Copilot. I can assist with portfolio reviews, idea generation, project discovery, internship finding, copyright protection, and collaboration matching.
            </p>
          </div>

          {/* Curation Display */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">Advisor Dialogue</span>
            
            {aiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs text-sky-600 font-medium">Processing with IQ Copilot...</span>
              </div>
            ) : aiAdvice ? (
              <div className="p-4 bg-sky-50/20 border border-sky-100 rounded-xl space-y-3 shadow-inner">
                <p className="text-xs text-blue-900 leading-relaxed font-sans whitespace-pre-line">{aiAdvice}</p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearAiAdvice}
                    className="text-[10px] font-semibold text-blue-600 hover:underline bg-white px-2.5 py-1 rounded-md border border-sky-100/50"
                  >
                    Clear Feedback
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-sky-100 rounded-xl text-center py-8 text-sky-400 bg-sky-50/50">
                <p className="text-xs">Dialogue box waiting for queries...</p>
              </div>
            )}
          </div>

          {/* Quick suggestions templates */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">Interactive Templates</span>
            <div className="space-y-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(item.prompt)}
                  disabled={aiLoading}
                  className="w-full text-left p-2.5 text-xs border border-sky-100/60 rounded-lg hover:bg-sky-50/30 transition-all flex justify-between items-center group disabled:opacity-50"
                >
                  <span className="text-blue-900 font-medium line-clamp-1 py-0.5">{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-transparent group-hover:text-blue-600 transition-all flex-shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Input prompt query */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-sky-100 bg-white flex items-center gap-2 flex-shrink-0 h-16">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={aiLoading}
            placeholder="Ask about copyright, bugs, or uploads..."
            className="flex-1 px-4 py-2 border border-sky-100 rounded-full focus:outline-none focus:border-blue-600 text-xs"
          />
          <button
            type="submit"
            disabled={!customPrompt.trim() || aiLoading}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-sm leading-none disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
