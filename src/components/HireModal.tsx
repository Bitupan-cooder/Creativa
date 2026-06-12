import React, { useState } from 'react';
import { useStore } from '../store';
import { X, Briefcase, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';

interface HireModalProps {
  creativeId: string;
  creativeName: string;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function HireModal({ creativeId, creativeName, isOpen, onClose, onShowToast }: HireModalProps) {
  const { submitHireRequest } = useStore();
  const [projectType, setProjectType] = useState<'Short-term gig' | 'Freelance' | 'Collab' | 'Full-time'>('Freelance');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('₹10,000 - ₹25,000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Milestone list builder
  const [miles, setMiles] = useState<string[]>(['Initial concept proposal drafts', 'Mid-point designs review', 'Final design files delivery']);
  const [newMile, setNewMile] = useState('');

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    if (!newMile.trim()) return;
    setMiles([...miles, newMile.trim()]);
    setNewMile('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setMiles(miles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your creative project requirements.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitHireRequest({
        creativeId,
        projectType,
        description,
        budget,
        milestones: miles
      });
      onShowToast(`💼 Job request proposal successfully submitted to ${creativeName}!`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to submit hire requested proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-sm" onClick={onClose} />

      {/* Frame Container */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg z-10 flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header toolbar */}
        <div className="px-6 py-4 border-b border-purple-50 flex justify-between items-center bg-purple-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold text-gray-900 text-sm">Hire Proposal: {creativeName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-purple-100 rounded-full text-gray-400 hover:text-gray-700 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-650 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-650" />
              <span>{error}</span>
            </div>
          )}

          {/* Type and Budget ranges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-gray-700 block">Project Agreement Type</label>
              <select
                value={projectType}
                onChange={(e: any) => setProjectType(e.target.value)}
                className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
              >
                <option value="Freelance">Freelance Gig</option>
                <option value="Short-term gig">Short-term gig</option>
                <option value="Collab">Unpaid Collab board</option>
                <option value="Full-time">Full-time Contract</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-gray-700 block">Budget Rate Bracket</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50"
              >
                <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000 (Slight scale)</option>
                <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000 (Medium project)</option>
                <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000 (Complete branding)</option>
                <option value="₹50,000+">₹50,000+ (High-end 3D arrays)</option>
              </select>
            </div>
          </div>

          {/* Description workspace */}
          <div className="space-y-1">
            <label className="font-semibold text-gray-700 block">Brief Project Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project deliverables, branding vibes, required design softwares, and deadline guidelines..."
              className="w-full px-3 py-2 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-350"
            />
          </div>

          {/* Milestones design tracker */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 block mb-1">Interactive Project Milestones</label>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              Define the progression key checkpoints. Accepted partners will track these directly in active chat panels.
            </p>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {miles.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-purple-50/50 px-2.5 py-1.5 rounded-lg border border-purple-100/35">
                  <span className="text-gray-700 font-medium">{m}</span>
                  <button type="button" onClick={() => handleRemoveMilestone(idx)} className="text-gray-400 hover:text-status-coral transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMile}
                onChange={(e) => setNewMile(e.target.value)}
                placeholder="Next check milestone (e.g., Deliver illustrations)..."
                className="flex-1 px-3 py-1.5 border border-purple-100 rounded-lg focus:outline-none focus:border-primary bg-purple-50 placeholder:text-gray-300 text-xs"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="p-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 inline-flex items-center justify-center leading-none"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Security escrow brief notice */}
          <div className="p-3 bg-indigo-50/40 border border-indigo-150 rounded-xl flex items-start gap-2 text-gray-600 leading-normal">
            <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed space-y-0.5">
              <span className="font-semibold text-primary block">Secure Escrow Protection</span>
              <span>All payment ranges are securely held inside Creativa Escrow until milestones checklists are accepted completed of both sides.</span>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="pt-4 border-t border-purple-50 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 hover:bg-gray-100 text-gray-600 font-semibold rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-opacity-95 transition-all"
            >
              {loading ? 'Submitting proposal...' : 'Submit Proposal'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
