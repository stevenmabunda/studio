
import { redirect } from 'next/navigation';

export default function RootPage() {
    // The logic in (app)/layout will handle redirection
    // to /login if not authenticated. If authenticated,
    // this will redirect to the main home feed.
    redirect('/home');
}
