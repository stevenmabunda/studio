
'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarBadgeProps {
  count: number;
}

export function SidebarBadge({ count }: SidebarBadgeProps) {
  const displayCount = count > 99 ? '99+' : count;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute left-8 top-2 h-5 min-w-[20px] rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground flex items-center justify-center',
            'group-data-[collapsible=icon]:left-auto group-data-[collapsible=icon]:right-1 group-data-[collapsible=icon]:top-1.5'
          )}
        >
          {displayCount}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
