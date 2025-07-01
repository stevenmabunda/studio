
export type PostType = {
  id: string;
  authorId: string;
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
  userId: string;
  username: string;
  avatar: string;
  storyImageUrl: string;
};
