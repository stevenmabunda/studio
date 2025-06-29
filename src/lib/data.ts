
export type PostType = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  comments: number;
  reposts: number;
  likes: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  mediaHint?: string;
};

export const initialPosts: PostType[] = [
  {
    id: 'post-1',
    authorName: 'The Athletic',
    authorHandle: 'TheAthletic',
    authorAvatar: 'https://placehold.co/40x40.png',
    content:
      'BREAKING: Kylian Mbappé to Real Madrid is a done deal. ¡Bienvenido a Madrid! ⚪️ #RealMadrid #Mbappe',
    timestamp: '2h',
    comments: 1200,
    reposts: 5400,
    likes: 22000,
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    mediaHint: 'football player signing',
  },
  {
    id: 'post-2',
    authorName: 'Fabrizio Romano',
    authorHandle: 'FabrizioRomano',
    authorAvatar: 'https://placehold.co/40x40.png',
    content:
      'Cole Palmer was absolutely sensational today. What a signing for Chelsea. Here we go! 🔵 #CFC #Chelsea',
    timestamp: '4h',
    comments: 876,
    reposts: 2300,
    likes: 15000,
  },
  {
    id: 'post-3',
    authorName: 'Jane Doe',
    authorHandle: 'janedoe_footy',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: 'Check out this amazing goal! What a strike! #goal #football',
    timestamp: '5h',
    comments: 302,
    reposts: 45,
    likes: 530,
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mediaType: 'video',
  },
  {
    id: 'post-4',
    authorName: 'Football Fans',
    authorHandle: 'FootyHumor',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: 'Who is the most underrated player in the Premier League right now? 🤔',
    timestamp: '8h',
    comments: 1500,
    reposts: 200,
    likes: 1800,
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    mediaHint: 'premier league trophy',
  },
];

export const users = {
    'yourhandle': {
      name: 'Your Name',
      handle: 'yourhandle',
      avatar: 'https://placehold.co/40x40.png'
    }
  }
