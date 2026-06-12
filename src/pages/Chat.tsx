import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { useLocation } from 'react-router-dom';
import { Send, User, MapPin, Briefcase, ChevronRight, FileText, Download, CheckSquare, Square, Loader2, Sparkles, Upload } from 'lucide-react';

export default function Chat() {
  const location = useLocation();
  const stateRecipientId = location.state?.recipientId;

  const {
    conversations,
    activeConversationId,
    activeMessages,
    activeProject,
    chatLoading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    setActiveConversationId,
    connectionsList,
    toggleMilestone,
    user
  } = useStore();

  const [typedMessage, setTypedMessage] = useState('');
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [fileTypeInput, setFileTypeInput] = useState('image');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Check if routed with a recipientId state (e.g. from "Message" button on Profile)
  useEffect(() => {
    if (stateRecipientId && conversations.length > 0) {
      // Look for conversation with this partner
      const matched = conversations.find(
        (c) => c.recipient?.id === stateRecipientId || c.sender?.id === stateRecipientId
      );
      if (matched) {
        setActiveConversationId(matched.id);
      } else {
        // Trigger empty placeholder state with recipient state
        // Our backend can receive messages for recipientId directly to spawn channels implicitly!
      }
    }
  }, [stateRecipientId, conversations]);

  // Handle active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Keep chat scrolled down on updates
  useEffect(() => {
    bottomMarkerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() && !fileUrlInput.trim()) return;

    // Is there a recipient state but no active channel started?
    if (!activeConversationId && stateRecipientId) {
      // Set temporary store target. Our sendMessage handles startup internally.
    }

    try {
      await sendMessage(
        typedMessage, 
        fileUrlInput.trim() ? fileUrlInput.trim() : undefined,
        fileUrlInput.trim() ? fileTypeInput : undefined
      );
      setTypedMessage('');
      setFileUrlInput('');
      setShowFileUploader(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentDone: boolean) => {
    if (!activeProject) return;
    try {
      await toggleMilestone(activeProject.id, milestoneId, !currentDone);
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-seed premium sample files for quick mock upload demonstration
  const starterMockFiles = [
    { label: '📦 Vector wireframe sketch asset', url: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=850&q=80', type: 'image' },
    { label: '🎨 3D mesh clay render draft', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=850&q=80', type: 'image' },
    { label: '📋 UI Design brief requirements.pdf', url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=850&q=80', type: 'pdf' }
  ];

  const activeChannel = conversations.find((c) => c.id === activeConversationId);
  const activePartner = activeChannel
    ? activeChannel.sender?.id === user?.id
      ? activeChannel.recipient
      : activeChannel.sender
    : null;

  return (
    <div className="h-[calc(100vh-6.5rem)] flex bg-white border border-red-500/10 rounded-[24px] shadow-[0_4px_12px_rgba(220,38,38,0.03)] overflow-hidden mt-2">
      
      {/* SIDEBAR: Active connection channels list */}
      <div className="w-80 border-r border-red-50/50 flex flex-col bg-red-50/5 flex-shrink-0">
        
        {/* Search header container */}
        <div className="p-4 border-b border-purple-50 flex-shrink-0 h-16 flex items-center justify-between">
          <h3 className="font-display font-semibold text-gray-950 text-sm">Direct Channels</h3>
          <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full">{conversations.length}</span>
        </div>

        {/* List of ongoing chats */}
        <div className="flex-1 overflow-y-auto divide-y divide-purple-50/50">
          {conversations.length === 0 ? (
            <div className="text-center py-20 text-gray-400 space-y-2 px-4">
              <span className="text-2xl">🗣️</span>
              <p className="text-xs font-semibold">Chats empty</p>
              <p className="text-[10px] text-gray-400 leading-normal">Connect with colleagues inSuggestions network area to unlock real-time messenger boards!</p>
            </div>
          ) : (
            conversations.map((c) => {
              const partner = c.sender?.id === user?.id ? c.recipient : c.sender;
              const isSelected = c.id === activeConversationId;
              
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`p-3.5 flex gap-3 cursor-pointer items-center transition-all ${
                    isSelected ? 'bg-primary-light border-l-4 border-primary' : 'hover:bg-purple-100/15'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-100 bg-purple-50 flex-shrink-0">
                    <img src={partner?.avatar} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-semibold text-gray-900 truncate">{partner?.displayName}</span>
                      <span className="text-[8.5px] text-gray-400 font-medium">12:35 PM</span>
                    </div>
                    <p className="text-gray-400 truncate">{c.lastMessage || 'Channel created'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* CORE PANEL: Message Bubbles Streams */}
      <div className="flex-1 flex flex-col bg-[#fefdff]">
        
        {activePartner ? (
          <>
            {/* Upper active user status header */}
            <div className="h-16 px-6 border-b border-purple-50 flex justify-between items-center bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-100">
                  <img src={activePartner.avatar} className="w-full h-full object-cover" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-gray-950">{activePartner.displayName}</h4>
                  <span className="text-[10px] text-gray-400">@{activePartner.username} | active now</span>
                </div>
              </div>
            </div>

            {/* Messages body history */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Top notice secure messaging */}
              <div className="text-center py-2 max-w-xs mx-auto bg-purple-50 rounded-full border border-purple-100/30 text-[9px] text-purple-600 font-semibold tracking-wide">
                🔐 End-to-end sandbox channels activated
              </div>

              {chatLoading ? (
                <div className="py-12 flex justify-center items-center gap-1.5">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-[11px] text-gray-450 font-medium">Syncing messaging secure archives...</span>
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3.5 text-xs shadow-sm ${
                        isOwn
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-white border border-purple-150 text-gray-900 rounded-tl-none'
                      }`}>
                        
                        {/* Text Content */}
                        {msg.content && <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>}

                        {/* Embedded Graphic / PDF Document attachments */}
                        {msg.fileUrl && (
                          <div className={`mt-2 rounded-xl overflow-hidden border border-purple-100/20 bg-black/5 p-1`}>
                            {msg.fileType === 'pdf' ? (
                              <div className="p-3 flex items-center justify-between text-[11px] gap-2">
                                <FileText className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                                <div className="flex-1 truncate">
                                  <span className="font-semibold block truncate">Technical design details</span>
                                  <span className="text-[9px] text-gray-400">PDF Document</span>
                                </div>
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  className="p-1 px-2.5 bg-white text-primary text-[9px] font-bold rounded-md hover:shadow-xs transition-all"
                                >
                                  Open
                                </a>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <img src={msg.fileUrl} alt="Snippet file attached" className="w-full object-cover max-h-48 rounded" />
                                <div className="p-1 flex items-center justify-between text-[9px]">
                                  <span>Visual media attachment</span>
                                  <a href={msg.fileUrl} target="_blank" className="font-semibold underline text-primary hover:text-white">Full scale</a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <span className="block text-[8.5px] opacity-75 mt-1 text-right">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>

                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomMarkerRef} />
            </div>

            {/* Custom file attachments options panel */}
            {showFileUploader && (
              <div className="px-6 py-3 border-t border-purple-50 bg-purple-50/40 space-y-2 text-xs">
                <span className="font-semibold text-primary block">Select Pre-curated File attachment sample:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {starterMockFiles.map((f, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setFileUrlInput(f.url); setFileTypeInput(f.type); }}
                      className={`p-2 bg-white text-left text-[10px] rounded-lg border flex flex-col justify-between transition-all hover:bg-purple-100/10 ${
                        fileUrlInput === f.url ? 'border-primary shadow-xs bg-purple-50' : 'border-purple-100'
                      }`}
                    >
                      <span className="font-bold block truncate">{f.label}</span>
                      <span className="text-[8.5px] text-gray-405 italic capitalize mt-1">Preset {f.type}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={fileUrlInput}
                    onChange={(e) => setFileUrlInput(e.target.value)}
                    placeholder="Alternatively paste custom image/doc url directly..."
                    className="flex-1 px-4 py-1 border border-purple-100 bg-white rounded-lg placeholder:text-gray-300"
                  />
                  <select
                    value={fileTypeInput}
                    onChange={(e) => setFileTypeInput(e.target.value)}
                    className="px-2.5 py-1 border border-purple-100 bg-white rounded-lg text-xs"
                  >
                    <option value="image">Image graphic</option>
                    <option value="pdf">PDF Doc</option>
                  </select>
                </div>
              </div>
            )}

            {/* Messenger outbox input bar */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-50 bg-white flex items-center gap-2 h-18 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowFileUploader(!showFileUploader)}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                  showFileUploader ? 'bg-primary text-white shadow' : 'bg-purple-50 text-gray-500 hover:text-primary hover:bg-purple-100'
                }`}
                title="Attach high-res project graphics file"
              >
                <Upload className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Compose a design review request or connection greetings..."
                className="flex-1 px-4 py-2 border border-purple-100 rounded-full focus:outline-none focus:border-primary text-xs"
              />
              <button
                type="submit"
                disabled={(!typedMessage.trim() && !fileUrlInput.trim())}
                className="p-2.5 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all shadow-sm leading-none disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-2 p-6">
            <span className="text-3xl">💬</span>
            <h4 className="font-display font-medium text-gray-900 text-sm">Interactive Sandbox Console</h4>
            <p className="text-xs max-w-xs text-center">Select an unlocked peer chat in left column to commence high-fidelity compositional review, or toggle shared milestone lists.</p>
          </div>
        )}

      </div>

      {/* OUTSIDE RIGHT PANEL: Peer Specs & Shared Project Milestones Checklist */}
      {activePartner && (
        <div className="w-72 border-l border-purple-50 flex flex-col bg-purple-50/10 flex-shrink-0">
          
          {/* Peer Metadata header */}
          <div className="p-4 border-b border-purple-50 bg-white h-16 flex items-center text-xs">
            <span className="font-bold text-gray-900 uppercase tracking-widest block">Collaborator Bio Specs</span>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            
            {/* Professional resume brief */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-[11px] text-gray-650 leading-normal">{activePartner.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-[11px] text-gray-650 font-medium leading-none">Consulting Rate: {activePartner.hireRate || '$50/hr'}</span>
              </div>
            </div>

            {/* Dynamic Milestone space for Hires */}
            {activeProject ? (
              <div className="pt-4 border-t border-purple-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Escrow Milestones</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-100 text-status-teal text-[8.5px] font-bold uppercase tracking-wider scale-pulse">
                    active project
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-purple-100/50 space-y-2">
                  <span className="text-[9px] font-bold text-gray-405 block">Budget: {activeProject.budget}</span>
                  
                  {/* Milestones toggles checklist */}
                  <div className="space-y-2 pt-1 border-t border-purple-50/50 text-[11px]">
                    {activeProject.milestones?.map((m: any) => {
                      const isCreator = activeProject.creativeId === user?.id;
                      
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(m.id, m.done)}
                          className="flex items-start gap-2 cursor-pointer group select-none text-gray-700 hover:text-black transition-all"
                        >
                          <span className="mt-0.5 text-primary flex-shrink-0">
                            {m.done ? (
                              <CheckSquare className="w-4 h-4 fill-primary/10" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400 group-hover:text-primary transition-all" />
                            )}
                          </span>
                          <span className={`leading-normal ${m.done ? 'line-through text-gray-400' : ''}`}>
                            {m.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-purple-100 space-y-2 text-center text-gray-400 py-6">
                <span className="block text-2xl">💼</span>
                <span className="text-[10px] font-semibold text-gray-405 block">No active escrow order</span>
                <p className="text-[9px] text-gray-400 leading-normal px-2">Recruiters can submit a hire contract on profile screens to activate Milestone boards inside this pane.</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
