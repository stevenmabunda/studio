
import { getPost } from './actions';
import type { Metadata, ResolvingMetadata } from 'next';
import { PostPageView } from '@/components/post-page-view';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const post = await getPost(id);

  if (!post) {
    return {
      title: 'Post not found | BHOLO',
    };
  }

  const description = post.content.substring(0, 155);
  const previousImages = (await parent).openGraph?.images || [];
  const postImage = post.media?.find(m => m.type === 'image')?.url;

  return {
    title: `Post by @${post.authorHandle} | BHOLO`,
    description: description,
    openGraph: {
      title: `${post.authorName} (@${post.authorHandle}) on BHOLO`,
      description: description,
      url: `/post/${id}`,
      images: postImage ? [postImage, ...previousImages] : previousImages,
    },
     twitter: {
      card: postImage ? 'summary_large_image' : 'summary',
      title: `${post.authorName} (@${post.authorHandle}) on BHOLO`,
      description: description,
      images: postImage ? [postImage] : [],
    },
  };
}


export default function PostPage({ params }: Props) {
  return <PostPageView postId={params.id} />;
}
