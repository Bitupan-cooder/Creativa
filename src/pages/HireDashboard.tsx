import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Briefcase, Clock, CheckCircle2, XCircle, ChevronRight, User, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HireDashboard() {
  const {
    incomingHireRequests,
    outgoingHireRequests,
    hireLoading,
    fetchHireRequests,
    acceptHireRequest,
    declineHireRequest,
    user
  } = useStore();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchHireRequests();
  }, []);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      const conversationId = await acceptHireRequest(id);
      // Redirect straight into chat with milestone tracker loaded
      navigate('/chat');
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setProcessingId(id);
    try {
      await declineHireRequest(id);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-150 text-status-teal text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active Order
          </span>
        );
      case 'declined':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-50 border border-red-150 text-status-coral text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-150 text-orange-605 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Assessment Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-6">
      
      {/* Dashboard Headline details */}
      <div className="space-y-1">
        <h2 className="font-display font-medium text-xl text-gray-950">Jobs Workspace Dashboard</h2>
        <p className="text-xs text-gray-400">Track professional project contracts, review incoming requests, schedule checkpoints, and lock securely milestone targets.</p>
      </div>

      {/* Tabs selectors toggle */}
      <div className="flex border-b border-purple-50">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2.5 font-display text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'incoming'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Incoming Freelance Gig Offers ({incomingHireRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2.5 font-display text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'outgoing'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-primary'
          }`}
        >
          Sent Procurement Proposals ({outgoingHireRequests.length})
        </button>
      </div>

      {/* Lists workspace loading check */}
      {hireLoading ? (
        <div className="py-24 flex justify-center items-center gap-2">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-xs text-gray-450 font-medium">Retrieving secure contract files catalog from escrow ledger...</span>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Incoming Offers */}
          {activeTab === 'incoming' && (
            incomingHireRequests.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-purple-100 rounded-2xl bg-white text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-purple-250 mx-auto" />
                <p className="text-xs font-semibold font-sans">No incoming gigs</p>
                <p className="text-[10px] max-w-xs mx-auto leading-normal">Ensure "Open to professional hire job inquiries" check state is activated on your portfolio profile settings.</p>
              </div>
            ) : (
              incomingHireRequests.map((req) => (
                <div key={req.id} className="bento-card space-y-4 text-xs hover:border-red-500/25">
                  
                  {/* Upper bar */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-100 bg-purple-50">
                        <img src={req.buyer?.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{req.projectType} proposal</span>
                        <span className="text-[10px] text-gray-400">issued by @{req.buyer?.username} | Rating: {req.buyer?.rating || '5.0'}</span>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Core description text */}
                  <div className="p-3 bg-purple-50/20 border border-purple-50 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Requirement Brief:</span>
                    <p className="text-gray-650 leading-relaxed font-sans">{req.description}</p>
                  </div>

                  {/* Pricing info & dynamic checklist */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-purple-50/50 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-405 uppercase block">Proposed Payment Amount:</span>
                      <span className="font-bold text-sm text-primary font-display">{req.budget}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-405 uppercase block">Checkpoints map ({req.milestones?.length || 0}):</span>
                      <div className="space-y-1 text-gray-600 font-medium text-[11px]">
                        {req.milestones?.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Acceptance CTAs if pending */}
                  {req.status === 'pending' && (
                    <div className="flex justify-end gap-3 pt-3 border-t border-purple-50/40">
                      <button
                        onClick={() => handleDecline(req.id)}
                        disabled={processingId === req.id}
                        className="px-4 py-2 border border-purple-150 text-gray-650 font-bold hover:bg-gray-50 rounded-xl transition-all"
                      >
                        Decline Gig
                      </button>
                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={processingId === req.id}
                        className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-opacity-95 shadow-sm transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                        Accept & Commmence
                      </button>
                    </div>
                  )}

                  {req.status === 'accepted' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => navigate('/chat')}
                        className="px-4 py-1.5 text-primary bg-primary-light font-bold rounded-xl flex items-center gap-1 hover:bg-primary hover:text-white transition-all border border-primary/20"
                      >
                        View Interactive Chat Workspace
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              ))
            )
          )}

          {/* Outgoing Offers */}
          {activeTab === 'outgoing' && (
            outgoingHireRequests.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-purple-100 rounded-2xl bg-white text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-purple-250 mx-auto" />
                <p className="text-xs font-semibold">No active bids submitted</p>
                <p className="text-[10px] max-w-xs mx-auto leading-normal">Open a professional colleague profile screen and press "Hire Creative" to send custom project structures.</p>
              </div>
            ) : (
              outgoingHireRequests.map((req) => (
                <div key={req.id} className="bento-card space-y-4 text-xs hover:border-red-500/25">
                  
                  {/* Upper info row */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-100 bg-purple-50">
                        <img src={req.creative?.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Freelancer partner: {req.creative?.displayName}</span>
                        <span className="text-[10px] text-gray-400">Proposed for project category: {req.creative?.category}</span>
                      </div>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Requirements brief description */}
                  <div className="p-3 bg-indigo-50/15 border border-purple-50 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-wider block">Procurement statement:</span>
                    <p className="text-gray-650 leading-relaxed font-sans">{req.description}</p>
                  </div>

                  {/* Finance review & checkpoints */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-purple-50/50 pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-450 block uppercase">Committed flat rate:</span>
                      <span className="font-bold text-sm text-primary font-display">{req.budget}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gray-455 block uppercase">Progress milestones map:</span>
                      <div className="space-y-1 text-gray-600 font-medium text-[11px]">
                        {req.milestones?.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            <span className={m.done ? 'line-through text-gray-400' : ''}>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {req.status === 'accepted' && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => navigate('/chat')}
                        className="px-4 py-1.5 text-primary bg-primary-light font-bold rounded-xl flex items-center gap-1 hover:bg-primary hover:text-white transition-all border border-primary/20"
                      >
                        Check active checkpoints board
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              ))
            )
          )}

        </div>
      )}

    </div>
  );
}
