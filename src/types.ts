export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location: string;
  skills: string[];
  category: string;
  openToWork: boolean;
  openToCollab: boolean;
  hireRate: string;
  rating: number;
  connections: string[]; // User IDs (accepted)
  followers: string[];   // User IDs
  following: string[];   // User IDs
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  tags: string[];
  category: string;
  likes: string[]; // User IDs
  reposts: string[]; // User IDs
  comments: Comment[];
  isRepost?: boolean;
  repostedBy?: string; // Username of person who reposted
  originalPostId?: string;
  views: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Connection {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSenderId?: string;
  hireRequestId?: string; // Link to project context if chat from hire
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  read: boolean;
  createdAt: string;
}

export interface HireRequest {
  id: string;
  clientId: string; // Recruiter/Client
  creativeId: string; // The artist
  projectType: 'Short-term gig' | 'Freelance' | 'Collab' | 'Full-time';
  description: string;
  budget: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  milestones: { id: string; title: string; done: boolean }[];
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'like' | 'comment' | 'repost' | 'connection_request' | 'connection_accepted' | 'hire_request' | 'hire_accepted' | 'message';
  actorId: string;
  actorName: string;
  actorAvatar: string;
  postId?: string;
  postThumbnail?: string;
  hireRequestId?: string;
  messageContent?: string;
  read: boolean;
  createdAt: string;
}

export interface Idea {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  description: string;
  tags: string[];
  upvotes: string[]; // User IDs
  downvotes: string[]; // User IDs
  comments: number;
  createdAt: string;
}
