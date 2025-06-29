
import { redirect } from 'next/navigation';

export default function PostPage() {
  // This page is no longer used for viewing posts from the feed.
  // Posts are now viewed in a dialog. We redirect to home for any direct access attempts.
  redirect('/home');
}
