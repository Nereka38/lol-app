'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lolpedia-sound-enabled';

export function useSoundEnabled() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setSoundEnabled(stored === 'true');
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return { soundEnabled, toggleSound };
}
