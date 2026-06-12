import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Lightbulb, ArrowBigUp, ArrowBigDown, MessageSquare, Briefcase, Plus, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import HireModal from '../components/HireModal';
import { formatDistanceToNow } from 'date-fns';

export default function Ideas() {
  const { user, ideas, ideasLoading, fetchIdeas, publishIdea, upvoteIdea, downvoteIdea } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [selectedIdeaForHire, setSelectedIdeaForHire] = useState<any>(null);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setPublishing(true);
    try {
      await publishIdea({
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setTags('');
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-primary" />
            Idea Board
          </h1>
          <p className="text-gray-500 text-sm mt-1">Discover, critique, and collaborate on innovative concepts.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-sm text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Post an Idea
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative animate-fade-in">
          <button 
            onClick={() => setIsCreating(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-display tracking-tight text-gray-900 mb-4">Share an innovative idea</h2>
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the big idea?"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain how it works, the problem it solves, and what kind of collaboration you are looking for..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors min-h-[100px] resize-y"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. AI, Mobile App, 3D Design"
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={publishing || !title.trim() || !description.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-colors shadow-sm text-sm font-semibold"
              >
                {publishing ? 'Publishing...' : 'Publish Idea'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {ideasLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20 text-gray-500 space-y-3 bg-white rounded-2xl border border-gray-100">
            <Lightbulb className="w-8 h-8 mx-auto text-gray-300" />
            <p className="font-display font-medium text-lg text-gray-900">No ideas posted yet.</p>
            <p className="text-sm max-w-sm mx-auto">Be the first to share an innovative concept and find collaborators!</p>
          </div>
        ) : (
          ideas.map((idea) => {
            const upvoteCount = idea.upvotes.length - idea.downvotes.length;
            const hasUpvoted = user ? idea.upvotes.includes(user.id) : false;
            const hasDownvoted = user ? idea.downvotes.includes(user.id) : false;

            return (
              <div key={idea.id} className="bg-white rounded-2xl border border-gray-150 p-4 sm:p-6 flex gap-4 transition-all hover:border-gray-300">
                {/* Voting Column */}
                <div className="flex flex-col items-center gap-1 sm:px-2">
                  <button 
                    onClick={() => upvoteIdea(idea.id)}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${hasUpvoted ? 'text-primary' : 'text-gray-400'}`}
                  >
                    <ArrowBigUp className={`w-6 h-6 ${hasUpvoted ? 'fill-primary' : ''}`} />
                  </button>
                  <span className={`text-sm font-bold ${hasUpvoted ? 'text-primary' : hasDownvoted ? 'text-blue-600' : 'text-gray-700'}`}>
                    {upvoteCount}
                  </span>
                  <button 
                    onClick={() => downvoteIdea(idea.id)}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${hasDownvoted ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    <ArrowBigDown className={`w-6 h-6 ${hasDownvoted ? 'fill-blue-600' : ''}`} />
                  </button>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Link to={`/profile/${idea.authorUsername}`} className="flex items-center gap-1.5 hover:text-gray-900 transition-colors font-semibold bg-gray-50 pr-2 rounded-full border border-gray-100">
                      <img src={idea.authorAvatar} alt={idea.authorName} className="w-5 h-5 rounded-full object-cover" />
                      {idea.authorName}
                    </Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-display tracking-tight mb-1">{idea.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                  </div>

                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-red-50 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        {idea.comments || 0} Comments
                      </button>
                    </div>

                    {user && user.id !== idea.authorId && (
                      <button 
                        onClick={() => setSelectedIdeaForHire(idea)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Collab / Hire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <HireModal 
        isOpen={!!selectedIdeaForHire} 
        onClose={() => setSelectedIdeaForHire(null)}
        creativeId={selectedIdeaForHire?.authorId || ''}
        creativeName={selectedIdeaForHire?.authorName || ''}
        onShowToast={(msg) => console.log(msg)}
      />
    </div>
  );
}
