export default function MessagesPage() {
  return (
      <div className="flex h-full min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
              <h1 className="text-xl font-bold">Messages</h1>
          </header>
          <main className="flex-1 p-4">
              <div className="p-8 text-center text-muted-foreground">
                  <h2 className="text-xl font-bold">No messages yet</h2>
                  <p>When you have new messages, they'll appear here.</p>
              </div>
          </main>
      </div>
  );
}
