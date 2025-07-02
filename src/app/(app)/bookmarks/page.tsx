
export default function BookmarksPage() {
  return (
      <div className="flex h-full min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
              <h1 className="text-xl font-bold">Bookmarks</h1>
          </header>
          <main className="flex-1 p-4">
              <div className="p-8 text-center text-muted-foreground">
                  <h2 className="text-xl font-bold">No bookmarks yet</h2>
                  <p>When you bookmark posts, they'll appear here.</p>
              </div>
          </main>
      </div>
  );
}
