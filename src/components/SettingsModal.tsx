import React from 'react';
import { X, Mail, Instagram, HelpCircle, Shield, Info, Settings, Heart, Bell } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-gray-100 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-900" />
            <h3 className="font-display font-bold text-gray-900 text-lg">Platform Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white rounded-full transition-colors shadow-sm">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[75vh]">
          
          {/* Support Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5" />
                Help & Support
              </h4>
            </div>
            
            <div className="grid gap-3">
              <div className="p-5 rounded-2xl bg-red-50/30 border border-red-100/50">
                <p className="text-xs text-gray-605 font-medium mb-4 leading-relaxed">
                  Need help with your portfolio, networking, or creative boards? Our support line is active:
                </p>
                
                <div className="space-y-3">
                  <a 
                    href="mailto:www.bi2pandeka@gmail.com" 
                    className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-primary">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-900">Official Email Support</span>
                      <span className="text-[10px] text-gray-450 group-hover:text-primary transition-colors">www.bi2pandeka@gmail.com</span>
                    </div>
                  </a>

                  <a 
                    href="https://instagram.com/_ventue" 
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-primary">
                      <Instagram className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-900">Direct Instagram</span>
                      <span className="text-[10px] text-gray-450 group-hover:text-primary transition-colors">@_ventue</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="space-y-4 pt-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" />
              General Preferences
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 px-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700">Push Notifications</span>
                </div>
                <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full shadow-sm" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 px-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700">Privacy Mode</span>
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded-full relative">
                  <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          {/* Legal / Info */}
          <div className="pt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-bold">
            <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
              <Info className="w-3 h-3" />
              Policy
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5 hover:text-primary cursor-pointer transition-colors">
              <Shield className="w-3 h-3" />
              Terms
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="flex items-center gap-1.5 text-gray-300">
              v1.0.4-Stable
            </span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
          <Heart className="w-3.5 h-3.5 text-primary fill-current animate-pulse" />
          <p className="text-[10px] text-gray-450 font-bold uppercase tracking-widest italic">
            Creativa © 2026 • Crafted for the bold.
          </p>
        </div>
      </div>
    </div>
  );
}
