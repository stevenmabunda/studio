
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // The layout will handle showing the correct view
  // for logged in vs logged out users.
  // We can default to showing the explore page for everyone.
  redirect('/explore');
}
