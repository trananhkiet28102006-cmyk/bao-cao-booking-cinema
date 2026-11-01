'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);

    if (pageRef.current) {
      // Pure crisp crossfade with minimal 4px elevation: NO scaling so images & text remain 100% sharp!
      gsap.fromTo(
        pageRef.current,
        { opacity: 0.2, y: 4 },
        {
          opacity: 1,
          y: 0,
          duration: 0.22,
          ease: 'power2.out',
          clearProps: 'all',
        }
      );
    }

    if (progressBarRef.current) {
      gsap.fromTo(
        progressBarRef.current,
        { width: '0%', opacity: 1 },
        {
          width: '100%',
          opacity: 0,
          duration: 0.35,
          ease: 'power2.inOut',
          onComplete: () => setNavigating(false),
        }
      );
    } else {
      const timer = setTimeout(() => setNavigating(false), 350);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div ref={pageRef} key={pathname} className="w-full min-h-screen">
      {navigating && (
        <div
          ref={progressBarRef}
          className="fixed top-0 left-0 h-[2.5px] w-full bg-gradient-to-r from-[#693BFF] via-[#EC4899] to-[#FFB52E] z-[999999] pointer-events-none"
        />
      )}
      {children}
    </div>
  );
}
