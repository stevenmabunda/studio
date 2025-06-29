import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, UserPlus, Heart } from "lucide-react";

const notifications = [
    {
        type: 'follow',
        icon: <UserPlus className="h-6 w-6 text-primary" />,
        content: <p><span className="font-bold">Leo Messi</span> followed you.</p>,
        userImage: 'https://placehold.co/48x48.png'
    },
    {
        type: 'like',
        icon: <Heart className="h-6 w-6 text-red-500" />,
        content: <p><span className="font-bold">Cristiano Ronaldo</span> and <span className="font-bold">2 others</span> liked your post: "What a goal!"</p>,
        userImage: 'https://placehold.co/48x48.png'
    },
    {
        type: 'follow',
        icon: <UserPlus className="h-6 w-6 text-primary" />,
        content: <p><span className="font-bold">Neymar Jr</span> followed you.</p>,
        userImage: 'https://placehold.co/48x48.png'
    }
];

export default function NotificationsPage() {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>
      <main className="flex-1">
        <ul>
            {notifications.map((notification, index) => (
                <li key={index} className="flex items-start gap-4 border-b p-4 hover:bg-accent">
                    <div className="w-8 pt-1">
                        {notification.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.userImage} data-ai-hint="user avatar" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>{notification.content}</div>
                    </div>
                </li>
            ))}
        </ul>
      </main>
    </div>
  );
}
