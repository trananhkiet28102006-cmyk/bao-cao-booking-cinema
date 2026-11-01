---
name: gsap-animation
description: >-
  GreenSock Animation Platform (GSAP) professional motion skill for Next.js, React, and modern web applications.
  Covers high-performance timelines, staggered reveals, SVG spline draws, interactive micro-animations,
  numeric counters, and leak-free React integration using @gsap/react and useGSAP. Use whenever orchestrating
  smooth, cinema-grade animations, micro-interactions, or transitioning between complex UI states.
---

# GSAP Animation Skill (GreenSock UI & Motion Engine)

A comprehensive guide and reference for building cinema-grade, ultra-fluid animations in Next.js & React using GSAP 3+ and `@gsap/react`.

---

## 1. Core Architecture in React & Next.js

### 1.1 Safe React Lifecycle Integration
Always use `@gsap/react`'s `useGSAP` hook or `gsap.context()` inside `useEffect` or `useLayoutEffect`. This ensures:
- All selectors are scoped to the container ref (`scope: containerRef`).
- All tweens and timelines are automatically reverted/killed on unmount, preventing memory leaks, duplicate animations on re-renders, and phantom tweens.

```tsx
'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Optional: Register plugins once if needed
// gsap.registerPlugin(ScrollTrigger);

export function AnimatedCardList() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Scoped selector inside container
      gsap.fromTo(
        '.gsap-card',
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.07,
          ease: 'power3.out',
          clearProps: 'transform', // Clears inline transform for pure CSS hovers later
        }
      );
    },
    { scope: container }
  );

  return (
    <div ref={container} className="grid grid-cols-4 gap-4">
      <div className="gsap-card">Card 1</div>
      <div className="gsap-card">Card 2</div>
      <div className="gsap-card">Card 3</div>
      <div className="gsap-card">Card 4</div>
    </div>
  );
}
```

---

## 2. Easing & Velocity Standard

Never use linear or generic bounce. Use curated GSAP easing curves:

| Use Case | GSAP Easing | Feel & Behavior |
| :--- | :--- | :--- |
| **Card / List Stagger** | `power3.out` | Decelerates smoothly with strong initial burst |
| **Hero Title / Mask Rise**| `expo.out` | High-impact initial push with ultra-soft float landing |
| **Modals / Dropdowns** | `back.out(1.4)` | Subtle tactile overshoot without feeling cartoonish |
| **Button Click / Tap** | `power2.out` | Snappy, responsive 120-180ms micro-spring |
| **SVG Path Line Draw** | `power2.inOut` or `expo.out` | Natural pen/spline drawing sensation |

---

## 3. High-Value Motion Recipes

### 3.1 Masked Title Upward Reveal
Wrap text in an `overflow: hidden` parent and translate the inner span from `yPercent: 110` to `yPercent: 0`:
```ts
gsap.fromTo(
  titleRef.current,
  { yPercent: 110, opacity: 0 },
  { yPercent: 0, opacity: 1, duration: 0.75, ease: 'expo.out' }
);
```

### 3.2 Dynamic Numeric KPI Counter
Animates numeric values (e.g., revenue, ticket count) from 0 or previous value to target:
```ts
const obj = { value: 0 };
gsap.to(obj, {
  value: targetNumber,
  duration: 1.2,
  ease: 'power2.out',
  onUpdate: () => {
    counterEl.textContent = Math.round(obj.value).toLocaleString('vi-VN');
  },
});
```

### 3.3 SVG Spline / Chart Stroke Drawing
Animates Bézier curves on dashboard metrics:
```ts
const pathLength = pathEl.getTotalLength();
gsap.set(pathEl, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
gsap.to(pathEl, {
  strokeDashoffset: 0,
  duration: 1.4,
  ease: 'power3.inOut',
});
```

### 3.4 Interactive Card Magnetic & Hover Physics
```ts
card.addEventListener('mouseenter', () => {
  gsap.to(card, { y: -6, duration: 0.25, ease: 'power2.out' });
});
card.addEventListener('mouseleave', () => {
  gsap.to(card, { y: 0, duration: 0.35, ease: 'power2.out' });
});
```

---

## 4. Accessibility & Performance
- Always check `window.matchMedia('(prefers-reduced-motion: reduce)')`. If reduced motion is requested, set duration to `0.001` or skip transforms.
- Favor `transform` (`x`, `y`, `scale`, `rotation`) and `opacity` over layout-triggering properties (`width`, `height`, `top`, `left`, `margin`).
- Use `willChange: "transform, opacity"` only during active tweens, or rely on GSAP's automatic GPU acceleration.
