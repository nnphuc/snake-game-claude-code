'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled to avoid hydration issues
// (since we're using browser APIs like window and document)
const Game = dynamic(() => import('./components/Game'), { ssr: false });

export default function Home() {
  return (
    <main>
      <Game />
    </main>
  );
}