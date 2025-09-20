
import { FixturesWidget } from "@/components/fixtures-widget";

export default function LivePage() {
    return (
        <div className="flex h-full min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
                <h1 className="text-xl font-bold">Today's Fixtures</h1>
            </header>
            <main className="flex-1">
                <FixturesWidget isPage={true} />
            </main>
        </div>
    );
}
