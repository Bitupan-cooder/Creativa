import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../store';
import { User, UserCheck, UserX, UserPlus, MessageCircle, MapPin, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Network() {
  const {
    suggestions,
    receivedRequests,
    connectionsList,
    networkLoading,
    fetchNetworkSuggestions,
    fetchReceivedRequests,
    fetchConnectionsList,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    setActiveConversationId
  } = useStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'connections'>('suggestions');
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNetworkSuggestions();
    fetchReceivedRequests();
    fetchConnectionsList();
  }, []);

  const handleSendRequest = async (userId: string) => {
    setSendingId(userId);
    try {
      await sendConnectionRequest(userId);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingId(null);
    }
  };

  const handleMessageUser = (userId: string) => {
    // Navigate and set active conversation using null to force create or fetch existing in chat page
    setActiveConversationId(null);
    navigate('/chat', { state: { recipientId: userId } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-6">
      <Helmet>
        <title>Creativa | Professional Network</title>
        <meta name="description" content="Manage creative connections, pending requests, and discover peers" />
        <meta property="og:title" content="Creativa | Professional Network" />
      </Helmet>
      
      {/* Title Header */}
      <div className="space-y-1">
        <h2 className="font-display font-medium text-xl text-gray-950">Professional Network</h2>
        <p className="text-xs text-gray-400">Manage creative connections, pending requests, and discover illustrative peers in your category.</p>
      </div>

      {/* Tonal tab buttons */}
      <div className="flex border-b border-purple-50">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2.5 font-display text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'suggestions'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Suggested for You
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 font-display text-sm font-semibold border-b-2 transition-all relative ${
            activeTab === 'requests'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Received Requests
          {receivedRequests.length > 0 && (
            <span className="ml-1.5 bg-status-coral text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {receivedRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2.5 font-display text-sm font-semibold border-b-2 transition-all relative ${
            activeTab === 'connections'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          My Connections ({connectionsList.length})
        </button>
      </div>

      {/* Suggested Peers Curation */}
      {networkLoading ? (
        <div className="py-24 flex justify-center items-center gap-2">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-xs text-gray-400 font-medium font-sans">Scanning creative registry matching categories...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TAB 1: SUGGESTIONS */}
          {activeTab === 'suggestions' && (
            suggestions.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-purple-250 mx-auto" />
                <p className="text-xs font-semibold">No pending recommendations</p>
                <p className="text-[10px]">You are connected with all preseeded professionals. Try checking back later!</p>
              </div>
            ) : (
              suggestions.map((peer) => (
                <div key={peer.id} className="bento-card flex-row gap-4 relative overflow-hidden group hover:scale-[1.015] hover:border-red-500/25 pb-5">
                  <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-primary/25 m-3" />
                  
                  {/* Photo avatar */}
                  <Link to={`/profile/${peer.username}`} className="w-16 h-16 rounded-full overflow-hidden border border-red-500/15 flex-shrink-0 bg-red-50/10">
                    <img src={peer.avatar} className="w-full h-full object-cover" />
                  </Link>

                  {/* Body details */}
                  <div className="flex-1 space-y-2">
                    <div className="space-y-0.5">
                      <Link to={`/profile/${peer.username}`} className="font-display font-semibold text-gray-900 text-sm hover:underline hover:text-primary block leading-snug">{peer.displayName}</Link>
                      <span className="bento-category-pill bg-primary-light text-primary">{peer.category}</span>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-sans line-clamp-2">{peer.bio}</p>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-1 text-[10px] text-gray-405 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{peer.location}</span>
                      </div>
                      <button
                        onClick={() => handleSendRequest(peer.id)}
                        disabled={sendingId === peer.id}
                        className="px-3.5 py-1.5 bg-primary text-[10px] font-bold text-white rounded-lg hover:bg-opacity-95 transition-all flex items-center gap-1 disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 2: REQUESTS */}
          {activeTab === 'requests' && (
            receivedRequests.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-purple-250 mx-auto" />
                <p className="text-xs font-semibold">Inbox is clear</p>
                <p className="text-[10px]">No pending connection proposals require review currently.</p>
              </div>
            ) : (
              receivedRequests.map((req) => (
                <div key={req.id} className="bento-card flex-row gap-4 justify-between items-center col-span-2 pb-5 hover:border-red-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-red-500/15 bg-red-50/10">
                      <img src={req.requester?.avatar} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link to={`/profile/${req.requester?.username}`} className="font-display font-semibold text-gray-900 text-sm hover:underline block leading-snug">{req.requester?.displayName}</Link>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Category: {req.requester?.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => declineConnectionRequest(req.id)}
                      className="p-2 border border-red-105 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                      title="Decline"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => acceptConnectionRequest(req.id)}
                      className="px-3 py-2 bg-status-teal hover:bg-opacity-95 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 shadow-sm uppercase tracking-wide"
                    >
                      <UserCheck className="w-4 h-4" />
                      Accept
                    </button>
                  </div>
                </div>
              ))
            )
          )}

          {/* TAB 3: MY CONNECTIONS */}
          {activeTab === 'connections' && (
            connectionsList.length === 0 ? (
              <div className="col-span-2 py-20 text-center text-gray-400 space-y-2 col-span-2">
                <AlertCircle className="w-8 h-8 text-purple-250 mx-auto" />
                <p className="text-xs font-semibold">Circles are silent</p>
                <p className="text-[10px]">Send connection proposals to other designers in suggestions tab to begin networking!</p>
              </div>
            ) : (
              connectionsList.map((peer) => (
                <div key={peer.id} className="bento-card flex-row gap-4 justify-between items-center group hover:scale-[1.015] hover:border-red-500/25 pb-5">
                  <div className="flex items-center gap-4">
                    <Link to={`/profile/${peer.username}`} className="w-12 h-12 rounded-full overflow-hidden border border-red-500/15 flex-shrink-0 bg-red-50/10">
                      <img src={peer.avatar} className="w-full h-full object-cover" />
                    </Link>
                    <div className="space-y-0.5">
                      <Link to={`/profile/${peer.username}`} className="font-display font-semibold text-gray-900 text-sm hover:underline hover:text-primary block leading-none">{peer.displayName}</Link>
                      <span className="text-[10px] text-gray-400 block">Open status: Unlocked Direct Chat</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMessageUser(peer.id)}
                    className="p-2.5 bg-primary-light hover:bg-primary hover:text-white text-primary rounded-lg transition-all flex items-center justify-center shadow-sm"
                    title="Direct Message"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))
            )
          )}

        </div>
      )}

    </div>
  );
}
