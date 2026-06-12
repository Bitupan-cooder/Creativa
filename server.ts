import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'db.json');

let seedUsers: any[];
let seedPosts: any[];

// Setup body parser large limit for bases64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Helper to encrypt passwords using pbkdf2 native crypto
function hashPassword(password: string): string {
  const salt = 'creativa_super_secret_salt_123';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// Ensure database file exits with seed data
function generateDemoPosts(users: any[]): any[] {
  const posts: any[] = [];
  
  const categoryData: Record<string, {
    authorId: string;
    photos: string[];
    captions: string[];
    tags: string[];
  }> = {
    '3D & Motion': {
      authorId: 'elena_rostova',
      photos: [
        'photo-1618005182384-a83a8bd57fbe',
        'photo-1618005198143-d36679237ecf',
        'photo-1634017839464-5c339ebe3cb4',
        'photo-1601049676099-e7ed07d825b0',
        'photo-1508739773434-c26b3d09e071',
        'photo-1541701494587-cb58502866ab',
        'photo-1550745165-9bc0b252726f',
        'photo-1579546929518-9e396f3cc809',
        'photo-1618005158179-023f9ec367eb',
        'photo-1536924940846-227afb31e2a5',
        'photo-1558591710-4b4a1ae0f04d'
      ],
      captions: [
        'Neon Geometrics — light tunnels synthesizing 3D feedback loops.',
        'Hyper-fluid chrome studies of organic digital matter.',
        'Metamaterial physics render in Octane. Light passing through multi-faceted lattices.',
        'Polygonal architectural landscape using parametric generation trees.',
        'Vapourwave terminal concept. Exploring high saturation digital retro aesthetics.',
        'Monolithic pillars floating in abstract mathematically defined spaces.',
        'Subtle refractive glass layers casting dispersion prisms onto a slate canvas.',
        'Kinetic motion arrays exploring gravity variations in Blender.',
        'Abstract hologram projection study with neon light emissions.',
        'Luminescent voxel topography mapping terrain heights dynamically.'
      ],
      tags: ['3D Modeling', 'Blender', 'Octane Render', 'C4D', 'Generative']
    },
    'UI/UX': {
      authorId: 'marcus_chen',
      photos: [
        'photo-1541462608141-ad4979e408c9',
        'photo-1551288049-bebda4e38f71',
        'photo-1581291518633-83b4ebd1d83e',
        'photo-1586717791821-3f44a563fa4c',
        'photo-1507238691740-187a5b1d37b8',
        'photo-1586717791821-3f44a563fa4c',
        'photo-1460925895917-afdab827c52f',
        'photo-1522542550221-31fd19575a2d',
        'photo-1542744094-3a31f103e35f',
        'photo-1581291518857-4e27b48ff24e'
      ],
      captions: [
        'Fintech Dashboard - light-mode curves with deep margins & high contrast.',
        'Interactive music synthesizer layout. Real-time feedback waveforms.',
        'Mobile design system tokens: harmonizing color step intervals.',
        'Autonomous ride-hailing app interface. High-contrast route guides.',
        'Neomorphic control panels for home automation devices.',
        'User journey maps focusing on reducing transaction friction.',
        'Minimalist crypto index dashboard tracker. Styled in Tailwind tones.',
        'SaaS landing page layout. Optimizing focal layout above the fold.',
        'Design sprint workshop templates. Built directly inside Figma.',
        'Tactile UI elements featuring smooth drop-shadow configurations.'
      ],
      tags: ['Figma', 'UI Design', 'Design System', 'Prototyping', 'Tailwind']
    },
    'Branding': {
      authorId: 'sarah_jenkins',
      photos: [
        'photo-1509281373149-e957c6296406',
        'photo-1626785774573-4b799315345d',
        'photo-1513542789411-b6a5d4f31634',
        'photo-1545235617-9465d2a55698',
        'photo-1586075010923-2dd4570fb338',
        'photo-1516979187457-637abb4f9353',
        'photo-1558655146-d09347e92766',
        'photo-1611162617213-7d7a39e9b1d7',
        'photo-1527067829737-402a11567790',
        'photo-1606857521015-7f9fcf423740'
      ],
      captions: [
        'Aura Stationary Identity: corporate styling with calm breathing room.',
        'Minimalist tea company logomark. Clean typographic brand guidelines.',
        'Eco-sustainable merchandise branding. Earth-toned ink prints.',
        'Geometric monogram system for an architectural firm.',
        'Artisan coffee beans packaging mockups. Tactile paper textures.',
        'Type-centric visual identity for a modern design studio in London.',
        'Luxury perfume brand guide. Deep margins, high serif typography.',
        'Art gallery branding deck. Emphasizing radical negative space.',
        'Craft brewery visual system. Embossed copper foil stamps.',
        'Scented candle identity mockups. Warm amber tone selections.'
      ],
      tags: ['Branding', 'Logo Design', 'Corporate Identity', 'Brand Guidelines', 'Illustrator']
    },
    'Illustration': {
      authorId: 'david_lee',
      photos: [
        'photo-1579783902614-a3fb3927b6a5',
        'photo-1579783928621-7a13d66a62d1',
        'photo-1563089145-599997674d42',
        'photo-1579783900882-c0d3dad7b119',
        'photo-1549490349-8643362247b5',
        'photo-1618005182384-a83a8bd57fbe',
        'photo-1618005198143-d36679237ecf',
        'photo-1579783901586-d88ed74b4ec4',
        'photo-1533158326339-7f3cf2404354',
        'photo-1554188718-d01690b29f13'
      ],
      captions: [
        'Cyber Oasis: high-saturation neon columns against dark brutalist towers.',
        'Astral Wanderers - digital artwork combining oil textures & stardust.',
        'The Neon Rain: conceptual cityscape painting exploring reflection depths.',
        'Cybernetic anatomy draft. Fusing glowing synthetic nerves.',
        'Solitude: digital character concept in an endless pastel horizon.',
        'Abstract vectors exploring deep galactic overlays and nebulas.',
        'Future Noir: low-key illuminated detective figure in the rain.',
        'Holographic foliage study. Fluorescent botanical vector paths.',
        'Chasing Echoes: vibrant abstract oil painting with heavy knife work.',
        'The Clockwork Heart: concept steampunk technical design sketch.'
      ],
      tags: ['Digital Art', 'Concept Art', 'Photoshop', 'Procreate', 'Illustration']
    },
    'Typography': {
      authorId: 'mio_takahashi',
      photos: [
        'photo-1561070791-26c113006238',
        'photo-1626785774573-4b799315345d',
        'photo-1513542789411-b6a5d4f31634',
        'photo-1545235617-9465d2a55698',
        'photo-1516979187457-637abb4f9353',
        'photo-1618005182384-a83a8bd57fbe',
        'photo-1586075010923-2dd4570fb338',
        'photo-1601049676099-e7ed07d825b0',
        'photo-1618005198143-d36679237ecf',
        'photo-1550745165-9bc0b252726f'
      ],
      captions: [
        'WebGL Reactive Shaders formatting brutalist type hierarchies.',
        'Kinetic text matrices tracking mouse coordinates.',
        'Variable weight typeface experiments. Seamless transitions.',
        'Custom geometric serif character set design vectors.',
        'Brutalist typographic layout system using monospace accents.',
        'Deconstructed poster layouts highlighting negative alphabet blocks.',
        'Fluorescent neon letters mapping physical space.',
        'Tactile letterpress experiments: raw ink on heavily debossed cardboard.',
        'Asynchronous reading channels concept for fluid interfaces.',
        'Sleek Swiss sans-serif typography specifications guide.'
      ],
      tags: ['Typography', 'Type Design', 'Layout', 'Font Creation', 'Brutalism']
    },
    'Graphic Design': {
      authorId: 'lukas_keller',
      photos: [
        'photo-1626785774573-4b799315345d',
        'photo-1561070791-26c113006238',
        'photo-1509281373149-e957c6296406',
        'photo-1550745165-9bc0b252726f',
        'photo-1579546929518-9e396f3cc809',
        'photo-1536924940846-227afb31e2a5',
        'photo-1545235617-9465d2a55698',
        'photo-1586717791821-3f44a563fa4c',
        'photo-1513542789411-b6a5d4f31634',
        'photo-1586075010923-2dd4570fb338'
      ],
      captions: [
        'Brutalist booklet system for sustainable architectural space.',
        'High-contrast poster design focusing on industrial typography.',
        'Visual design layout with bold grid overlays and geometric lines.',
        'Experimental book design. Custom ink density on craft surfaces.',
        'Symmetrical poster layouts based on golden ratio patterns.',
        'Geometric card set layouts. Deep black background tones.',
        'Zine mockup featuring raw risograph print textures.',
        'Constructivist layout study. Heavy red and black bar compositions.',
        'Minimalist promotional cards mapping physical architecture.',
        'Sleek editorial magazine spread designs using wide margins.'
      ],
      tags: ['Graphic Design', 'Poster Art', 'InDesign', 'Layout', 'Vector Art']
    }
  };

  const categories = Object.keys(categoryData);
  const userMap = new Map(users.map(u => [u.id, u]));

  let postIndex = 1;
  for (const category of categories) {
    const data = categoryData[category];
    const author = userMap.get(data.authorId) || users[0];

    // Create 18 high-quality items per category -> 108 posts total!
    for (let i = 0; i < 18; i++) {
      const photoId = data.photos[i % data.photos.length];
      const caption = data.captions[i % data.captions.length];
      const extraNum = i > 0 ? ` Vol. ${Math.ceil((i + 1) / 3)}` : '';
      
      const tagCount = 2 + (i % 3);
      const postTags = data.tags.slice(0, tagCount);

      const otherUsers = users.filter(u => u.id !== author.id);
      const likesCount = (i * 7 + 3) % otherUsers.length;
      const postLikes = otherUsers.slice(0, likesCount).map(u => u.id);

      posts.push({
        id: `post_gen_${postIndex}`,
        authorId: author.id,
        authorName: author.displayName,
        authorUsername: author.username,
        authorAvatar: author.avatar,
        mediaUrl: `https://images.unsplash.com/` + photoId + `?auto=format&fit=crop&q=80&w=800`,
        mediaType: 'image' as const,
        caption: `${caption}${extraNum} — designed as a demo contribution to build the active collection network.`,
        tags: postTags,
        category: category,
        likes: postLikes,
        reposts: [],
        comments: [],
        views: 45 + (postIndex * 13) % 400,
        createdAt: new Date(Date.now() - (postIndex * 3 * 3600000)).toISOString()
      });
      postIndex++;
    }
  }

  return posts;
}

function initializeDatabase() {
  // Pre-seed some professional creatives
  seedUsers = [
    {
      id: 'elena_rostova',
      username: 'elena',
      email: 'elena@creativa.network',
      passwordHash: hashPassword('password123'),
      displayName: 'Elena Rostova',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAzNNc6Mtkq0KB0UiL3X6Ad2o_1GDIMgTd9kpVBIoeqAr7T3yD-fyePEqivTbAkMXSf40fQHmEV7Lh-qxVP1vmpMTosn8jyqM0Vzb8CSmTHishJ2cWRPmbZTZe_GDABoomql7VPK0coiRkdsalLBJmOHSiqxJQEXlA3l2c-QeDO1h_TPZ8_EPLWpntLUOV1lSHSo9EtAqs10qy4ih8uBrKAr4IX1Of9Zzi2ZKOKaBmnv6clPKVVQ0CBnH1HMuGY7hwW13ZZUmViRcQ',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      bio: '3D Artist & Digital Sculptor transforming abstract math into glowing holographic landscapes.',
      location: 'Berlin, Germany',
      skills: ['3D Modeling', 'Octane Render', 'Blender', 'Generative Art', 'Abstract Motion'],
      category: '3D & Motion',
      openToWork: true,
      openToCollab: true,
      hireRate: '$65/hr',
      rating: 4.9,
      connections: ['marcus_chen'],
      followers: ['marcus_chen', 'sarah_jenkins'],
      following: ['marcus_chen'],
      streakDays: 12,
      checkedInToday: true,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'marcus_chen',
      username: 'marcus',
      email: 'marcus@creativa.network',
      passwordHash: hashPassword('password123'),
      displayName: 'Marcus Chen',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYlXBBf4JngeMaXv1n4oI532-0zjnkkUW5cz_7WyCewALzX0NGnrL8RalXOHUz_lKYU5Loll_h0jVoqCzIT_bUZzWKESpkLzXxHyr50sUrPl00S79ltQt0NCPD8Jyg8T0eIjvjBJsJP8CIOmFyumqBnmKSC8JYnNMo6sofSAfY2PGXpjpE2UqWtMWmpiOyc05xoXQXdhOAs7cicE9E3yHvCEHRcXX3VylhiWucDDVn3qFbPeBkGoGa-VJ0kFr-BbBslyOyMpYx9CI7',
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
      bio: 'UI/UX Designer mapping complex data structures into high-softness interactive dashboards.',
      location: 'San Francisco, CA',
      skills: ['Figma', 'UI Architecture', 'Prototyping', 'Design Systems', 'Data Vis'],
      category: 'UI/UX',
      openToWork: true,
      openToCollab: false,
      text: 'Consistency active',
      hireRate: '$85/hr',
      rating: 5.0,
      connections: ['elena_rostova', 'sarah_jenkins'],
      followers: ['elena_rostova'],
      following: ['elena_rostova', 'david_lee'],
      streakDays: 8,
      checkedInToday: false,
      lastCheckInDate: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sarah_jenkins',
      username: 'sarah',
      email: 'sarah@creativa.network',
      passwordHash: hashPassword('password123'),
      displayName: 'Sarah Jenkins',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDybg0lIcvzqz36sEInhWj-rbtBla5_9-lmBMvgiCIkbQmmhFOjhs4cFGB5Syxu-VyY57hHrawKTBc4zPqWHaESEEvhi8AHYUsf-rZXSFa83z65gvOo_RUJN4EfLk8sDYl09iPDxn6menx_tdn2DJBLLgMkYuuJ4KZXWI2jzP6QIs5FlXs4nspYxGITvRiUvaV7lmFVxygN2utR_DpskAOKmcIuGIyrPRFe5zOn-QWSy0lvvfB2Ul3espMjvAPxJmi7WLdR2pItnpDq',
      coverImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80',
      bio: 'Brand Identity craftsperson. Arranging letterheads and typography with quiet, editorial breathing room.',
      location: 'London, UK',
      skills: ['Branding', 'Editorial Design', 'Typography', 'Logo Craft', 'Illustrator'],
      category: 'Branding',
      openToWork: false,
      openToCollab: true,
      hireRate: '$70/hr',
      rating: 4.8,
      connections: ['marcus_chen'],
      followers: ['marcus_chen'],
      following: ['marcus_chen'],
      streakDays: 5,
      checkedInToday: true,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'david_lee',
      username: 'david',
      email: 'david@creativa.network',
      passwordHash: hashPassword('password123'),
      displayName: 'David Lee',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdJKEbyqGUBE2hxlWz1gpRD5tcEioJ597ICSsuQr3f8kL822zxUwjjFY11a31MEaPhDSF2QMvnGrodTy5QS680BBVrh-D2r2ZZ5pnb4_Gxddk7e1JPgGADgOThnnYDVbW2jZyHoUE5hSjUDXNz9v9l5LU205diICSF2_fIDAFyrP9yR0OpHnrvBXxgOFNWShBCwxA_cTRTY9WBnQcGODdnU_pAtTwZsG6RNaoweP4pcR6oTGs1VqiNHC4utIXd_AgpYJtSoP64DeJg',
      coverImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80',
      bio: 'Futuristic digital illustrator breathing neon cyber aesthetics into industrial cityscapes.',
      location: 'Seoul, South Korea',
      skills: ['Digital Direct Painting', 'Photoshop', 'Krita', 'Cyberpunk Aesthetics', 'Concept Art'],
      category: 'Illustration',
      openToWork: true,
      openToCollab: true,
      createdAt: new Date().toISOString(),
      connections: [],
      followers: ['marcus_chen'],
      following: [],
      streakDays: 3,
      checkedInToday: false,
      lastCheckInDate: '',
      hireRate: '$50/hr',
      rating: 4.7,
    },
    {
      id: 'mio_takahashi',
      username: 'mio',
      email: 'mio@creativa.network',
      passwordHash: hashPassword('password123'),
      displayName: 'Mio Takahashi',
      avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23dfe5e7"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23ffffff"/></svg>',
      coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80',
      bio: 'Interaction technologist focusing on generative canvas webs, canvas mechanics, and reactive typeface systems.',
      location: 'Kyoto, Japan',
      skills: ['WebGL', 'Typography', 'P5.js', 'Reactive Type', 'Tailwind'],
      category: 'Typography',
      openToWork: true,
      openToCollab: true,
      createdAt: new Date().toISOString(),
      connections: [],
      followers: ['marcus_chen', 'elena_rostova'],
      following: [],
      streakDays: 15,
      checkedInToday: true,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      hireRate: '$90/hr',
      rating: 4.9,
    },
    {
      id: 'lukas_keller',
      username: 'lukas',
      email: 'lukas@creativa.network',
      passwordHash: hashPassword('password123'),
      displayName: 'Lukas Keller',
      avatar: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23dfe5e7"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23ffffff"/></svg>',
      coverImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80',
      bio: 'Spatial Graphic Designer exploring minimalist brutalist architecture & layout typography systems.',
      location: 'Vienna, Austria',
      skills: ['InDesign', 'Layout systems', 'Corporate Identity', 'Brutalist Design'],
      category: 'Graphic Design',
      openToWork: false,
      openToCollab: true,
      createdAt: new Date().toISOString(),
      connections: [],
      followers: [],
      following: [],
      streakDays: 9,
      checkedInToday: false,
      lastCheckInDate: '',
      hireRate: '$60/hr',
      rating: 4.6,
    }
  ];

  seedPosts = generateDemoPosts(seedUsers);

  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (data.users && data.posts) {
        let dirty = false;
        // Backfill any missing seed users so we always have the new creators
        const currentIds = new Set(data.users.map((u: any) => u.id));
        seedUsers.forEach(user => {
          if (!currentIds.has(user.id)) {
            data.users.push(user);
            dirty = true;
          }
        });
        
        // Also inject high-performance consistency indicators back onto existing users if omitted
        data.users.forEach((u: any) => {
          if (u.streakDays === undefined) {
            u.streakDays = u.id === 'elena_rostova' ? 12 : u.id === 'marcus_chen' ? 8 : u.id === 'sarah_jenkins' ? 5 : u.id === 'david_lee' ? 3 : 4;
            u.checkedInToday = u.id === 'elena_rostova' || u.id === 'sarah_jenkins';
            u.lastCheckInDate = u.checkedInToday ? new Date().toISOString().split('T')[0] : '';
            dirty = true;
          }
        });

        // Ensure we have posts loaded to satisfy demo scope, but do not wipe if just < 100 from deleting.
        if (data.posts.length < 40) {
          data.posts = seedPosts;
          dirty = true;
          console.log('Seeded original demo feed posts.');
        }

        if (!data.boards) {
          data.boards = [];
          dirty = true;
        }

        if (dirty) {
          fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
          console.log('Database updated with new creators and extra portfolio pictures.');
        } else {
          console.log('Database loaded successfully from file.');
        }
        return;
      }
    } catch (e) {
      console.error('Error loading database, re-initializing...', e);
    }
  }

  const initialDB = {
    users: seedUsers,
    posts: seedPosts,
    connections: [
      {
        id: 'conn_1',
        requesterId: 'elena_rostova',
        recipientId: 'marcus_chen',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'conn_2',
        requesterId: 'sarah_jenkins',
        recipientId: 'marcus_chen',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    conversations: [],
    messages: [],
    hireRequests: [],
    notifications: [],
    ideas: [],
    boards: []
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
  console.log('Database initialized successfully recursively with seeded content.');
}

// Read database helper
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    console.error('Error reading DB, re-initializing', e);
    initializeDatabase();
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }
}

// Write database helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing DB', e);
  }
}

// Call init of DB
initializeDatabase();

// Authentication middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  let token: string | undefined = undefined;

  // Check custom header first to bypass strict external proxy/WAF rules
  const xAuthToken = req.headers['x-auth-token'];
  if (xAuthToken && typeof xAuthToken === 'string') {
    token = xAuthToken;
  } else {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Access denied, Authorization or X-Auth-Token header required' });
    return;
  }

  // Decrypt/Find user from token. In our mock setup, the token is simply "mock-jwt-<userId>"
  if (!token.startsWith('mock-jwt-')) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  const userId = token.replace('mock-jwt-', '');
  const db = readDB();
  const user = db.users.find((u: any) => u.id === userId);

  if (!user) {
    res.status(403).json({ error: 'User associated with token not found' });
    return;
  }

  (req as any).user = user;
  next();
}


// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, displayName, category } = req.body;

  if (!username || !email || !password || !displayName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const db = readDB();
  const existingUser = db.users.find(
    (u: any) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    res.status(400).json({ error: 'Username or Email is already registered' });
    return;
  }

  const userId = `user_${Date.now()}`;
  const newUser = {
    id: userId,
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashPassword(password),
    displayName: displayName.trim(),
    avatar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" fill="%23dfe5e7"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23ffffff"/></svg>`,
    bio: `Hey, I'm ${displayName}! Creative professional on Creativa.`,
    location: 'Remote',
    skills: [],
    category: category || 'General Creative',
    openToWork: false,
    openToCollab: false,
    hireRate: '$30/hr',
    rating: 5.0,
    connections: [],
    followers: [],
    following: [],
    streakDays: 1,
    checkedInToday: true,
    lastCheckInDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  const token = `mock-jwt-${userId}`;
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      displayName: newUser.displayName,
      avatar: newUser.avatar,
      bio: newUser.bio,
      location: newUser.location,
      skills: newUser.skills,
      category: newUser.category,
      openToWork: newUser.openToWork,
      openToCollab: newUser.openToCollab,
      hireRate: newUser.hireRate,
      rating: newUser.rating,
      connections: newUser.connections,
      followers: newUser.followers,
      following: newUser.following,
      streakDays: newUser.streakDays,
      checkedInToday: newUser.checkedInToday,
      lastCheckInDate: newUser.lastCheckInDate,
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Missing email or password' });
    return;
  }

  const db = readDB();
  const user = db.users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()
  );

  console.log('Login attempt for:', email);
  if (user) {
    console.log('User found:', user.username);
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let dirty = false;
    if (user.lastCheckInDate !== todayStr && user.lastCheckInDate !== yesterdayStr) {
      // Missed a day or no previous check-in, start from 1
      user.streakDays = 1;
      user.checkedInToday = true;
      user.lastCheckInDate = todayStr;
      dirty = true;
    } else if (user.lastCheckInDate === yesterdayStr) {
      // Logged in yesterday, increment
      user.streakDays = (user.streakDays || 0) + 1;
      user.checkedInToday = true;
      user.lastCheckInDate = todayStr;
      dirty = true;
    }

    if (dirty) {
      writeDB(db);
    }
  } else {
    console.log('User NOT found');
  }

  if (!user) {
    res.status(400).json({ error: 'User not found' });
    return;
  }
  
  if (user.passwordHash !== hashPassword(password)) {
    res.status(400).json({ error: 'Incorrect password' });
    return;
  }

  const token = `mock-jwt-${user.id}`;
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      coverImage: user.coverImage,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      category: user.category,
      openToWork: user.openToWork,
      openToCollab: user.openToCollab,
      hireRate: user.hireRate,
      rating: user.rating,
      connections: user.connections,
      followers: user.followers,
      following: user.following,
      streakDays: user.streakDays || 0,
      checkedInToday: !!user.checkedInToday,
      lastCheckInDate: user.lastCheckInDate,
    }
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const authUser = (req as any).user;
  res.json({ user: authUser });
});


// --- USER PROFILE ENDPOINTS ---

app.get('/api/users/:username', authenticateToken, (req, res) => {
  const username = req.params.username;
  const currentAuthUser = (req as any).user;
  const db = readDB();

  const user = db.users.find((u: any) => u.username === username.toLowerCase());
  if (!user) {
    res.status(444).json({ error: 'Creative professional profile not found' });
    return;
  }

  // Get user's posts
  const userPosts = db.posts.filter((p: any) => p.authorId === user.id || p.repostedBy === user.username);

  // Compute detailed relationship status relative to requester
  let connectionStatus = 'none'; // 'none', 'pending_sent', 'pending_received', 'connected'
  const connection = db.connections.find(
    (c: any) =>
      (c.requesterId === currentAuthUser.id && c.recipientId === user.id) ||
      (c.requesterId === user.id && c.recipientId === currentAuthUser.id)
  );

  if (connection) {
    if (connection.status === 'accepted') {
      connectionStatus = 'connected';
    } else if (connection.status === 'pending') {
      if (connection.requesterId === currentAuthUser.id) {
        connectionStatus = 'pending_sent';
      } else {
        connectionStatus = 'pending_received';
      }
    }
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      coverImage: user.coverImage,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      category: user.category,
      openToWork: user.openToWork,
      openToCollab: user.openToCollab,
      hireRate: user.hireRate,
      rating: user.rating,
      connections: user.connections,
      followers: user.followers,
      following: user.following,
      streakDays: user.streakDays || 0,
      checkedInToday: !!user.checkedInToday,
      lastCheckInDate: user.lastCheckInDate
    },
    posts: userPosts,
    connectionStatus,
    connectionId: connection?.id
  });
});

app.post('/api/users/checkin', authenticateToken, (req, res) => {
  const currentAuthUser = (req as any).user;
  const db = readDB();
  const user = db.users.find((u: any) => u.id === currentAuthUser.id);

  if (!user) {
    res.status(404).json({ error: 'User does not exist' });
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (user.lastCheckInDate !== todayStr) {
    user.streakDays = (user.streakDays || 0) + 1;
    user.lastCheckInDate = todayStr;
    user.checkedInToday = true;
    
    // Propagate changes to our cache
    db.users = db.users.map((u: any) => u.id === user.id ? user : u);
    writeDB(db);
    res.json({ message: 'Day target logged! Consistency streak updated.', user });
  } else {
    res.json({ message: 'Already marked consistency today', user });
  }
});

app.post('/api/users/profile/update', authenticateToken, (req, res) => {
  const currentAuthUser = (req as any).user;
  const { displayName, bio, location, skills, category, openToWork, openToCollab, hireRate, coverImage, avatar } = req.body;

  const db = readDB();
  const userIdx = db.users.findIndex((u: any) => u.id === currentAuthUser.id);

  if (userIdx === -1) {
    res.status(404).json({ error: 'User does not exist' });
    return;
  }

  // Update allowed fields
  const user = db.users[userIdx];
  if (displayName) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;
  if (location) user.location = location;
  if (skills) user.skills = skills;
  if (category) user.category = category;
  if (openToWork !== undefined) user.openToWork = openToWork;
  if (openToCollab !== undefined) user.openToCollab = openToCollab;
  if (hireRate !== undefined) user.hireRate = hireRate;
  if (coverImage !== undefined) user.coverImage = coverImage;
  if (avatar !== undefined) user.avatar = avatar;

  writeDB(db);
  res.json({ message: 'Profile updated successfully', user });
});


// --- DISCOVERY POST FEED ENDPOINTS ---

app.get('/api/posts', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const categoryParam = req.query.category as string || 'All';
  const searchQuery = req.query.q as string || '';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const db = readDB();
  let posts = [...db.posts];

  // 1. Filter by category if not 'All'
  if (categoryParam && categoryParam.toLowerCase() !== 'all') {
    posts = posts.filter(
      (p: any) => p.category.toLowerCase() === categoryParam.toLowerCase()
    );
  }

  // Filter out posts scheduled for the future
  posts = posts.filter(
    (p: any) => !p.scheduledAt || new Date(p.scheduledAt) <= new Date()
  );

  // Filter by Search Query
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    posts = posts.filter((p: any) => {
      const matchCaption = p.caption?.toLowerCase().includes(q);
      const matchTags = Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q));
      
      const author = p.author;
      const matchAuthor = author && (
        author.displayName?.toLowerCase().includes(q) || 
        author.username?.toLowerCase().includes(q)
      );

      return matchCaption || matchTags || matchAuthor;
    });
  }

  // 2. AI curation scoring algorithm based on user interest
  // Compute user favorite categories & tags from posts they already liked!
  const userLikes = db.posts.filter((p: any) => p.likes && p.likes.includes(currentUser.id));
  const categoryWeights: Record<string, number> = {};
  const tagWeights: Record<string, number> = {};

  userLikes.forEach((p: any) => {
    categoryWeights[p.category] = (categoryWeights[p.category] || 0) + 2;
    if (p.tags && Array.isArray(p.tags)) {
      p.tags.forEach((t: string) => {
        tagWeights[t] = (tagWeights[t] || 0) + 1.5;
      });
    }
  });

  // Calculate score for each post
  posts = posts.map((post: any) => {
    let score = 0;
    // Add category weight
    score += categoryWeights[post.category] || 0;
    // Add tagged weights
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => {
        score += tagWeights[tag] || 0;
      });
    }
    // Give slight boost to more viewed items (views / 100) and recent posts
    score += post.views / 200;
    const daysOld = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 3600 * 24);
    score += Math.max(0, 10 - daysOld * 0.5); // Boost newer items

    return { ...post, curationScore: parseFloat(score.toFixed(2)) };
  });

  // Sort by curationScore descending (AI recommended), fallback to recent
  posts.sort((a: any, b: any) => {
    const scoreDiff = b.curationScore - a.curationScore;
    if (Math.abs(scoreDiff) > 0.1) {
      return scoreDiff;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination slice
  const startIndex = (page - 1) * limit;
  const paginatedPosts = posts.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < posts.length;

  res.json({
    posts: paginatedPosts,
    page,
    hasMore,
    total: posts.length
  });
});

app.post('/api/posts', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { caption, category, tags, mediaUrl, mediaType, scheduledAt } = req.body;

  if (!mediaUrl || !category) {
    res.status(400).json({ error: 'Media and Category are required to publish portfolio' });
    return;
  }

  const db = readDB();
  const newPost = {
    id: `post_${Date.now()}`,
    authorId: currentUser.id,
    authorName: currentUser.displayName,
    authorUsername: currentUser.username,
    authorAvatar: currentUser.avatar,
    mediaUrl,
    mediaType: mediaType || 'image',
    caption: caption || '',
    tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    category,
    likes: [],
    reposts: [],
    comments: [],
    views: 1,
    createdAt: new Date().toISOString(),
    scheduledAt: scheduledAt || null
  };

  db.posts.unshift(newPost);
  writeDB(db);

  res.status(201).json({ message: 'Project published directly to feed!', post: newPost });
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const postID = req.params.id;

  const db = readDB();
  const postIdx = db.posts.findIndex((p: any) => p.id === postID);

  if (postIdx === -1) {
    res.json({ success: true, message: 'Post already deleted' });
    return;
  }

  if (db.posts[postIdx].authorId !== currentUser.id) {
    res.status(403).json({ error: 'You may only delete your own posts' });
    return;
  }

  db.posts.splice(postIdx, 1);
  writeDB(db);

  res.json({ success: true });
});

app.post('/api/posts/validate', authenticateToken, (req, res) => {
  const { caption, mediaUrl } = req.body;
  const db = readDB();
  
  // Real-time copyright/plagiarism detection check
  const isDuplicate = db.posts.some((p: any) => p.caption === caption || p.mediaUrl === mediaUrl);
  
  if (isDuplicate) {
    res.json({ duplicate: true, message: 'Plagiarism Detected: This content appears to be a copy of an existing post.' });
  } else {
    res.json({ duplicate: false });
  }
});

app.put('/api/posts/:id', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const postID = req.params.id;
  const { caption } = req.body;

  const db = readDB();
  const postIdx = db.posts.findIndex((p: any) => p.id === postID);

  if (postIdx === -1) {
    res.status(404).json({ error: `Post ${postID} not found or was deleted` });
    return;
  }

  if (db.posts[postIdx].authorId !== currentUser.id) {
    res.status(403).json({ error: 'You may only edit your own posts' });
    return;
  }

  if (caption !== undefined) {
    db.posts[postIdx].caption = caption;
  }
  
  writeDB(db);
  res.json({ success: true, post: db.posts[postIdx] });
});

// --- Boards (Saved Posts) APIs ---

app.get('/api/boards/:userId', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const targetUserId = req.params.userId;
  const db = readDB();
  const userBoards = (db.boards || []).filter((b: any) => 
    b.userId === targetUserId && (b.isPublic || currentUser.id === targetUserId)
  );
  res.json({ boards: userBoards });
});

app.post('/api/boards', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { title, isPublic } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const db = readDB();
  if (!db.boards) db.boards = [];

  const newBoard = {
    id: `board_${Date.now()}`,
    userId: currentUser.id,
    title,
    isPublic: !!isPublic,
    posts: [],
    createdAt: new Date().toISOString()
  };

  db.boards.push(newBoard);
  writeDB(db);
  res.status(201).json({ board: newBoard });
});

app.post('/api/boards/:id/posts', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const boardId = req.params.id;
  const { postId } = req.body;

  const db = readDB();
  const board = (db.boards || []).find((b: any) => b.id === boardId);

  if (!board) return res.status(404).json({ error: 'Board not found' });
  if (board.userId !== currentUser.id) return res.status(403).json({ error: 'Not your board' });

  if (!board.posts.includes(postId)) {
    board.posts.push(postId);
    writeDB(db);
  }
  
  res.json({ board });
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const postID = req.params.id;

  const db = readDB();
  const postIdx = db.posts.findIndex((p: any) => p.id === postID);

  if (postIdx === -1) {
    res.status(404).json({ error: 'Post catalog not found' });
    return;
  }

  const post = db.posts[postIdx];
  const likedIdx = post.likes.indexOf(currentUser.id);

  let status = 'liked';
  if (likedIdx > -1) {
    // Unlike post
    post.likes.splice(likedIdx, 1);
    status = 'unliked';
  } else {
    // Like post
    post.likes.push(currentUser.id);

    // Trigger Notification for the author (only if they aren't the liker!)
    if (post.authorId !== currentUser.id) {
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        recipientId: post.authorId,
        type: 'like',
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        actorAvatar: currentUser.avatar,
        postId: post.id,
        postThumbnail: post.mediaUrl,
        read: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  writeDB(db);
  res.json({ message: `Successfully ${status} portfolio item`, likes: post.likes, status });
});

app.post('/api/posts/:id/repost', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const postID = req.params.id;

  const db = readDB();
  const post = db.posts.find((p: any) => p.id === postID);

  if (!post) {
    res.status(404).json({ error: 'Original portfolio content not found' });
    return;
  }

  // Check if they already reposted
  if (post.reposts.includes(currentUser.id)) {
    res.status(400).json({ error: 'You have already reposted this work' });
    return;
  }

  post.reposts.push(currentUser.id);

  // Prepend a copy as a repost record
  const repostRecord = {
    ...post,
    id: `post_repost_${Date.now()}`,
    isRepost: true,
    repostedBy: currentUser.username,
    originalPostId: post.id,
    views: 0,
    createdAt: new Date().toISOString()
  };

  db.posts.unshift(repostRecord);

  // Notify author of repost
  if (post.authorId !== currentUser.id) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: post.authorId,
      type: 'repost',
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorAvatar: currentUser.avatar,
      postId: post.id,
      postThumbnail: post.mediaUrl,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);
  res.json({ message: 'Reposted onto profile timeline', post: repostRecord });
});

app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const postID = req.params.id;
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Comment body can not be empty' });
    return;
  }

  const db = readDB();
  const postIdx = db.posts.findIndex((p: any) => p.id === postID);

  if (postIdx === -1) {
    res.status(404).json({ error: 'Post not found for commenting' });
    return;
  }

  const comment = {
    id: `comment_${Date.now()}`,
    postId: postID,
    authorId: currentUser.id,
    authorName: currentUser.displayName,
    authorUsername: currentUser.username,
    authorAvatar: currentUser.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  db.posts[postIdx].comments.push(comment);

  // Send Notification to author
  const postAuthorId = db.posts[postIdx].authorId;
  if (postAuthorId !== currentUser.id) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: postAuthorId,
      type: 'comment',
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorAvatar: currentUser.avatar,
      postId: postID,
      postThumbnail: db.posts[postIdx].mediaUrl,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);
  res.status(201).json({ message: 'Comment submitted successfully', comment });
});


// --- CONNECTIONS & LINKEDIN NETWORK FLOW ---

app.post('/api/connections/request/:userId', authenticateToken, (req, res) => {
  const currentAuthUser = (req as any).user;
  const recipientId = req.params.userId;

  if (currentAuthUser.id === recipientId) {
    res.status(400).json({ error: 'You can not connect with yourself' });
    return;
  }

  const db = readDB();
  const recipientUser = db.users.find((u: any) => u.id === recipientId);
  if (!recipientUser) {
    res.status(404).json({ error: 'Target network professional not found' });
    return;
  }

  // Check if connection already exists in any state
  const existing = db.connections.find(
    (c: any) =>
      (c.requesterId === currentAuthUser.id && c.recipientId === recipientId) ||
      (c.requesterId === recipientId && c.recipientId === currentAuthUser.id)
  );

  if (existing) {
    res.status(400).json({ error: `Connection request is already ${existing.status}` });
    return;
  }

  const newConn = {
    id: `conn_${Date.now()}`,
    requesterId: currentAuthUser.id,
    recipientId: recipientId,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.connections.push(newConn);

  // Send push notification to target recipient
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: recipientId,
    type: 'connection_request',
    actorId: currentAuthUser.id,
    actorName: currentAuthUser.displayName,
    actorAvatar: currentAuthUser.avatar,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.status(201).json({ message: 'Connection request pending review', connection: newConn });
});

app.post('/api/connections/accept/:connectionId', authenticateToken, (req, res) => {
  const currentAuthUser = (req as any).user;
  const connId = req.params.connectionId;

  const db = readDB();
  const connIdx = db.connections.findIndex((c: any) => c.id === connId);

  if (connIdx === -1) {
    res.status(404).json({ error: 'Connection record not found' });
    return;
  }

  const conn = db.connections[connIdx];
  if (conn.recipientId !== currentAuthUser.id) {
    res.status(403).json({ error: 'You are unauthorized to accept this request' });
    return;
  }

  conn.status = 'accepted';
  conn.updatedAt = new Date().toISOString();

  // Add mutual association IDs to User rows
  const user1 = db.users.find((u: any) => u.id === conn.requesterId);
  const user2 = db.users.find((u: any) => u.id === conn.recipientId);

  if (user1 && !user1.connections.includes(user2.id)) user1.connections.push(user2.id);
  if (user2 && !user2.connections.includes(user1.id)) user2.connections.push(user1.id);

  // Alert Requester of Acceptance
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: conn.requesterId,
    type: 'connection_accepted',
    actorId: currentAuthUser.id,
    actorName: currentAuthUser.displayName,
    actorAvatar: currentAuthUser.avatar,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json({ message: 'Network connection finalized! Secure Messaging unlocked.', connection: conn });
});

app.post('/api/connections/decline/:connectionId', authenticateToken, (req, res) => {
  const currentAuthUser = (req as any).user;
  const connId = req.params.connectionId;

  const db = readDB();
  const connIdx = db.connections.findIndex((c: any) => c.id === connId);

  if (connIdx === -1) {
    res.status(404).json({ error: 'Connection not found' });
    return;
  }

  const conn = db.connections[connIdx];
  if (conn.recipientId !== currentAuthUser.id) {
    res.status(403).json({ error: 'Unauthorized operation' });
    return;
  }

  conn.status = 'declined';
  conn.updatedAt = new Date().toISOString();

  writeDB(db);
  res.json({ message: 'Connection proposal declined', connection: conn });
});

app.get('/api/connections/requests', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  // Load received requests
  const pendingRequests = db.connections
    .filter((c: any) => c.recipientId === currentUser.id && c.status === 'pending')
    .map((c: any) => {
      const requester = db.users.find((u: any) => u.id === c.requesterId);
      return {
        id: c.id,
        requester: {
          id: requester?.id,
          displayName: requester?.displayName,
          username: requester?.username,
          avatar: requester?.avatar,
          category: requester?.category,
          bio: requester?.bio
        },
        createdAt: c.createdAt
      };
    });

  res.json({ requests: pendingRequests });
});

app.get('/api/connections/suggestions', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  // Suggestions = profiles who are not connected & not yourself, prioritizing same category
  const suggested = db.users
    .filter((u: any) => u.id !== currentUser.id && !currentUser.connections.includes(u.id))
    .filter((u: any) => {
      // Not already in a pending connection request
      const pending = db.connections.find(
        (c: any) =>
          ((c.requesterId === currentUser.id && c.recipientId === u.id) ||
            (c.requesterId === u.id && c.recipientId === currentUser.id)) &&
          c.status === 'pending'
      );
      return !pending;
    })
    .map((u: any) => {
      return {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatar: u.avatar,
        bio: u.bio,
        location: u.location,
        category: u.category,
        skills: u.skills,
        sharedConnectionsCount: Math.floor(Math.random() * 3) // Mock visual metric
      };
    })
    .slice(0, 10);

  res.json({ suggestions: suggested });
});

app.get('/api/connections/all', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  const friends = db.users
    .filter((u: any) => currentUser.connections.includes(u.id))
    .map((u: any) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatar: u.avatar,
      bio: u.bio,
      category: u.category,
      location: u.location
    }));

  res.json({ connections: friends });
});


// --- REAL-TIME RECONCILED CHAT ENDPOINTS ---

app.get('/api/chat/conversations', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  const userConvs = db.conversations
    .filter((c: any) => c.participantIds.includes(currentUser.id))
    .map((c: any) => {
      // Resolve other participant details
      const otherId = c.participantIds.find((id: string) => id !== currentUser.id) || currentUser.id;
      const otherUser = db.users.find((u: any) => u.id === otherId);

      // Compute count of unread messages sent by OTHER participant
      const unreadCount = db.messages.filter(
        (m: any) => m.conversationId === c.id && m.senderId === otherId && !m.read
      ).length;

      // Check for associated project details if hire links
      let hireProjectName = undefined;
      let milestonePercentage = undefined;
      if (c.hireRequestId) {
        const hire = db.hireRequests.find((h: any) => h.id === c.hireRequestId);
        if (hire) {
          hireProjectName = hire.projectType;
          const completed = hire.milestones.filter((m: any) => m.done).length;
          milestonePercentage = hire.milestones.length > 0 ? Math.round((completed / hire.milestones.length) * 100) : 0;
        }
      }

      return {
        id: c.id,
        otherUser: {
          id: otherUser?.id,
          displayName: otherUser?.displayName,
          avatar: otherUser?.avatar,
          username: otherUser?.username,
          category: otherUser?.category
        },
        unreadCount,
        lastMessage: c.lastMessage || 'Conversations started!',
        lastMessageAt: c.lastMessageAt || c.createdAt,
        hireRequestId: c.hireRequestId,
        hireProjectName,
        milestonePercentage
      };
    });

  // Sort conversations chronologically by active touch
  userConvs.sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  res.json({ conversations: userConvs });
});

app.get('/api/chat/messages/:conversationId', authenticateToken, (req, res) => {
  const convId = req.params.conversationId;
  const currentUser = (req as any).user;
  const db = readDB();

  const conv = db.conversations.find((c: any) => c.id === convId);
  if (!conv || !conv.participantIds.includes(currentUser.id)) {
    res.status(403).json({ error: 'Access to conversation forbidden' });
    return;
  }

  // Load and mark as read
  const messages = db.messages.filter((m: any) => m.conversationId === convId);
  messages.forEach((m: any) => {
    if (m.senderId !== currentUser.id) {
      m.read = true;
    }
  });

  writeDB(db);

  // Load project hire milestones details if linked
  let linkedProject = null;
  if (conv.hireRequestId) {
    linkedProject = db.hireRequests.find((h: any) => h.id === conv.hireRequestId);
  }

  res.json({ messages, project: linkedProject });
});

app.post('/api/chat/messages', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { conversationId, recipientId, content, fileUrl, fileType } = req.body;

  const db = readDB();

  let activeConvId = conversationId;

  // Let's create visual context if no conv active yet
  if (!activeConvId && recipientId) {
    const existing = db.conversations.find(
      (c: any) => c.participantIds.includes(currentUser.id) && c.participantIds.includes(recipientId)
    );

    if (existing) {
      activeConvId = existing.id;
    } else {
      activeConvId = `conv_${Date.now()}`;
      db.conversations.push({
        id: activeConvId,
        participantIds: [currentUser.id, recipientId],
        createdAt: new Date().toISOString()
      });
    }
  }

  const convIdx = db.conversations.findIndex((c: any) => c.id === activeConvId);
  if (convIdx === -1) {
    res.status(404).json({ error: 'Target convo does not exist.' });
    return;
  }

  const newMessage = {
    id: `msg_${Date.now()}`,
    conversationId: activeConvId,
    senderId: currentUser.id,
    content: content || '',
    fileUrl,
    fileType,
    read: false,
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMessage);

  // Update touch records
  const conversation = db.conversations[convIdx];
  conversation.lastMessage = content || (fileUrl ? 'Shared an attachment' : '');
  conversation.lastMessageAt = new Date().toISOString();
  conversation.lastMessageSenderId = currentUser.id;

  // Notify recipient immediately in notifications catalog
  const otherParticipantId = conversation.participantIds.find((id: string) => id !== currentUser.id);
  if (otherParticipantId) {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      recipientId: otherParticipantId,
      type: 'message',
      actorId: currentUser.id,
      actorName: currentUser.displayName,
      actorAvatar: currentUser.avatar,
      messageContent: content || 'Shared an file visual attachment',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);
  res.status(201).json({ message: 'Outbox message dispatched', messageDetails: newMessage });
});


// --- SECURE PROJECT HIRE WORKFLOW ---

app.post('/api/hire/request', authenticateToken, (req, res) => {
  const currentAuthUser = (req as any).user;
  const { creativeId, projectType, description, budget, milestones } = req.body;

  if (!creativeId || !projectType || !description || !budget) {
    res.status(400).json({ error: 'Creative, Project Type, Description and Budget are required to bid' });
    return;
  }

  const db = readDB();
  const creative = db.users.find((u: any) => u.id === creativeId);

  if (!creative) {
    res.status(404).json({ error: 'Creative professional target profile not found' });
    return;
  }

  const hireId = `hire_${Date.now()}`;
  const preppedMilestones = milestones && milestones.length > 0
    ? milestones.map((m: any, idx: number) => ({ id: `m_${Date.now()}_${idx}`, title: m, done: false }))
    : [
        { id: `m_1_${Date.now()}`, title: 'First Draft Submission', done: false },
        { id: `m_2_${Date.now()}`, title: 'Final Review & Assets Delivery', done: false }
      ];

  const newRequest = {
    id: hireId,
    clientId: currentAuthUser.id,
    creativeId: creativeId,
    projectType,
    description,
    budget,
    status: 'pending' as const,
    milestones: preppedMilestones,
    createdAt: new Date().toISOString()
  };

  db.hireRequests.push(newRequest);

  // Send creative incoming alert
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: creativeId,
    type: 'hire_request',
    actorId: currentAuthUser.id,
    actorName: currentAuthUser.displayName,
    actorAvatar: currentAuthUser.avatar,
    hireRequestId: hireId,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.status(201).json({ message: 'Hire budget request dispatched!', hireRequest: newRequest });
});

app.get('/api/hire/incoming', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  const hires = db.hireRequests
    .filter((h: any) => h.creativeId === currentUser.id)
    .map((h: any) => {
      const client = db.users.find((u: any) => u.id === h.clientId);
      return {
        ...h,
        client: {
          id: client?.id,
          displayName: client?.displayName,
          avatar: client?.avatar,
          username: client?.username,
          category: client?.category,
          location: client?.location
        }
      };
    });

  res.json({ requests: hires });
});

app.get('/api/hire/outgoing', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  const hires = db.hireRequests
    .filter((h: any) => h.clientId === currentUser.id)
    .map((h: any) => {
      const creative = db.users.find((u: any) => u.id === h.creativeId);
      return {
        ...h,
        creative: {
          id: creative?.id,
          displayName: creative?.displayName,
          avatar: creative?.avatar,
          username: creative?.username,
          category: creative?.category,
          location: creative?.location
        }
      };
    });

  res.json({ requests: hires });
});

app.post('/api/hire/accept/:id', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const hireId = req.params.id;

  const db = readDB();
  const hireIdx = db.hireRequests.findIndex((h: any) => h.id === hireId);

  if (hireIdx === -1) {
    res.status(404).json({ error: 'Proposal project details not found' });
    return;
  }

  const hire = db.hireRequests[hireIdx];
  if (hire.creativeId !== currentUser.id) {
    res.status(403).json({ error: 'Unauthorized operation' });
    return;
  }

  hire.status = 'accepted';

  // Automatically spin-up a secure mutual Conversation linked to this Project context!
  const hasConv = db.conversations.find(
    (c: any) => c.participantIds.includes(currentUser.id) && c.participantIds.includes(hire.clientId)
  );

  let convoHeader;
  if (hasConv) {
    hasConv.hireRequestId = hire.id; // Attach project link
    hasConv.lastMessage = `Project Accepted! Budget agreement: ${hire.budget}`;
    hasConv.lastMessageAt = new Date().toISOString();
    convoHeader = hasConv;
  } else {
    convoHeader = {
      id: `conv_${Date.now()}`,
      participantIds: [currentUser.id, hire.clientId],
      lastMessage: `Project Accepted! Budget agreement: ${hire.budget}`,
      lastMessageAt: new Date().toISOString(),
      hireRequestId: hire.id,
      createdAt: new Date().toISOString()
    };
    db.conversations.push(convoHeader);
  }

  // Prepend project trigger message
  db.messages.push({
    id: `msg_system_${Date.now()}`,
    conversationId: convoHeader.id,
    senderId: currentUser.id,
    content: `💼 Project Proposal accepted! Status updated to ACTIVE. Type: ${hire.projectType}, Budget: ${hire.budget}. Let's collaborate.`,
    read: false,
    createdAt: new Date().toISOString()
  });

  // Alert recruiter client of milestones starting
  db.notifications.unshift({
    id: `notif_${Date.now()}`,
    recipientId: hire.clientId,
    type: 'hire_accepted',
    actorId: currentUser.id,
    actorName: currentUser.displayName,
    actorAvatar: currentUser.avatar,
    hireRequestId: hire.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json({ message: 'Project finalized & Shared Milestones chat generated!', conversationId: convoHeader.id });
});

app.post('/api/hire/decline/:id', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const hireId = req.params.id;

  const db = readDB();
  const hireIdx = db.hireRequests.findIndex((h: any) => h.id === hireId);

  if (hireIdx === -1) {
    res.status(404).json({ error: 'Proposal record not found' });
    return;
  }

  const hire = db.hireRequests[hireIdx];
  if (hire.creativeId !== currentUser.id) {
    res.status(403).json({ error: 'Access forbidden' });
    return;
  }

  hire.status = 'declined';
  writeDB(db);

  res.json({ message: 'Hiring proposal declined', hireRequest: hire });
});

app.patch('/api/hire/milestone/:id', authenticateToken, (req, res) => {
  const hireId = req.params.id;
  const { milestoneId, done } = req.body;

  const db = readDB();
  const hireIdx = db.hireRequests.findIndex((h: any) => h.id === hireId);

  if (hireIdx === -1) {
    res.status(444).json({ error: 'Hire project agreement not found' });
    return;
  }

  const hire = db.hireRequests[hireIdx];
  const mIdx = hire.milestones.findIndex((m: any) => m.id === milestoneId);

  if (mIdx === -1) {
    res.status(404).json({ error: 'Milestone item do not exist' });
    return;
  }

  hire.milestones[mIdx].done = done;

  // Let's verify if all milestones are complete - auto-close status to completed if true!
  const allClear = hire.milestones.every((m: any) => m.done);
  if (allClear) {
    hire.status = 'completed';
  } else {
    hire.status = 'accepted';
  }

  writeDB(db);
  res.json({ message: 'Milestone status toggled', hireRequest: hire });
});


// --- REAL-TIME COALESCED NOTIFICATIONS SYSTEM ---

app.get('/api/notifications', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  const userNotifs = db.notifications.filter((n: any) => n.recipientId === currentUser.id);

  res.json({ notifications: userNotifs });
});

app.post('/api/notifications/read-all', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const db = readDB();

  db.notifications.forEach((n: any) => {
    if (n.recipientId === currentUser.id) {
      n.read = true;
    }
  });

  writeDB(db);
  res.json({ message: 'All notifications cleared read' });
});


// --- AI INTERACTIVE SERVICES (Gemini API Integration) ---

app.post('/api/gemini/curate', authenticateToken, async (req, res) => {
  const currentUser = (req as any).user;
  const { prompt } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    res.status(400).json({ error: 'GEMINI_API_KEY is not configured in Secrets' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt || `Act as Creativa AI agent. Welcome designer relative to their Category: ${currentUser.category}. Give them a 2-sentence inspirational advice about portfolio review and connecting with illustrative professionals. Keep it compact, deep and professional.`,
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    console.error('Gemini call failed', error);
    res.status(500).json({ error: error.message || 'Error occurred while contacting Gemini API' });
  }
});

// --- IDEA & INNOVATION ENDPOINTS ---

app.get('/api/ideas', authenticateToken, (req, res) => {
  const db = readDB();
  const sortedIdeas = (db.ideas || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ ideas: sortedIdeas });
});

app.post('/api/ideas', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const { title, description, tags } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

  const db = readDB();
  if (!db.ideas) db.ideas = [];

  const newIdea = {
    id: `idea_${Date.now()}`,
    authorId: currentUser.id,
    authorName: currentUser.displayName,
    authorUsername: currentUser.username,
    authorAvatar: currentUser.avatar,
    title,
    description,
    tags: tags || [],
    upvotes: [],
    downvotes: [],
    comments: 0,
    createdAt: new Date().toISOString()
  };

  db.ideas.push(newIdea);
  writeDB(db);
  res.status(201).json({ idea: newIdea });
});

app.post('/api/ideas/:id/upvote', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const ideaId = req.params.id;
  
  const db = readDB();
  const idea = (db.ideas || []).find((i: any) => i.id === ideaId);
  if (!idea) return res.status(404).json({ error: 'Idea not found' });

  idea.downvotes = idea.downvotes.filter((id: string) => id !== currentUser.id);
  if (idea.upvotes.includes(currentUser.id)) {
    idea.upvotes = idea.upvotes.filter((id: string) => id !== currentUser.id);
  } else {
    idea.upvotes.push(currentUser.id);
  }
  
  writeDB(db);
  res.json({ idea });
});

app.post('/api/ideas/:id/downvote', authenticateToken, (req, res) => {
  const currentUser = (req as any).user;
  const ideaId = req.params.id;
  
  const db = readDB();
  const idea = (db.ideas || []).find((i: any) => i.id === ideaId);
  if (!idea) return res.status(404).json({ error: 'Idea not found' });

  idea.upvotes = idea.upvotes.filter((id: string) => id !== currentUser.id);
  if (idea.downvotes.includes(currentUser.id)) {
    idea.downvotes = idea.downvotes.filter((id: string) => id !== currentUser.id);
  } else {
    idea.downvotes.push(currentUser.id);
  }
  
  writeDB(db);
  res.json({ idea });
});

// Global Express Error Boundary Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global API Error caught:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Setup development Vite server middle tier routing
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in build environment
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Creativa backend service active on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failure initializing service', err);
});
