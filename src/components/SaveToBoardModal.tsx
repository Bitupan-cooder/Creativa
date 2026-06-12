import React, { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { useStore } from '../store';

interface SaveToBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export default function SaveToBoardModal({ isOpen, onClose, postId }: SaveToBoardModalProps) {
  const { boards, fetchBoards, createBoard, savePostToBoard } = useStore();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen, fetchBoards]);

  if (!isOpen || !postId) return null;

  const handleCreateAndSave = async () => {
    if (!newBoardTitle.trim()) return;
    await createBoard(newBoardTitle, isPublic);
    setNewBoardTitle('');
    setIsCreating(false);
    setTimeout(() => {
       fetchBoards();
    }, 500);
  };

  const handleSaveToBoard = async (boardId: string) => {
    try {
      await savePostToBoard(boardId, postId);
      onClose();
    } catch (e) {
      // Ignored
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-xl z-10">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm">Save to Board</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-2 max-h-[40vh] overflow-y-auto">
          {boards?.length === 0 && !isCreating && (
            <p className="p-4 text-xs text-gray-500 text-center">You have no boards yet.</p>
          )}
          {boards?.map((board) => {
            const isSaved = board.posts.includes(postId);
            return (
              <button
                key={board.id}
                onClick={() => handleSaveToBoard(board.id)}
                disabled={isSaved}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg text-left"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{board.title}</span>
                  <span className="text-[10px] text-gray-400">{board.isPublic ? 'Public' : 'Private'} • {board.posts.length} items</span>
                </div>
                {isSaved ? <Check className="w-4 h-4 text-green-500" /> : <Plus className="w-4 h-4 text-gray-400" />}
              </button>
            )
          })}
        </div>

        {isCreating ? (
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
            <input
              type="text"
              placeholder="Board title..."
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-red-500 transition-colors"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isPublic" 
                checked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)} 
                className="accent-red-500"
              />
              <label htmlFor="isPublic" className="text-xs text-gray-600 cursor-pointer">Make it public</label>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleCreateAndSave} disabled={!newBoardTitle.trim()} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Create</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsCreating(true)} 
            className="flex items-center justify-center gap-2 m-2 p-3 border-2 border-dashed border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-xs"
          >
            <Plus className="w-4 h-4" />
            Create new board
          </button>
        )}
      </div>
    </div>
  );
}
