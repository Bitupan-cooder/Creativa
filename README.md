# Creativa

A vibrant platform for creative professionals to showcase their work, collaborate with peers, discover opportunities, and get AI-powered guidance.

## 🤖 Built with GitHub Copilot

This project was built with extensive assistance from **GitHub Copilot**, which helped with:

- **Component Architecture**: Designing React components with TypeScript
- **API Integration**: Writing Express.js backend endpoints and REST API calls
- **State Management**: Implementing Zustand store patterns and business logic
- **Type Safety**: Creating and refining TypeScript interfaces and types
- **Feature Development**: Building features like authentication, real-time chat, hire requests, notifications, and more
- **Code Quality**: Suggesting refactoring patterns and code improvements
- **Testing & Debugging**: Identifying issues and suggesting fixes

GitHub Copilot accelerated development significantly by providing intelligent code suggestions, reducing boilerplate, and helping maintain consistency across the codebase.

## 🧠 AI Integration

Creativa uses **Google Gemini API** for AI-powered recommendations and guidance. 

### Why Gemini API instead of Microsoft Azure AI?

We chose Google Gemini because:
- **No subscription required** for initial development and testing
- **Free tier** with generous usage limits
- **Quick setup** without complex billing configurations
- **Flexible API** that's easy to integrate with Express.js backend
- **Excellent for creative industry** use cases with strong language understanding

### AI Features

The platform includes an **IQ Copilot Assistant** that helps users with:

- **Portfolio Reviews**: Analyze and provide feedback on user projects
- **Idea Generation**: Generate creative concepts and project ideas
- **Project Recommendations**: Suggest relevant projects based on skills
- **Internship Finding**: Discover internship opportunities matching expertise
- **Copyright Protection**: Check content for potential copyright issues
- **Collaboration Matching**: Find potential collaborators for projects

## 🏗️ How It Works

### Architecture Overview

```
Frontend (React + TypeScript + Vite)
           ↓
Express.js Backend Server
           ↓
┌─────────────────────────────────┐
│  - User Authentication          │
│  - Post Management              │
│  - Network & Connections        │
│  - Chat & Messaging             │
│  - Hire Request Flow            │
│  - Notifications                │
│  - Gemini AI Integration        │
└─────────────────────────────────┘
           ↓
Local Database (JSON-based)
```

### Core Modules

**Authentication**
- User registration with role selection (Designer, Developer, Creative, etc.)
- Password encryption using PBKDF2
- Token-based authentication with JWT
- Profile management

**Discovery Feed**
- Browse creative projects from other users
- Filter by categories (3D & Motion, Graphic Design, Web Development, etc.)
- Like, comment, and repost functionality
- Search and tag-based filtering
- Duplicate content detection using AI validation

**Ideas & Innovation**
- Publish and share creative ideas
- Community voting system (upvote/downvote)
- Idea discovery and trending

**Network**
- Connection requests and friend system
- Network suggestions based on skill compatibility
- View connection profiles and portfolios

**Chat & Messaging**
- Real-time direct messaging with other users
- Conversation history persistence
- Support for file sharing in messages

**Secure Hire Flow**
- Post project hire requests
- Receive hire proposals from other creatives
- Milestone-based project tracking
- Secure payment-intent integration ready

**Notifications**
- Real-time activity notifications
- Connection requests
- New messages
- Post interactions

**AI Curation**
- `/api/gemini/curate` endpoint powered by Gemini API
- Context-aware prompts sent to AI assistant
- Instant feedback and recommendations

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Google Gemini API Key** (free from [ai.google.dev](https://ai.google.dev))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bitupan-cooder/Creativa.git
   cd Creativa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your free API key from: https://ai.google.dev/

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

## 📚 Project Structure

```
creativa/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── AiAssistant.tsx     # IQ Copilot panel
│   │   ├── MasonryGrid.tsx     # Feed grid layout
│   │   ├── ShareModal.tsx      # Social sharing
│   │   └── ...
│   ├── pages/              # Route pages
│   │   ├── Home.tsx           # Discovery feed
│   │   ├── Chat.tsx           # Messaging page
│   │   ├── Profile.tsx        # User profile
│   │   ├── Network.tsx        # Connections
│   │   └── ...
│   ├── App.tsx             # Main app component with routing
│   ├── store.ts            # Zustand state management
│   ├── types.ts            # TypeScript interfaces
│   └── main.tsx            # React entry point
├── server.ts               # Express.js backend
├── vite.config.ts          # Vite build configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🎯 Key Features in Detail

### AI-Powered Recommendations

When users open the IQ Copilot, they receive instant AI-generated advice:

```typescript
// Frontend calls
fetchAiAdvice(customPrompt)

// Backend route
POST /api/gemini/curate
{
  "prompt": "Review my latest portfolio projects and provide constructive feedback."
}

// AI response integrated with Gemini
const response = await client.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: [{role: 'user', parts: [{text: prompt}]}],
  config: {maxOutputTokens: 500},
});
```

### Authentication & Security

- Passwords hashed with PBKDF2 + salt
- Token-based request validation
- Protected API endpoints require authentication
- User tokens stored in localStorage (secure for demo)

### Real-time Features

- Instant notifications on interactions
- Message delivery
- Connection request updates
- Milestone progress tracking

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check without emitting
npm run lint

# Clean build artifacts
npm run clean
```

## 📦 Dependencies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Express.js** - Backend server
- **Zustand** - State management
- **TailwindCSS** - Styling
- **React Router** - Client-side routing
- **Google GenAI SDK** - Gemini API integration
- **Lucide React** - Icon library
- **Motion** - Animation library

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Fetch discovery feed
- `POST /api/posts` - Create new post (protected)
- `PUT /api/posts/:id` - Edit post (protected)
- `DELETE /api/posts/:id` - Delete post (protected)
- `POST /api/posts/validate` - Validate post for duplicates
- `POST /api/posts/:id/like` - Like a post (protected)
- `POST /api/posts/:id/comment` - Add comment (protected)

### AI Services
- `POST /api/gemini/curate` - Get AI recommendations (protected)

### Network
- `GET /api/network/suggestions` - Get connection suggestions
- `POST /api/network/connect` - Send connection request
- `GET /api/network/connections` - Get user connections

### Chat
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/:id/messages` - Get messages in conversation
- `POST /api/conversations/:id/messages` - Send message

### Hire
- `GET /api/hire/requests` - Get hire requests
- `POST /api/hire/request` - Create hire request
- `POST /api/hire/request/:id/accept` - Accept hire request

## 🌟 Future Enhancements

- Real-time socket.io integration for instant updates
- File upload with cloud storage (AWS S3, Cloudinary)
- Payment processing for hire requests
- Video portfolio support
- Advanced AI features (image analysis, portfolio scoring)
- Mobile app version
- Analytics dashboard

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

**Built with ❤️ and 🤖 GitHub Copilot**
