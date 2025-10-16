
import { redirect } from 'next/navigation';

export default function AppRootPage() {
  // The layout will handle showing the correct view
  // for logged in vs logged out users.
  redirect('/home');
}
