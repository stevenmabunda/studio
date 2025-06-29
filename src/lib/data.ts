
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
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    hint?: string;
  }>;
  poll?: {
    choices: { text: string; votes: number }[];
  };
};

export type StoryType = {
  id: string;
  username: string;
  avatar: string;
  hint?: string;
};

export const stories: StoryType[] = [
  {
    id: 'story-1',
    username: 'marlene___',
    avatar: 'https://placehold.co/64x64.png',
    hint: 'woman model',
  },
  {
    id: 'story-2',
    username: 'espnpr',
    avatar: 'https://placehold.co/64x64.png',
    hint: 'espn logo',
  },
  {
    id: 'story-3',
    username: 'bokrugby',
    avatar: 'https://placehold.co/64x64.png',
    hint: 'rugby logo',
  },
  {
    id: 'story-4',
    username: 'fcbarcelo...',
    avatar: 'https://placehold.co/64x64.png',
    hint: 'fc barcelona logo',
  },
  {
    id: 'story-5',
    username: 'vino_snap',
    avatar: 'https://placehold.co/64x64.png',
    hint: 'woman smiling',
  },
  {
    id: 'story-6',
    username: 'realmadrid',
    avatar: 'https://placehold.co/64x64.png',
    hint: 'real madrid logo',
  },
];
