import { useStore } from '../store';
import { X, Heart, MessageSquare, Repeat, UserPlus, Briefcase, FileText, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { notifications, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleActionClick = (n: any) => {
    onClose();
    if (n.type === 'message') {
      navigate('/chat');
    } else if (n.type === 'connection_request' || n.type === 'connection_accepted') {
      navigate('/network');
    } else if (n.type === 'hire_request' || n.type === 'hire_accepted') {
      navigate('/hire-dashboard');
    } else if (n.postId) {
      // Refresh current profile username relative to post author username if needed
      navigate('/');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-status-coral fill-status-coral" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'repost':
        return <Repeat className="w-4 h-4 text-status-teal" />;
      case 'connection_request':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'connection_accepted':
        return <UserPlus className="w-4 h-4 text-status-teal" />;
      case 'hire_request':
        return <Briefcase className="w-4 h-4 text-purple-700" />;
      case 'hire_accepted':
        return <CheckCheck className="w-4 h-4 text-status-teal" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderDescription = (n: any) => {
    switch (n.type) {
      case 'like':
        return 'liked your portfolio design';
      case 'comment':
        return 'commented on your project';
      case 'repost':
        return 'reposted your project to their profile';
      case 'connection_request':
        return 'sent you a connection request';
      case 'connection_accepted':
        return 'accepted your connection request!';
      case 'hire_request':
        return 'sent you a professional project hire proposal!';
      case 'hire_accepted':
        return 'accepted your project agreement! Milestone space activated.';
      case 'message':
        return `messaged you: "${n.messageContent || 'Shared a file attachment'}"`;
      default:
        return 'triggered an alert';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-inverse-surface/30 backdrop-blur-[3px]" onClick={onClose} />

      {/* Slide-in sidebar */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10">
        
        {/* Header Toolbar */}
        <div className="px-5 py-4 border-b border-purple-50 flex justify-between items-center h-16 bg-purple-50/50 flex-shrink-0">
          <h3 className="font-display font-semibold text-gray-900 text-sm">Notifications</h3>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 bg-purple-100/50 px-2.5 py-1 rounded-full transition-all"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-purple-100 rounded-full text-gray-400 hover:text-gray-700 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-24 text-gray-400 space-y-2">
              <span className="text-3xl">📭</span>
              <p className="text-xs font-semibold">Workspace is entirely quiet</p>
              <p className="text-[10px] text-gray-400 max-w-[180px] mx-auto">Likes, connections, messages, and project hires will populate details here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleActionClick(n)}
                className={`flex gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-purple-50/30 ${
                  n.read ? 'bg-white border-purple-50/50' : 'bg-purple-50/10 border-purple-100/40 shadow-sm'
                }`}
              >
                {/* Status Indicator circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-purple-100 bg-purple-50">
                    <img src={n.actorAvatar} alt="Actor" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                    {getNotificationIcon(n.type)}
                  </div>
                </div>

                {/* Body details */}
                <div className="flex-1 text-xs space-y-0.5">
                  <p className="text-gray-905">
                    <span className="font-semibold text-gray-900">{n.actorName}</span>{' '}
                    <span>{renderDescription(n)}</span>
                  </p>
                  <span className="text-[9px] text-gray-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>

                {/* Optional thumbnail preview */}
                {n.postThumbnail && (
                  <img
                    src={n.postThumbnail}
                    alt="Snippet thumbnail"
                    className="w-10 h-10 rounded-md object-cover border border-purple-50 flex-shrink-0 align-top"
                  />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
