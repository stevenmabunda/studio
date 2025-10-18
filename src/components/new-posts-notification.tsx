'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface NewPostsNotificationProps {
  show: boolean;
  avatars: string[];
  onClick: () => void;
}

export function NewPostsNotification({ show, avatars, onClick }: NewPostsNotificationProps) {
  const uniqueAvatars = [...new Set(avatars)].slice(0, 3);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-1/2 z-50 -translate-x-1/2"
        >
          <Button
            onClick={onClick}
            className="h-10 rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm hover:bg-primary"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            <div className="flex items-center -space-x-2 mr-2">
              {uniqueAvatars.map((src, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-primary-foreground">
                  <AvatarImage src={src} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span>New Posts</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
