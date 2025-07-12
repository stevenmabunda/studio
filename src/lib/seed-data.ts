
export const seedPosts = [
  {
    authorId: 'bholo-bot',
    authorName: 'BHOLO Bot',
    authorHandle: 'bholobot',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: `Welcome to BHOLO! ⚽️ The ultimate social platform for football fans. Share your thoughts, discuss matches, and connect with fans worldwide. #BHOLO #Football`,
    comments: 1,
    reposts: 5,
    likes: 25,
    views: 1200,
    media: [
      {
        url: 'https://placehold.co/1200x675.png',
        type: 'image' as const,
        hint: 'stadium lights'
      }
    ]
  },
  {
    authorId: 'JgLca61gECdY6O4k2kYxI0aV3zI3',
    authorName: 'John Doe',
    authorHandle: 'johndoe',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: `What a goal by Messi in the Inter Miami game! He's a genius. Pure magic on the field. ✨ #Messi #InterMiamiCF`,
    comments: 15,
    reposts: 35,
    likes: 250,
    views: 15000,
  },
  {
    authorId: 'aSpLca3gECdY6O4k2kYxI0aV3zA4',
    authorName: 'Jane Smith',
    authorHandle: 'janesmith',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: `Who do you think will win the Champions League this year? My money is on Real Madrid. #UCL #ChampionsLeague`,
    comments: 120,
    reposts: 80,
    likes: 500,
    views: 45000,
    poll: {
      choices: [
        { text: 'Real Madrid', votes: 120 },
        { text: 'Manchester City', votes: 85 },
        { text: 'Bayern Munich', votes: 45 },
      ]
    }
  },
  {
    authorId: 'bVcLca3gECdY6O4k2kYxI0aV3zB5',
    authorName: 'Cristiano Ronaldo',
    authorHandle: 'cr7',
    authorAvatar: 'https://placehold.co/40x40.png',
    content: `Training hard for the next match. The dedication never stops. 💪 #AlNassr #Football`,
    comments: 500,
    reposts: 2000,
    likes: 15000,
    views: 1200000,
    media: [
      {
        url: 'https://placehold.co/800x1000.png',
        type: 'image' as const,
        hint: 'football player training'
      },
      {
        url: 'https://placehold.co/800x1000.png',
        type: 'image' as const,
        hint: 'football player gym'
      }
    ]
  },
];
