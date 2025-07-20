
'use client';

import { createContext, useState, type ReactNode, useContext, useRef, useCallback } from 'react';

type ScrollContextType = {
  setScrollPosition: (path: string, position: number) => void;
  getScrollPosition: (path: string) => number | undefined;
};

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const scrollPositions = useRef<Map<string, number>>(new Map());

  const setScrollPosition = useCallback((path: string, position: number) => {
    scrollPositions.current.set(path, position);
  }, []);

  const getScrollPosition = useCallback((path: string) => {
    const position = scrollPositions.current.get(path);
    // Clear the position after retrieving it so it's only used once
    if (position !== undefined) {
      scrollPositions.current.delete(path);
    }
    return position;
  }, []);

  const value = { setScrollPosition, getScrollPosition };

  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
}
