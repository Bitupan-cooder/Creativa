import { create } from 'zustand';
import { User, Post, Connection, Conversation, Message, HireRequest, Notification, Idea } from './types';

// API request proxy helper
export async function apiRequest(path: string, method = 'GET', body?: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['X-Auth-Token'] = token;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(path, options);

  if (res.status === 401 || res.status === 403) {
    if (!path.includes('/api/auth/login') && !path.includes('/api/auth/register')) {
      localStorage.removeItem('creativa_token');
      localStorage.removeItem('creativa_user');
      try {
        useStore.getState().logout();
      } catch (e) {
        // useStore might not be declared/initialized yet
      }
    }
  }

  let data: any = null;
  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.toLowerCase().includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  if (!res.ok) {
    throw new Error((data && data.error) || 'Network error occurred');
  }

  return data;
}

// Global Creativa Application State Store
interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  authLoading: boolean;
  authError: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName: string; category: string }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  clearAuthError: () => void;

  // Discovery Feed & Posts
  posts: Post[];
  feedLoading: boolean;
  feedHasMore: boolean;
  feedPage: number;
  activeCategory: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchPosts: (category?: string, reset?: boolean) => Promise<void>;
  publishPost: (postData: { caption: string; category: string; tags: string; mediaUrl: string; scheduledAt?: string }) => Promise<Post>;
  deletePost: (postId: string) => Promise<void>;
  editPost: (postId: string, postData: { caption: string }) => Promise<void>;
  validatePost: (postData: { caption: string; mediaUrl: string }) => Promise<{ duplicate: boolean; message?: string }>;
  likePost: (postId: string) => Promise<void>;
  repostPost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  boards: any[];
  fetchBoards: (userId?: string) => Promise<void>;
  createBoard: (title: string, isPublic: boolean) => Promise<void>;
  savePostToBoard: (boardId: string, postId: string) => Promise<void>;

  // Ideas & Innovations
  ideas: Idea[];
  ideasLoading: boolean;
  fetchIdeas: () => Promise<void>;
  publishIdea: (data: { title: string; description: string; tags: string[] }) => Promise<void>;
  upvoteIdea: (ideaId: string) => Promise<void>;
  downvoteIdea: (ideaId: string) => Promise<void>;

  // Network & Connections
  suggestions: any[];
  receivedRequests: any[];
  connectionsList: any[];
  networkLoading: boolean;
  fetchNetworkSuggestions: () => Promise<void>;
  fetchReceivedRequests: () => Promise<void>;
  fetchConnectionsList: () => Promise<void>;
  sendConnectionRequest: (targetUserId: string) => Promise<void>;
  acceptConnectionRequest: (connectionId: string) => Promise<void>;
  declineConnectionRequest: (connectionId: string) => Promise<void>;

  // Messages & Chat
  conversations: any[];
  activeConversationId: string | null;
  activeMessages: Message[];
  activeProject: HireRequest | null;
  chatLoading: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, fileUrl?: string, fileType?: string) => Promise<void>;
  setActiveConversationId: (id: string | null) => void;

  // Secure Hire Flow
  incomingHireRequests: any[];
  outgoingHireRequests: any[];
  hireLoading: boolean;
  fetchHireRequests: () => Promise<void>;
  submitHireRequest: (req: { creativeId: string; projectType: string; description: string; budget: string; milestones: string[] }) => Promise<void>;
  acceptHireRequest: (hireId: string) => Promise<string>; // Returns conversationId for redirect
  declineHireRequest: (hireId: string) => Promise<void>;
  toggleMilestone: (hireId: string, milestoneId: string, done: boolean) => Promise<void>;

  // Notifications
  notifications: Notification[];
  notifCount: number;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // AI Curation Assistance
  aiAdvice: string | null;
  aiLoading: boolean;
  fetchAiAdvice: (prompt?: string) => Promise<void>;
  clearAiAdvice: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth INITIAL STATE
  user: localStorage.getItem('creativa_user') ? JSON.parse(localStorage.getItem('creativa_user')!) : null,
  token: localStorage.getItem('creativa_token') || null,
  authLoading: false,
  authError: null,

  login: async (credentials) => {
    set({ authLoading: true, authError: null });
    try {
      const data = await apiRequest('/api/auth/login', 'POST', credentials);
      localStorage.setItem('creativa_token', data.token);
      localStorage.setItem('creativa_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, authLoading: false });
    } catch (err: any) {
      set({ authError: err.message, authLoading: false });
      throw err;
    }
  },

  register: async (registerData) => {
    set({ authLoading: true, authError: null });
    try {
      const data = await apiRequest('/api/auth/register', 'POST', registerData);
      localStorage.setItem('creativa_token', data.token);
      localStorage.setItem('creativa_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, authLoading: false });
    } catch (err: any) {
      set({ authError: err.message, authLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('creativa_token');
    localStorage.removeItem('creativa_user');
    set({ user: null, token: null, conversations: [], activeConversationId: null, activeMessages: [] });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('creativa_token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      const data = await apiRequest('/api/auth/me', 'GET', undefined, token);
      set({ user: data.user, token, authLoading: false });
      localStorage.setItem('creativa_user', JSON.stringify(data.user));
    } catch (err: any) {
      console.error('Session verification failed:', err);
      // If verification fails, clear everything
      localStorage.removeItem('creativa_token');
      localStorage.removeItem('creativa_user');
      set({ user: null, token: null, authLoading: false });
    }
  },

  updateProfile: async (profileData) => {
    const { token, user } = get();
    if (!token || !user) return;
    try {
      const data = await apiRequest('/api/users/profile/update', 'POST', profileData, token);
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('creativa_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err: any) {
      console.error('Failed to update profile', err);
    }
  },

  clearAuthError: () => set({ authError: null }),

  // Discovery Feed & Posts STATE
  posts: [],
  feedLoading: false,
  feedHasMore: true,
  feedPage: 1,
  activeCategory: 'All',
  searchQuery: '',

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchPosts(get().activeCategory, true);
  },

  fetchPosts: async (category, reset = false) => {
    const { token, posts, activeCategory, searchQuery, feedLoading } = get();
    if (!token) return;
    if (feedLoading && !reset) return;

    const targetCategory = category !== undefined ? category : activeCategory;

    // Correctly offset page based on existing number of items loaded in this category
    const currentCategoryPosts = reset
      ? []
      : posts; // Simplify local counting, let backend handle actual pagination offset with page param better over time.
    const pageToFetch = reset ? 1 : Math.floor(currentCategoryPosts.length / 20) + 1;

    set({ feedLoading: true, activeCategory: targetCategory });
    try {
      let url = `/api/posts?category=${encodeURIComponent(targetCategory)}&page=${pageToFetch}&limit=20`;
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const data = await apiRequest(url, 'GET', undefined, token);
      set((state) => {
        const incomingPosts = data.posts || [];
        const existingPosts = reset ? [] : state.posts;

        // Prevent duplicate items to guard against rapid scroll race conditions or offset shifts
        const newUniquePosts = incomingPosts.filter(
          (incoming: any) => !existingPosts.some((existing) => existing.id === incoming.id)
        );

        const currentPostsCount =
          existingPosts.filter(
            (p) =>
              targetCategory.toLowerCase() === 'all' ||
              p.category.toLowerCase() === targetCategory.toLowerCase()
          ).length + newUniquePosts.length;

        return {
          posts: reset ? incomingPosts : [...existingPosts, ...newUniquePosts],
          feedPage: reset ? 2 : Math.floor(currentPostsCount / 20) + 1,
          feedHasMore: data.hasMore,
          feedLoading: false,
        };
      });
    } catch (err: any) {
      set({ feedLoading: false });
      console.error('Error fetching discovery posts', err);
      if (err.message && (
        err.message.includes('not found') || 
        err.message.includes('token') || 
        err.message.includes('denied') || 
        err.message.includes('expired')
      )) {
        get().logout();
      }
    }
  },

  publishPost: async (postData) => {
    const { token, posts } = get();
    if (!token) throw new Error('Unauthenticated');
    try {
      const data = await apiRequest('/api/posts', 'POST', postData, token);
      set({ posts: [data.post, ...posts] });
      return data.post;
    } catch (err: any) {
      console.error('Error creating post', err);
      throw err;
    }
  },

  deletePost: async (postId) => {
    const { token, posts } = get();
    if (!token) throw new Error('Unauthenticated');
    try {
      await apiRequest(`/api/posts/${postId}`, 'DELETE', undefined, token);
      set({ posts: posts.filter(p => p.id !== postId) });
    } catch (err: any) {
      console.error('Error deleting post', err);
      throw err;
    }
  },

  editPost: async (postId, postData) => {
    const { token, posts } = get();
    if (!token) throw new Error('Unauthenticated');
    try {
      const res = await apiRequest(`/api/posts/${postId}`, 'PUT', postData, token);
      set({ posts: posts.map(p => p.id === postId ? res.post : p) });
    } catch (err: any) {
      console.error('Error editing post', err);
      throw err;
    }
  },

  validatePost: async (postData) => {
    const { token } = get();
    if (!token) throw new Error('Unauthenticated');
    try {
      const data = await apiRequest('/api/posts/validate', 'POST', postData, token);
      return data;
    } catch (err: any) {
      console.error('Error validating post', err);
      throw err;
    }
  },

  likePost: async (postId) => {
    const { token, posts, user } = get();
    if (!token || !user) return;

    // Optimistic UI update! Change client status immediately
    const originalPosts = [...posts];
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const alreadyLiked = p.likes.includes(user.id);
        const nextLikes = alreadyLiked ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id];
        return { ...p, likes: nextLikes };
      }
      return p;
    });

    set({ posts: updated });

    try {
      await apiRequest(`/api/posts/${postId}/like`, 'POST', undefined, token);
    } catch (err: any) {
      console.error('Failed to register like on server, reverting.', err);
      set({ posts: originalPosts });
    }
  },

  repostPost: async (postId) => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiRequest(`/api/posts/${postId}/repost`, 'POST', undefined, token);
      set((state) => ({ posts: [data.post, ...state.posts] }));
    } catch (err: any) {
      console.error('Reposting crashed', err);
      throw err;
    }
  },

  addComment: async (postId, content) => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiRequest(`/api/posts/${postId}/comments`, 'POST', { content }, token);
      set((state) => ({
        posts: state.posts.map((p) => {
          if (p.id === postId) {
            return { ...p, comments: [...p.comments, data.comment] };
          }
          return p;
        }),
      }));
    } catch (err: any) {
      console.error('Failed to post comment', err);
    }
  },

  boards: [],
  fetchBoards: async (userId?: string) => {
    const { token, user } = get();
    if (!token) return;
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;
    try {
      const data = await apiRequest(`/api/boards/${targetUserId}`, 'GET', undefined, token);
      set({ boards: data.boards || [] });
    } catch (e) {
      console.error(e);
    }
  },
  createBoard: async (title, isPublic) => {
    const { token, boards } = get();
    if (!token) return;
    try {
      const data = await apiRequest('/api/boards', 'POST', { title, isPublic }, token);
      set({ boards: [...boards, data.board] });
    } catch (e) {
      console.error(e);
    }
  },
  savePostToBoard: async (boardId, postId) => {
    const { token, boards } = get();
    if (!token) return;
    try {
      const data = await apiRequest(`/api/boards/${boardId}/posts`, 'POST', { postId }, token);
      set({ boards: boards.map((b) => (b.id === boardId ? data.board : b)) });
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Ideas STATE
  ideas: [],
  ideasLoading: false,

  fetchIdeas: async () => {
    const { token } = get();
    if (!token) return;
    set({ ideasLoading: true });
    try {
      const data = await apiRequest('/api/ideas', 'GET', undefined, token);
      set({ ideas: data.ideas || [], ideasLoading: false });
    } catch (err: any) {
      set({ ideasLoading: false });
      console.error('Error fetching ideas', err);
    }
  },

  publishIdea: async (ideaData) => {
    const { token, ideas } = get();
    if (!token) throw new Error('Unauthenticated');
    try {
      const data = await apiRequest('/api/ideas', 'POST', ideaData, token);
      if (data.idea) {
        set({ ideas: [data.idea, ...ideas] });
      }
    } catch (err: any) {
      console.error('Failed to publish idea', err);
      throw err;
    }
  },

  upvoteIdea: async (ideaId) => {
    const { token, ideas, user } = get();
    if (!token || !user) return;
    
    // Optimistic UI update
    set({
      ideas: ideas.map(idea => ({
        ...idea,
        upvotes: idea.id === ideaId 
          ? (idea.upvotes.includes(user.id) ? idea.upvotes.filter(id => id !== user.id) : [...idea.upvotes, user.id])
          : idea.upvotes,
        downvotes: idea.id === ideaId ? idea.downvotes.filter(id => id !== user.id) : idea.downvotes
      }))
    });

    try {
      await apiRequest(`/api/ideas/${ideaId}/upvote`, 'POST', undefined, token);
    } catch (err) {
      console.error('Failed to upvote idea', err);
      get().fetchIdeas(); // revert on failure
    }
  },

  downvoteIdea: async (ideaId) => {
    const { token, ideas, user } = get();
    if (!token || !user) return;

    // Optimistic UI update
    set({
      ideas: ideas.map(idea => ({
        ...idea,
        downvotes: idea.id === ideaId 
          ? (idea.downvotes.includes(user.id) ? idea.downvotes.filter(id => id !== user.id) : [...idea.downvotes, user.id])
          : idea.downvotes,
        upvotes: idea.id === ideaId ? idea.upvotes.filter(id => id !== user.id) : idea.upvotes
      }))
    });

    try {
      await apiRequest(`/api/ideas/${ideaId}/downvote`, 'POST', undefined, token);
    } catch (err) {
      console.error('Failed to downvote idea', err);
      get().fetchIdeas(); // revert on failure
    }
  },

  // Connections (LinkedIn network system)
  suggestions: [],
  receivedRequests: [],
  connectionsList: [],
  networkLoading: false,

  fetchNetworkSuggestions: async () => {
    const { token } = get();
    if (!token) return;
    set({ networkLoading: true });
    try {
      const data = await apiRequest('/api/connections/suggestions', 'GET', undefined, token);
      set({ suggestions: data.suggestions, networkLoading: false });
    } catch (err) {
      set({ networkLoading: false });
      console.error('Failed loading suggestions', err);
    }
  },

  fetchReceivedRequests: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiRequest('/api/connections/requests', 'GET', undefined, token);
      set({ receivedRequests: data.requests });
    } catch (err) {
      console.error('Failed loading requests', err);
    }
  },

  fetchConnectionsList: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiRequest('/api/connections/all', 'GET', undefined, token);
      set({ connectionsList: data.connections });
    } catch (err) {
      console.error('Failed loading connections list', err);
    }
  },

  sendConnectionRequest: async (targetUserId) => {
    const { token } = get();
    if (!token) return;
    try {
      await apiRequest(`/api/connections/request/${targetUserId}`, 'POST', {}, token);
      set((state) => ({
        suggestions: state.suggestions.filter((s) => s.id !== targetUserId),
      }));
    } catch (err: any) {
      console.error('Failed request connection', err);
      throw err;
    }
  },

  acceptConnectionRequest: async (connectionId) => {
    const { token } = get();
    if (!token) return;
    try {
      await apiRequest(`/api/connections/accept/${connectionId}`, 'POST', {}, token);
      set((state) => ({
        receivedRequests: state.receivedRequests.filter((r) => r.id !== connectionId),
      }));
      // Refresh network elements
      get().fetchConnectionsList();
    } catch (err: any) {
      console.error('Failed accept connection', err);
    }
  },

  declineConnectionRequest: async (connectionId) => {
    const { token } = get();
    if (!token) return;
    try {
      await apiRequest(`/api/connections/decline/${connectionId}`, 'POST', {}, token);
      set((state) => ({
        receivedRequests: state.receivedRequests.filter((r) => r.id !== connectionId),
      }));
    } catch (err: any) {
      console.error('Failed decline', err);
    }
  },

  // Interactive Chats & Messages
  conversations: [],
  activeConversationId: null,
  activeMessages: [],
  activeProject: null,
  chatLoading: false,

  fetchConversations: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiRequest('/api/chat/conversations', 'GET', undefined, token);
      set({ conversations: data.conversations });
    } catch (err) {
      console.error('Failed loading conversaciones', err);
    }
  },

  fetchMessages: async (conversationId) => {
    const { token } = get();
    if (!token) return;
    set({ chatLoading: true });
    try {
      const data = await apiRequest(`/api/chat/messages/${conversationId}`, 'GET', undefined, token);
      set({
        activeMessages: data.messages,
        activeProject: data.project || null,
        activeConversationId: conversationId,
        chatLoading: false,
      });
      // Mark read locally in sidebar conversations
      get().fetchConversations();
    } catch (err) {
      set({ chatLoading: false });
      console.error('Failed loading message history', err);
    }
  },

  sendMessage: async (content, fileUrl, fileType) => {
    const { token, activeConversationId, activeMessages } = get();
    if (!token) return;

    try {
      const data = await apiRequest('/api/chat/messages', 'POST', {
        conversationId: activeConversationId,
        content,
        fileUrl,
        fileType,
      }, token);

      // Prepend or add new message
      set({
        activeMessages: [...activeMessages, data.messageDetails],
        activeConversationId: data.messageDetails.conversationId,
      });

      // Fetch chats list list updates
      get().fetchConversations();
    } catch (err: any) {
      console.error('Failed dispatching chat bubble', err);
    }
  },

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  // Secure Hire Workflow STATE
  incomingHireRequests: [],
  outgoingHireRequests: [],
  hireLoading: false,

  fetchHireRequests: async () => {
    const { token } = get();
    if (!token) return;
    set({ hireLoading: true });
    try {
      const inc = await apiRequest('/api/hire/incoming', 'GET', undefined, token);
      const out = await apiRequest('/api/hire/outgoing', 'GET', undefined, token);
      set({ incomingHireRequests: inc.requests, outgoingHireRequests: out.requests, hireLoading: false });
    } catch (err) {
      set({ hireLoading: false });
      console.error('Failed pulling hire agreements list', err);
    }
  },

  submitHireRequest: async (req) => {
    const { token } = get();
    if (!token) return;
    try {
      await apiRequest('/api/hire/request', 'POST', req, token);
    } catch (err) {
      console.error('Failed submitting hire request', err);
      throw err;
    }
  },

  acceptHireRequest: async (hireId) => {
    const { token } = get();
    if (!token) throw new Error('Unauthenticated');
    try {
      const data = await apiRequest(`/api/hire/accept/${hireId}`, 'POST', {}, token);
      get().fetchHireRequests();
      return data.conversationId;
    } catch (err) {
      console.error('Failed accept hire proposal', err);
      throw err;
    }
  },

  declineHireRequest: async (hireId) => {
    const { token } = get();
    if (!token) return;
    try {
      await apiRequest(`/api/hire/decline/${hireId}`, 'POST', {}, token);
      get().fetchHireRequests();
    } catch (err) {
      console.error('Failed decline hire proposal', err);
    }
  },

  toggleMilestone: async (hireId, milestoneId, done) => {
    const { token, activeProject } = get();
    if (!token) return;
    try {
      const data = await apiRequest(`/api/hire/milestone/${hireId}`, 'PATCH', { milestoneId, done }, token);
      if (activeProject && activeProject.id === hireId) {
        set({ activeProject: data.hireRequest });
      }
      get().fetchHireRequests();
    } catch (err) {
      console.error('Failed toggle milestone', err);
    }
  },

  // Notifications
  notifications: [],
  notifCount: 0,

  fetchNotifications: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const data = await apiRequest('/api/notifications', 'GET', undefined, token);
      const unread = data.notifications.filter((n: any) => !n.read).length;
      set({ notifications: data.notifications, notifCount: unread });
    } catch (err: any) {
      console.error('Failed pulling notifications', err);
      if (err.message && (
        err.message.includes('not found') || 
        err.message.includes('token') || 
        err.message.includes('denied') || 
        err.message.includes('expired')
      )) {
        get().logout();
      }
    }
  },

  markAllNotificationsRead: async () => {
    const { token } = get();
    if (!token) return;
    try {
      await apiRequest('/api/notifications/read-all', 'POST', {}, token);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        notifCount: 0,
      }));
    } catch (err) {
      console.error('Failed clearing badge counts', err);
    }
  },

  // AI Interactive Services
  aiAdvice: null,
  aiLoading: false,

  fetchAiAdvice: async (customPrompt) => {
    const { token, user } = get();
    if (!token || !user) return;
    set({ aiLoading: true, aiAdvice: null });
    try {
      const data = await apiRequest('/api/gemini/curate', 'POST', { prompt: customPrompt }, token);
      set({ aiAdvice: data.advice, aiLoading: false });
    } catch (err: any) {
      set({ aiAdvice: err.message || 'Unable to connect to AI assistant. Make sure your GEMINI_API_KEY is active.', aiLoading: false });
    }
  },

  clearAiAdvice: () => set({ aiAdvice: null }),
}));
