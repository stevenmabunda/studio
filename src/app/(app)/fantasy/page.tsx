
'use client';

import { dummyPlayers } from "@/lib/dummy-players";

export default function FantasyPage() {
    // For now, just display the number of dummy players to confirm data is loaded.
    // We will build the full UI in the next steps.
    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Fantasy League</h1>
            </header>
            <main className="flex-1 p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Welcome to the Fantasy League!</h2>
                    <p className="text-muted-foreground">
                        Team selection and league management coming soon.
                    </p>
                    <p className="mt-4 text-sm">
                        (Loaded {dummyPlayers.length} dummy players for testing)
                    </p>
                </div>
            </main>
        </div>
    );
}

    