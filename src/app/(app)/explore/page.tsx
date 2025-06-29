export default function ExplorePage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Explore</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="p-8 text-center text-muted-foreground">
            <h2 className="text-xl font-bold">Nothing to see here... yet</h2>
            <p>Trending topics and posts will appear here.</p>
        </div>
      </main>
    </div>
  );
}
