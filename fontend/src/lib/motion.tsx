'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Hiệu ứng pháo hoa điện ảnh cao cấp (Celebration Confetti - Native Canvas Zero Dependency)
 * Hoạt động mượt mà 60fps trên mọi trình duyệt mà không cần thư viện ngoài.
 */
interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

export function triggerCinemaConfetti() {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#693BFF', '#A875FF', '#FFB52E', '#EC4899', '#38BDF8', '#10B981', '#F59E0B', '#EF4444'];
  const particles: ConfettiParticle[] = [];

  function spawnBurst(originX: number, originY: number, count: number, angleRange: [number, number], speedRange: [number, number]) {
    for (let i = 0; i < count; i++) {
      const angle = (angleRange[0] + Math.random() * (angleRange[1] - angleRange[0])) * (Math.PI / 180);
      const speed = speedRange[0] + Math.random() * (speedRange[1] - speedRange[0]);
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
      });
    }
  }

  // Burst 1: Trung tâm bắn lên cao xòe rộng
  spawnBurst(width * 0.5, height * 0.7, 85, [230, 310], [9, 21]);

  // Burst 2 & 3: Bắn từ hai cánh trái/phải sau 180ms
  setTimeout(() => {
    spawnBurst(width * 0.1, height * 0.75, 45, [280, 350], [10, 20]);
    spawnBurst(width * 0.9, height * 0.75, 45, [190, 260], [10, 20]);
  }, 180);

  let animationFrameId: number;
  const gravity = 0.38;
  const friction = 0.985;
  const startTime = Date.now();
  const maxDuration = 3200; // 3.2s animation

  function render() {
    if (!ctx) return;
    const elapsed = Date.now() - startTime;
    if (elapsed > maxDuration || particles.length === 0) {
      cancelAnimationFrame(animationFrameId);
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.vx *= friction;
      p.vy *= friction;
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      // Giảm dần opacity ở nửa sau thời gian
      if (elapsed > 1600) {
        p.opacity = Math.max(0, 1 - (elapsed - 1600) / 1600);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(Math.cos(p.wobble), 1);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      // Vẽ hình chữ nhật ribbon điện ảnh
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();

      // Loại bỏ hạt rơi khỏi màn hình
      if (p.y > height + 20) {
        particles.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

/**
 * Hiệu ứng nghiêng 3D điện ảnh (3D Card Tilt with Specular Glare)
 * Rê chuột đến đâu, thẻ nghiêng nhẹ 3D và phản chiếu vệt sáng cinema theo tọa độ chuột
 */
let tiltRaf: number | null = null;
export function handleCard3DTilt(e: React.MouseEvent<HTMLElement>) {
  const card = e.currentTarget;
  if (!card) return;
  const clientX = e.clientX;
  const clientY = e.clientY;

  if (tiltRaf) cancelAnimationFrame(tiltRaf);
  tiltRaf = requestAnimationFrame(() => {
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -4.5;
    const rotateY = ((x - centerX) / centerX) * 4.5;

    card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-4px)`;
  });
}

export function handleCard3DReset(e: React.MouseEvent<HTMLElement>) {
  if (tiltRaf) cancelAnimationFrame(tiltRaf);
  const card = e.currentTarget;
  if (card) {
    card.style.transform = '';
  }
}

/**
 * Component số nhảy mượt mà (Dynamic Rolling Numeric Counter)
 * Dùng cho KPI, Doanh thu, Điểm thưởng, Số vé với GSAP power2.out interpolation
 */
export function AnimatedNumber({
  value,
  formatter,
  className = '',
}: {
  value: number;
  formatter?: (n: number) => string;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValRef = useRef(0);

  useEffect(() => {
    const obj = { current: prevValRef.current };
    const tween = gsap.to(obj, {
      current: value,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current) {
          const rounded = Math.round(obj.current);
          spanRef.current.textContent = formatter
            ? formatter(rounded)
            : rounded.toLocaleString('vi-VN');
        }
      },
    });

    prevValRef.current = value;
    return () => {
      tween.kill();
    };
  }, [value, formatter]);

  return (
    <span ref={spanRef} className={className}>
      {formatter ? formatter(value) : value.toLocaleString('vi-VN')}
    </span>
  );
}

/**
 * Hook quan sát cuộn màn hình (Scroll-triggered Viewport Observer)
 * Kéo màn hình xuống tới đâu thì phần tử mới bắt đầu kích hoạt animation
 */
export function useInView(options?: {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options?.triggerOnce !== false) {
            observer.unobserve(el);
          }
        } else if (options?.triggerOnce === false) {
          setInView(false);
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.triggerOnce]);

  return [ref, inView] as const;
}

/**
 * Component cuộn tới đâu hiện thông tin tới đó (Scroll-driven Reveal Wrapper)
 */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, isVisible] = useInView({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Component Lướt tới đâu Tải thông tin tới đấy (Lazy Section on Scroll)
 * Hiển thị khung xương Skeleton Shimmer khi cuộn tới và tải thông tin mượt mà.
 */
export function LazySection({
  children,
  skeleton,
  minHeight = '280px',
  loadDelay = 0,
  threshold = 0.05,
  className = '',
  onLoad,
}: {
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  minHeight?: string;
  loadDelay?: number;
  threshold?: number;
  className?: string;
  onLoad?: () => void;
}) {
  const [ref, inView] = useInView({ threshold, rootMargin: '250px 0px 250px 0px', triggerOnce: true });
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (inView && !hasLoaded) {
      if (loadDelay > 0) {
        const timer = setTimeout(() => {
          setHasLoaded(true);
          if (onLoad) onLoad();
        }, loadDelay);
        return () => clearTimeout(timer);
      } else {
        setHasLoaded(true);
        if (onLoad) onLoad();
      }
    }
  }, [inView, hasLoaded, loadDelay, onLoad]);

  return (
    <div ref={ref} className={className} style={{ minHeight: !hasLoaded ? minHeight : undefined }}>
      {!hasLoaded ? (
        skeleton || (
          <div className="w-full p-8 rounded-2xl bg-[#061020]/90 border border-[#172A48] cinema-skeleton flex flex-col items-center justify-center space-y-3 shadow-lg">
            <div className="w-8 h-8 rounded-full border-2 border-[#693BFF] border-t-transparent animate-spin" />
            <div className="text-xs font-extrabold text-[#AAB8D0] animate-pulse">
              Đang tải dữ liệu theo vị trí cuộn...
            </div>
          </div>
        )
      ) : (
        <div className="animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * GSAP TIMELINE CHOREOGRAPHY (Chuẩn theo mẫu playTimeline)
 * Phối hợp 3 lớp chuyển động:
 * 1. Khung tổng thể trượt lên (y: 24 -> 0, opacity: 0 -> 1)
 * 2. Các thanh tiến trình / mốc quét ngang lần lượt (scaleX: 0 -> 1, origin: 0% 50%, stagger)
 * 3. Điểm mốc / vạch chỉ thị thả dọc từ trên xuống (scaleY: 0 -> 1, origin: 50% 0%)
 */
export function playTimelineChoreography(
  container: HTMLElement | null,
  options?: {
    barSelector?: string;
    todaySelector?: string;
    delay?: number;
  }
) {
  if (!container || typeof window === 'undefined') return;
  const delay = options?.delay ?? 0;
  const barSelector = options?.barSelector ?? '.dtl__bar';
  const todaySelector = options?.todaySelector ?? '.dtl__today';

  // Hủy các tween cũ dở dang để tránh tranh chấp CPU
  gsap.killTweensOf(container);

  // 1. Khung tổng thể lướt nhẹ và hiện rõ tức thì (GPU composite: y & opacity)
  gsap.fromTo(
    container,
    { y: 14, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.32,
      ease: 'power2.out',
      delay,
      clearProps: 'transform',
    }
  );

  // 2. Các phần tử con:
  // Tối ưu thông minh: Với thẻ <tr> (hàng bảng dữ liệu), dùng transform Y & Opacity để KHÔNG làm vỡ Table Layout và tránh Reflow gây giật lag.
  // Với các thẻ block/flex (button, bar, combo), áp dụng scaleX chuẩn xác từ trái qua phải.
  const bars = Array.from(container.querySelectorAll<HTMLElement>(barSelector));
  if (bars.length > 0) {
    gsap.killTweensOf(bars);
    const tableRows = bars.filter((el) => el.tagName === 'TR');
    const normalBars = bars.filter((el) => el.tagName !== 'TR');

    if (tableRows.length > 0) {
      gsap.fromTo(
        tableRows,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          stagger: 0.02,
          delay: delay + 0.05,
          clearProps: 'transform,opacity',
        }
      );
    }

    if (normalBars.length > 0) {
      const isCard = (el: HTMLElement) => el.offsetWidth > 450 || el.classList.contains('theme-card');
      const cards = normalBars.filter(isCard);
      const smallBars = normalBars.filter((el) => !isCard(el));

      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            stagger: 0.03,
            delay: delay + 0.04,
            clearProps: 'all',
          }
        );
      }

      if (smallBars.length > 0) {
        gsap.fromTo(
          smallBars,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.38,
            ease: 'power3.out',
            transformOrigin: '0% 50%',
            stagger: 0.02,
            delay: delay + 0.06,
            clearProps: 'transform',
          }
        );
      }
    }
  }

  // 3. Vạch chỉ thị / Mốc ngày / Huy hiệu trạng thái bung thả từ trên xuống
  const todayElements = Array.from(container.querySelectorAll<HTMLElement>(todaySelector));
  if (todayElements.length > 0) {
    gsap.killTweensOf(todayElements);
    gsap.fromTo(
      todayElements,
      { scaleY: 0, opacity: 0 },
      {
        scaleY: 1,
        opacity: 1,
        duration: 0.38,
        ease: 'power2.out',
        transformOrigin: '50% 0%',
        delay: delay + 0.12,
        clearProps: 'transform',
      }
    );
  }
}

/**
 * Hiệu ứng GSAP mở màn sơ đồ ghế (Seat Grid Cinematic Reveal)
 * Các hàng ghế quét xuất hiện từ màn hình hắt xuống theo hiệu ứng gợn sóng
 */
export function playSeatGridReveal(seatGridContainer: HTMLElement | null) {
  if (!seatGridContainer || typeof window === 'undefined') return;
  const rows = seatGridContainer.querySelectorAll('.seat-row-item');
  if (rows.length > 0) {
    gsap.fromTo(
      rows,
      { y: 16, opacity: 0, scale: 0.96 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.05,
      }
    );
  }
}
