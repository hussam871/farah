'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ============================================================================
 * 1. قسم البيانات المركزي (سهل التعديل والإضافة والحذف)
 * ملاحظة: هذه بيانات تجريبية (أمثلة) يجب استبدالها بأسماء ورسائل الصديقات
 * الحقيقية قبل نشر الموقع أو إرساله إلى ملك.
 * يمكنك إضافة أي عدد من العناصر في هذه المصفوفة دون تعديل بنية الواجهة.
 * ============================================================================
 */
export interface FriendMessage {
  friendName: string;
  message: string;
  motif: 'heart' | 'star' | 'flower' | 'sparkle';
}

const FRIENDS_MESSAGES: FriendMessage[] = [
  {
    friendName: '[اسم الصديقة الأولى]',
    message: '[اكتبي هنا رسالة الصديقة الأولى]',
    motif: 'heart',
  },
  {
    friendName: '[اسم الصديقة الثانية]',
    message: '[اكتبي هنا رسالة الصديقة الثانية]',
    motif: 'star',
  },
  {
    friendName: '[اسم الصديقة الثالثة]',
    message: '[اكتبي هنا رسالة الصديقة الثالثة]',
    motif: 'flower',
  },
  {
    friendName: '[اسم الصديقة الرابعة]',
    message: '[اكتبي هنا رسالة الصديقة الرابعة]',
    motif: 'sparkle',
  },
];

interface StarParticle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  vx: number;
  vy: number;
  color: string;
}

interface FloatingHeart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  color: string;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
}

interface TreeBranch {
  x1: number;
  y1: number;
  midX: number;
  midY: number;
  x2: number;
  y2: number;
  depth: number;
  maxDepth: number;
  startProgress: number;
  endProgress: number;
  thicknessStart: number;
  thicknessEnd: number;
  swayFactor: number;
  swayPhase: number;
}

interface HeartLeaf {
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  appearAt: number;
  bloomDuration: number;
  rotation: number;
  swayFactor: number;
  swayPhase: number;
  hasGlow: boolean;
}

interface FallingHeart {
  x: number;
  y: number;
  size: number;
  color: string;
  vy: number;
  vx: number;
  phase: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
}

interface CrownSparkle {
  x: number;
  y: number;
  radius: number;
  phase: number;
}

function MotifIcon({ type }: { type: FriendMessage['motif'] }) {
  switch (type) {
    case 'star':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.7 1.2 6.7L12 17.7l-5.9 3.2 1.2-6.7-4.9-4.7 6.7-.9L12 2.5z" />
        </svg>
      );
    case 'flower':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-6a3.5 3.5 0 0 1 3.2 4.9A3.5 3.5 0 0 1 20 11.5a3.5 3.5 0 0 1-3.1 3.5 3.5 3.5 0 0 1-1.7 5.5 3.5 3.5 0 0 1-6.4 0A3.5 3.5 0 0 1 7.1 15 3.5 3.5 0 0 1 4 11.5a3.5 3.5 0 0 1 4.8-4.6A3.5 3.5 0 0 1 12 2z" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
        </svg>
      );
    case 'heart':
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
  }
}

export default function MalakBirthdayCelebrationPage() {
  const [currentScreen, setCurrentScreen] = useState<'opening' | 'messages'>('opening');
  const [crownBlooming, setCrownBlooming] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCta, setShowCta] = useState(false);

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasCelebratedLastCard, setHasCelebratedLastCard] = useState(false);
  const [cardsInView, setCardsInView] = useState<Record<number, boolean>>({ 0: true });
  const [viewportWidth, setViewportWidth] = useState(1024);

  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const treeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const carouselViewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const screenRef = useRef<'opening' | 'messages'>('opening');
  const reducedMotionRef = useRef(false);
  const revealTimersRef = useRef<number[]>([]);

  // مراجع لمحرك الألعاب النارية لإطلاقها من التفاعلات
  const launchFireworkRef = useRef<(x: number, y: number, count?: number) => void>(() => {});
  const launchSalvoRef = useRef<(intensity?: number) => void>(() => {});
  const resetTreeRef = useRef<() => void>(() => {});

  // مراجع السحب باللمس والماوس
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    deltaX: number;
    isHorizontal: boolean | null;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    deltaX: 0,
    isHorizontal: null,
  });

  useEffect(() => {
    screenRef.current = currentScreen;
  }, [currentScreen]);

  const clearRevealTimers = useCallback(() => {
    while (revealTimersRef.current.length > 0) {
      const id = revealTimersRef.current.pop();
      if (id !== undefined) window.clearTimeout(id);
    }
  }, []);

  const triggerOpeningTextReveal = useCallback(() => {
    setCrownBlooming(true);
    setShowTitle(true);

    const t1 = window.setTimeout(
      () => setShowSubtitle(true),
      reducedMotionRef.current ? 100 : 750
    );
    const t2 = window.setTimeout(
      () => setShowCta(true),
      reducedMotionRef.current ? 200 : 1550
    );
    revealTimersRef.current.push(t1, t2);
  }, []);

  // إعداد المحركات الرسومية (الخلفية + شجرة الحب)
  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setViewportWidth(window.innerWidth);

    const ambientCanvas = ambientCanvasRef.current;
    const treeCanvas = treeCanvasRef.current;
    if (!ambientCanvas || !treeCanvas) return;

    const ambientCtx = ambientCanvas.getContext('2d');
    const treeCtx = treeCanvas.getContext('2d');
    if (!ambientCtx || !treeCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ambWidth = window.innerWidth;
    let ambHeight = window.innerHeight;

    let treeWidth = 480;
    let treeHeight = 380;

    let stars: StarParticle[] = [];
    let floatingHearts: FloatingHeart[] = [];
    const sparks: FireworkSpark[] = [];

    let branches: TreeBranch[] = [];
    let heartLeaves: HeartLeaf[] = [];
    let fallingHearts: FallingHeart[] = [];
    let crownSparkles: CrownSparkle[] = [];

    let treeStartTime = performance.now();
    const totalGrowthDuration = reducedMotionRef.current ? 900 : 5600;
    let hasTriggeredTreeComplete = false;
    let lastFallingSpawn = 0;
    let lastAutoFireworkTime = performance.now();
    let nextAutoFireworkDelay = 2400;

    const createFloatingHeart = (startFromBottom = true): FloatingHeart => {
      const isSmall = Math.random() > 0.42;
      const size = isSmall ? 6 + Math.random() * 6 : 12 + Math.random() * 10;
      const speedY = isSmall ? 0.45 + Math.random() * 0.55 : 0.22 + Math.random() * 0.35;
      const palette = ['#FF4F9A', '#FFB6D5', '#FF78B4', '#FFF5FA'];
      return {
        x: Math.random() * ambWidth,
        y: startFromBottom ? ambHeight + size + Math.random() * 60 : Math.random() * ambHeight,
        size,
        speedY: reducedMotionRef.current ? speedY * 0.25 : speedY,
        driftX: (Math.random() - 0.5) * 0.35,
        swayAmp: 0.25 + Math.random() * 0.55,
        swayFreq: 0.008 + Math.random() * 0.014,
        phase: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        alpha: 0.12 + Math.random() * 0.32,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    };

    const initAmbientParticles = () => {
      const isMob = ambWidth < 768;
      const starCount = isMob ? 38 : 72;
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * ambWidth,
          y: Math.random() * ambHeight,
          radius: 0.7 + Math.random() * 1.8,
          baseAlpha: 0.15 + Math.random() * 0.45,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.02,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          color: Math.random() > 0.35 ? '#FFB6D5' : '#FFF5FA',
        });
      }

      const heartCount = isMob ? 14 : 24;
      floatingHearts = [];
      for (let i = 0; i < heartCount; i++) {
        floatingHearts.push(createFloatingHeart(false));
      }
    };

    const launchFirework = (targetX: number, targetY: number, particleCount = 34) => {
      if (reducedMotionRef.current) return;
      const isMob = ambWidth < 768;
      const maxSparks = isMob ? 160 : 300;
      if (sparks.length > maxSparks) return;

      const palette = ['#FF4F9A', '#FFB6D5', '#FFF5FA', '#E5B8FF', '#FF75B5'];
      const actualCount = isMob ? Math.round(particleCount * 0.7) : particleCount;

      for (let i = 0; i < actualCount; i++) {
        const angle = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.25;
        const speed = 1.4 + Math.random() * 4.2;
        sparks.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.045,
          drag: 0.975,
          alpha: 0.95,
          decay: 0.012 + Math.random() * 0.014,
          size: 1.5 + Math.random() * 2.2,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    const launchSalvo = (intensity = 3) => {
      if (reducedMotionRef.current) return;
      for (let i = 0; i < intensity; i++) {
        window.setTimeout(() => {
          const x = ambWidth * (0.2 + Math.random() * 0.6);
          const y = ambHeight * (0.15 + Math.random() * 0.38);
          launchFirework(x, y, 42);
        }, i * 260);
      }
    };

    launchFireworkRef.current = launchFirework;
    launchSalvoRef.current = launchSalvo;

    const buildTreeStructure = () => {
      branches = [];
      heartLeaves = [];
      fallingHearts = [];
      crownSparkles = [];

      const rootX = treeWidth * 0.5;
      const rootY = treeHeight - 12;
      const trunkLength = Math.min(treeWidth, treeHeight) * 0.25;

      const generateBranch = (
        x1: number,
        y1: number,
        length: number,
        angle: number,
        depth: number,
        maxDepth: number,
        startProgress: number,
        endProgress: number,
        thickness: number
      ) => {
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;

        const midX = (x1 + x2) / 2 + Math.sin(angle * 2.3 + depth) * (length * 0.11);
        const midY = (y1 + y2) / 2 - Math.cos(angle * 1.7) * (length * 0.08);

        const branchIndex = branches.length;
        branches.push({
          x1,
          y1,
          midX,
          midY,
          x2,
          y2,
          depth,
          maxDepth,
          startProgress,
          endProgress,
          thicknessStart: thickness,
          thicknessEnd: Math.max(1.2, thickness * 0.68),
          swayFactor: (depth / maxDepth) * 3.2,
          swayPhase: depth * 0.8 + x2 * 0.02,
        });

        if (depth >= 2) {
          const leafColors = ['#FF4F9A', '#FFB6D5', '#FF78B4', '#FF2E88', '#FFD1E6', '#FFF5FA'];
          const leavesOnBranch = depth === maxDepth ? 5 : depth >= 4 ? 3 : 2;
          for (let i = 0; i < leavesOnBranch; i++) {
            const t = 0.35 + (i / leavesOnBranch) * 0.65;
            const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
            const spread = depth === maxDepth ? 22 : 14;
            const offsetX = Math.sin(branchIndex * 7.1 + i * 2.3) * spread;
            const offsetY = Math.cos(branchIndex * 5.3 + i * 3.1) * spread;

            const appearAt = Math.min(0.96, endProgress * 0.72 + 0.32 + i * 0.035);
            heartLeaves.push({
              baseX: bx + offsetX,
              baseY: by + offsetY,
              size: 8.5 + Math.abs(Math.sin(branchIndex + i * 1.9)) * 10.5,
              color: leafColors[(branchIndex + i) % leafColors.length],
              appearAt,
              bloomDuration: 0.16,
              rotation: (((branchIndex * 19 + i * 31) % 50) - 25) * (Math.PI / 180),
              swayFactor: 2.2 + depth * 0.55,
              swayPhase: branchIndex * 0.4 + i,
              hasGlow: (branchIndex + i) % 3 === 0,
            });
          }
        }

        if (depth < maxDepth) {
          const nextStart = endProgress * 0.88;
          const nextEnd = Math.min(0.68, nextStart + 0.115);

          const leftAngle = angle - (0.34 + (depth % 2) * 0.08);
          const rightAngle = angle + (0.32 + ((depth + 1) % 2) * 0.09);

          generateBranch(
            x2,
            y2,
            length * (0.74 + (depth === 1 ? 0.05 : 0)),
            leftAngle,
            depth + 1,
            maxDepth,
            nextStart,
            nextEnd,
            thickness * 0.68
          );

          generateBranch(
            x2,
            y2,
            length * 0.76,
            rightAngle,
            depth + 1,
            maxDepth,
            nextStart + 0.015,
            nextEnd + 0.015,
            thickness * 0.68
          );

          if (depth === 1 || depth === 2) {
            const centerAngle = angle + (depth === 1 ? 0.05 : -0.06);
            generateBranch(
              x2,
              y2,
              length * 0.68,
              centerAngle,
              depth + 1,
              maxDepth,
              nextStart + 0.02,
              nextEnd + 0.02,
              thickness * 0.6
            );
          }
        }
      };

      generateBranch(rootX, rootY, trunkLength, -Math.PI / 2, 1, 6, 0.04, 0.22, 13.5);

      for (let i = 0; i < 22; i++) {
        const angle = (Math.PI * 2 * i) / 22;
        const rx = treeWidth * (0.14 + (i % 4) * 0.06);
        const ry = treeHeight * (0.12 + (i % 3) * 0.06);
        crownSparkles.push({
          x: rootX + Math.cos(angle) * rx,
          y: treeHeight * 0.42 + Math.sin(angle) * ry,
          radius: 1.2 + (i % 3) * 0.9,
          phase: i * 0.7,
        });
      }
    };

    const resizeCanvases = () => {
      ambWidth = window.innerWidth;
      ambHeight = window.innerHeight;
      setViewportWidth(ambWidth);

      ambientCanvas.width = Math.floor(ambWidth * dpr);
      ambientCanvas.height = Math.floor(ambHeight * dpr);
      ambientCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rect = treeCanvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        treeWidth = rect.width;
        treeHeight = rect.height;
        treeCanvas.width = Math.floor(treeWidth * dpr);
        treeCanvas.height = Math.floor(treeHeight * dpr);
        treeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    resetTreeRef.current = () => {
      resizeCanvases();
      buildTreeStructure();
      treeStartTime = performance.now();
      hasTriggeredTreeComplete = false;
      lastFallingSpawn = 0;
    };

    resizeCanvases();
    initAmbientParticles();
    buildTreeStructure();

    const easeOutBack = (x: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    const drawHeart = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rotation: number,
      color: string,
      alpha: number,
      withGlow = false
    ) => {
      if (size <= 0.2 || alpha <= 0.01) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;

      if (withGlow) {
        ctx.shadowColor = '#FF4F9A';
        ctx.shadowBlur = 10;
      }

      const s = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(0, -s * 0.4, -s, -s * 0.4, -s, s * 0.18);
      ctx.bezierCurveTo(-s, s * 0.72, 0, s * 1.08, 0, s * 1.42);
      ctx.bezierCurveTo(0, s * 1.08, s, s * 0.72, s, s * 0.18);
      ctx.bezierCurveTo(s, -s * 0.4, 0, -s * 0.4, 0, s * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let rafId = 0;

    const renderLoop = (now: number) => {
      // 1. تحديث ورسم الخلفية الاحتفالية
      ambientCtx.clearRect(0, 0, ambWidth, ambHeight);
      const densityMultiplier = screenRef.current === 'messages' ? 0.68 : 1;

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        st.phase += st.speed;
        st.x += st.vx;
        st.y += st.vy;

        if (st.x < 0) st.x = ambWidth;
        if (st.x > ambWidth) st.x = 0;
        if (st.y < 0) st.y = ambHeight;
        if (st.y > ambHeight) st.y = 0;

        const twinkle = st.baseAlpha + Math.sin(st.phase) * 0.18;
        const alpha = Math.max(0.05, Math.min(0.8, twinkle * densityMultiplier));

        ambientCtx.save();
        ambientCtx.globalAlpha = alpha;
        ambientCtx.fillStyle = st.color;
        ambientCtx.beginPath();
        ambientCtx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ambientCtx.fill();
        ambientCtx.restore();
      }

      for (let i = 0; i < floatingHearts.length; i++) {
        const h = floatingHearts[i];
        h.phase += h.swayFreq;
        h.y -= h.speedY;
        h.x += h.driftX + Math.sin(h.phase) * h.swayAmp;
        h.rotation += h.rotationSpeed;

        if (h.y < -30) {
          floatingHearts[i] = createFloatingHeart(true);
          continue;
        }

        drawHeart(ambientCtx, h.x, h.y, h.size, h.rotation, h.color, h.alpha * densityMultiplier, false);
      }

      if (!reducedMotionRef.current && now - lastAutoFireworkTime > nextAutoFireworkDelay) {
        lastAutoFireworkTime = now;
        const baseDelay = screenRef.current === 'messages' ? 3800 : 2500;
        nextAutoFireworkDelay = baseDelay + Math.random() * 3200;

        const fx = ambWidth * (0.14 + Math.random() * 0.72);
        const fy = ambHeight * (0.12 + Math.random() * 0.36);
        launchFirework(fx, fy, screenRef.current === 'messages' ? 24 : 32);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.vx *= sp.drag;
        sp.vy = sp.vy * sp.drag + sp.gravity;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        ambientCtx.save();
        ambientCtx.globalAlpha = sp.alpha;
        ambientCtx.fillStyle = sp.color;
        ambientCtx.shadowColor = sp.color;
        ambientCtx.shadowBlur = 8;
        ambientCtx.beginPath();
        ambientCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ambientCtx.fill();
        ambientCtx.restore();
      }

      // 2. تحديث ورسم شجرة الحب في الشاشة الافتتاحية
      if (screenRef.current === 'opening') {
        const elapsed = now - treeStartTime;
        const progress = Math.min(1, elapsed / totalGrowthDuration);
        const swayTime = now * 0.0016;
        const windEnabled = reducedMotionRef.current ? 0 : 1;

        treeCtx.clearRect(0, 0, treeWidth, treeHeight);

        const rootX = treeWidth * 0.5;
        const rootY = treeHeight - 12;

        // الضوء الوردي النابض على الأرض
        const seedPulse = 1 + Math.sin(now * 0.005) * 0.18;
        const seedGrad = treeCtx.createRadialGradient(rootX, rootY, 2, rootX, rootY, 34 * seedPulse);
        seedGrad.addColorStop(0, 'rgba(255, 245, 250, 0.95)');
        seedGrad.addColorStop(0.35, 'rgba(255, 79, 154, 0.65)');
        seedGrad.addColorStop(1, 'rgba(255, 79, 154, 0)');
        treeCtx.save();
        treeCtx.fillStyle = seedGrad;
        treeCtx.beginPath();
        treeCtx.arc(rootX, rootY, 34 * seedPulse, 0, Math.PI * 2);
        treeCtx.fill();
        treeCtx.restore();

        // الجذع والفروع
        for (let i = 0; i < branches.length; i++) {
          const b = branches[i];
          if (progress < b.startProgress) continue;

          const localProg = Math.min(1, (progress - b.startProgress) / (b.endProgress - b.startProgress));
          const swayOffset =
            Math.sin(swayTime + b.swayPhase) * b.swayFactor * windEnabled * Math.min(1, progress * 1.2);
          const parentSway =
            Math.sin(swayTime + b.swayPhase - 0.6) *
            (b.swayFactor * 0.55) *
            windEnabled *
            Math.min(1, progress * 1.2);

          const sx1 = b.x1 + (b.depth > 1 ? parentSway : 0);
          const sy1 = b.y1;
          const smidX = b.midX + (parentSway + swayOffset) * 0.5;
          const smidY = b.midY;
          const sx2 = b.x2 + swayOffset;
          const sy2 = b.y2;

          const t = localProg;
          const curX = (1 - t) * (1 - t) * sx1 + 2 * (1 - t) * t * smidX + t * t * sx2;
          const curY = (1 - t) * (1 - t) * sy1 + 2 * (1 - t) * t * smidY + t * t * sy2;
          const ctrlX = (1 - t) * sx1 + t * smidX;
          const ctrlY = (1 - t) * sy1 + t * smidY;

          treeCtx.save();
          treeCtx.beginPath();
          treeCtx.moveTo(sx1, sy1);
          treeCtx.quadraticCurveTo(ctrlX, ctrlY, curX, curY);

          const branchGrad = treeCtx.createLinearGradient(sx1, sy1, sx2, sy2);
          branchGrad.addColorStop(0, '#4A1E34');
          branchGrad.addColorStop(0.6, '#7A2E52');
          branchGrad.addColorStop(1, '#C85A8E');

          treeCtx.strokeStyle = branchGrad;
          treeCtx.lineWidth = b.thicknessStart * (1 - localProg * 0.25);
          treeCtx.lineCap = 'round';
          treeCtx.shadowColor = 'rgba(255, 79, 154, 0.28)';
          treeCtx.shadowBlur = 6;
          treeCtx.stroke();
          treeCtx.restore();
        }

        // القلوب المزهرة على الفروع
        for (let i = 0; i < heartLeaves.length; i++) {
          const leaf = heartLeaves[i];
          if (progress < leaf.appearAt) continue;

          const rawLeafProg = Math.min(1, (progress - leaf.appearAt) / leaf.bloomDuration);
          const scale = easeOutBack(rawLeafProg);
          const swayX = Math.sin(swayTime * 1.15 + leaf.swayPhase) * leaf.swayFactor * windEnabled;
          const swayY = Math.cos(swayTime * 0.9 + leaf.swayPhase) * (leaf.swayFactor * 0.35) * windEnabled;
          const rot = leaf.rotation + Math.sin(swayTime + leaf.swayPhase) * 0.08 * windEnabled;

          drawHeart(
            treeCtx,
            leaf.baseX + swayX,
            leaf.baseY + swayY,
            leaf.size * scale,
            rot,
            leaf.color,
            Math.min(0.95, rawLeafProg * 1.1),
            leaf.hasGlow
          );
        }

        // جزيئات التاج وتساقط بعض القلوب
        if (progress >= 0.88) {
          const crownAlpha = Math.min(1, (progress - 0.88) / 0.12);
          for (let i = 0; i < crownSparkles.length; i++) {
            const sp = crownSparkles[i];
            const a = (0.3 + Math.sin(now * 0.004 + sp.phase) * 0.3) * crownAlpha;
            treeCtx.save();
            treeCtx.globalAlpha = Math.max(0.05, a);
            treeCtx.fillStyle = '#FFF5FA';
            treeCtx.shadowColor = '#FF4F9A';
            treeCtx.shadowBlur = 8;
            treeCtx.beginPath();
            treeCtx.arc(
              sp.x + Math.sin(swayTime + sp.phase) * 4 * windEnabled,
              sp.y + Math.cos(swayTime + sp.phase) * 3 * windEnabled,
              sp.radius,
              0,
              Math.PI * 2
            );
            treeCtx.fill();
            treeCtx.restore();
          }

          if (!reducedMotionRef.current && now - lastFallingSpawn > 780) {
            lastFallingSpawn = now;
            if (heartLeaves.length > 0 && fallingHearts.length < 10) {
              const source = heartLeaves[Math.floor(Math.random() * heartLeaves.length)];
              fallingHearts.push({
                x: source.baseX,
                y: source.baseY,
                size: source.size * 0.82,
                color: source.color,
                vy: 0.48 + Math.random() * 0.55,
                vx: (Math.random() - 0.5) * 0.35,
                phase: Math.random() * Math.PI * 2,
                rotation: source.rotation,
                rotationSpeed: (Math.random() - 0.5) * 0.025,
                alpha: 0.92,
              });
            }
          }
        }

        const groundThreshold = treeHeight - 22;
        for (let i = fallingHearts.length - 1; i >= 0; i--) {
          const fh = fallingHearts[i];
          fh.phase += 0.035;
          fh.y += fh.vy;
          fh.x += fh.vx + Math.sin(fh.phase) * 0.45;
          fh.rotation += fh.rotationSpeed;

          if (fh.y > groundThreshold - 70) {
            fh.alpha -= 0.022;
          }

          if (fh.alpha <= 0.02 || fh.y >= groundThreshold) {
            fallingHearts.splice(i, 1);
            continue;
          }

          drawHeart(treeCtx, fh.x, fh.y, fh.size, fh.rotation, fh.color, fh.alpha, false);
        }

        if (progress >= 0.92 && !hasTriggeredTreeComplete) {
          hasTriggeredTreeComplete = true;
          triggerOpeningTextReveal();
        }
      }

      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    const handleResize = () => {
      resizeCanvases();
      if (screenRef.current === 'opening') {
        buildTreeStructure();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      clearRevealTimers();
    };
  }, [clearRevealTimers, triggerOpeningTextReveal]);

  // IntersectionObserver لظهور نصوص البطاقات تدريجيًا عند دخولها مجال الرؤية
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idxAttr = entry.target.getAttribute('data-index');
          if (entry.isIntersecting && idxAttr !== null) {
            const idx = Number(idxAttr);
            setCardsInView((prev) => (prev[idx] ? prev : { ...prev, [idx]: true }));
          }
        });
      },
      { threshold: 0.25 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const goToCard = useCallback(
    (targetIndex: number, withSparkleEffect = false) => {
      const total = FRIENDS_MESSAGES.length;
      if (total === 0) return;

      const clamped = Math.max(0, Math.min(total - 1, targetIndex));
      setActiveCardIndex((prev) => {
        if (clamped !== prev && withSparkleEffect && carouselViewportRef.current) {
          const rect = carouselViewportRef.current.getBoundingClientRect();
          const cx = rect.left + rect.width * (0.35 + Math.random() * 0.3);
          const cy = rect.top + rect.height * 0.25;
          launchFireworkRef.current(cx, cy, 18);
        }
        return clamped;
      });
      setDragOffsetPx(0);
      setCardsInView((prev) => ({ ...prev, [clamped]: true }));

      if (clamped === total - 1 && !hasCelebratedLastCard && screenRef.current === 'messages') {
        setHasCelebratedLastCard(true);
        launchSalvoRef.current(3);
      }
    },
    [hasCelebratedLastCard]
  );

  // دعم أسهم لوحة المفاتيح للتنقل بين الرسائل
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentScreen !== 'messages') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToCard(activeCardIndex + 1, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToCard(activeCardIndex - 1, true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, activeCardIndex, goToCard]);

  const handleOpenMessages = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentScreen === 'messages') return;
    setCurrentScreen('messages');
    launchSalvoRef.current(2);
    window.scrollTo({ top: 0, behavior: reducedMotionRef.current ? 'auto' : 'smooth' });

    if (FRIENDS_MESSAGES.length === 1 && !hasCelebratedLastCard) {
      setHasCelebratedLastCard(true);
    }
  };

  const handleReplayCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRevealTimers();
    setCrownBlooming(false);
    setShowTitle(false);
    setShowSubtitle(false);
    setShowCta(false);

    setActiveCardIndex(0);
    setDragOffsetPx(0);
    setHasCelebratedLastCard(false);
    setCurrentScreen('opening');

    window.scrollTo({ top: 0, behavior: reducedMotionRef.current ? 'auto' : 'smooth' });
    launchFireworkRef.current(window.innerWidth * 0.5, window.innerHeight * 0.3, 28);

    window.setTimeout(() => {
      resetTreeRef.current();
    }, 60);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[data-active-card="true"]') ||
      target.closest('a')
    ) {
      return;
    }
    launchFireworkRef.current(e.clientX, e.clientY, 28);
  };

  // معالجات السحب باللمس والماوس للبطاقات
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    dragStateRef.current = {
      active: true,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      deltaX: 0,
      isHorizontal: null,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const st = dragStateRef.current;
    if (!st.active || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - st.startX;
    const dy = e.touches[0].clientY - st.startY;

    if (st.isHorizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      st.isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    if (st.isHorizontal) {
      st.deltaX = dx;
      setDragOffsetPx(dx * 0.65);
    }
  };

  const onTouchEnd = () => {
    const st = dragStateRef.current;
    if (!st.active) return;
    st.active = false;
    const threshold = 44;
    if (st.isHorizontal && Math.abs(st.deltaX) > threshold) {
      if (st.deltaX > 0) {
        goToCard(activeCardIndex + 1, true);
      } else {
        goToCard(activeCardIndex - 1, true);
      }
    } else {
      setDragOffsetPx(0);
    }
    window.setTimeout(() => {
      dragStateRef.current.deltaX = 0;
    }, 50);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      deltaX: 0,
      isHorizontal: true,
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const st = dragStateRef.current;
    if (!st.active) return;
    const dx = e.clientX - st.startX;
    st.deltaX = dx;
    setDragOffsetPx(dx * 0.65);
  };

  const onMouseUpOrLeave = () => {
    const st = dragStateRef.current;
    if (!st.active) return;
    st.active = false;
    setIsDragging(false);
    const threshold = 50;
    if (Math.abs(st.deltaX) > threshold) {
      if (st.deltaX > 0) {
        goToCard(activeCardIndex + 1, true);
      } else {
        goToCard(activeCardIndex - 1, true);
      }
    } else {
      setDragOffsetPx(0);
    }
    window.setTimeout(() => {
      dragStateRef.current.deltaX = 0;
    }, 50);
  };

  const isMobile = viewportWidth < 768;
  const baseStepX = isMobile ? viewportWidth * 0.82 : 360;
  const totalCards = FRIENDS_MESSAGES.length;

  const variantBackgrounds = [
    'radial-gradient(circle at 12% 15%, rgba(255, 79, 154, 0.15) 0%, transparent 50%), rgba(20, 11, 18, 0.78)',
    'radial-gradient(circle at 88% 18%, rgba(255, 182, 213, 0.14) 0%, transparent 52%), rgba(20, 11, 18, 0.78)',
    'radial-gradient(circle at 50% 0%, rgba(255, 79, 154, 0.16) 0%, transparent 55%), rgba(20, 11, 18, 0.78)',
    'radial-gradient(circle at 20% 85%, rgba(255, 182, 213, 0.14) 0%, transparent 52%), rgba(20, 11, 18, 0.78)',
  ];

  return (
    <div
      dir="rtl"
      onClick={handleBackgroundClick}
      className="relative min-h-dvh w-full overflow-x-hidden bg-[#080608] text-[#FFF5FA]"
      style={{
        fontFamily:
          "'Geeza Pro', 'Noto Naskh Arabic', 'Amiri', 'Segoe UI', Tahoma, system-ui, -apple-system, sans-serif",
        background:
          'radial-gradient(circle at 50% 18%, rgba(255, 79, 154, 0.11) 0%, transparent 55%), radial-gradient(circle at 85% 80%, rgba(255, 182, 213, 0.06) 0%, transparent 45%), radial-gradient(circle at 15% 75%, rgba(255, 79, 154, 0.07) 0%, transparent 45%), #080608',
      }}
    >
      {/* خلفية الألعاب النارية والقلوب العائمة والجزيئات المضيئة */}
      <canvas
        ref={ambientCanvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 52%, rgba(8, 6, 8, 0.68) 100%)',
        }}
      />

      <main className="relative z-[5] min-h-dvh w-full overflow-x-hidden">
        {/* ====================================================================
            الشاشة الأولى: شجرة الحب والرسالة الافتتاحية
            ==================================================================== */}
        <section
          aria-label="شاشة التهنئة الافتتاحية"
          className={`flex min-h-dvh w-full flex-col items-center justify-center px-4 py-8 transition-all duration-700 ease-out ${
            currentScreen === 'opening'
              ? 'relative visible translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none invisible absolute inset-x-0 top-0 h-0 min-h-0 -translate-y-6 scale-95 overflow-hidden p-0 opacity-0'
          }`}
        >
          <div className="mx-auto flex w-full max-w-[780px] flex-col items-center gap-3 text-center">
            <div className="relative mb-1 flex h-[clamp(280px,46dvh,440px)] w-full max-w-[540px] items-center justify-center">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-[12%] left-1/2 h-[62%] w-[68%] -translate-x-1/2 rounded-full blur-[22px] transition-all duration-1000 ${
                  crownBlooming ? 'scale-100 opacity-100 animate-pulse' : 'scale-75 opacity-0'
                }`}
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 79, 154, 0.24) 0%, rgba(255, 182, 213, 0.08) 48%, transparent 72%)',
                }}
              />
              <canvas
                ref={treeCanvasRef}
                aria-label="شجرة الحب المزهرة بقلوب وردية"
                className="relative z-[2] block h-full w-full"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 left-1/2 h-[2px] w-[62%] -translate-x-1/2 rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 182, 213, 0.45) 30%, rgba(255, 79, 154, 0.85) 50%, rgba(255, 182, 213, 0.45) 70%, transparent 100%)',
                  boxShadow: '0 0 18px rgba(255, 79, 154, 0.65)',
                }}
              />
            </div>

            <div className="flex max-w-[620px] flex-col items-center gap-3.5 px-2">
              <h1
                className={`flex flex-wrap items-center justify-center gap-2 text-center text-[clamp(1.75rem,4.8vw,2.85rem)] leading-[1.45] font-bold text-[#FFF5FA] transition-all duration-700 ${
                  showTitle
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
                style={{ textShadow: '0 4px 24px rgba(255, 79, 154, 0.25)' }}
              >
                <span>كل سنة وانتي طيبة يا</span>
                <span
                  className="inline-block px-1 text-[1.16em]"
                  style={{
                    background:
                      'linear-gradient(135deg, #FFF5FA 10%, #FFB6D5 48%, #FF4F9A 95%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 12px rgba(255, 79, 154, 0.42))',
                  }}
                >
                  ملك
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex animate-pulse items-center justify-center text-[#FF4F9A]"
                  style={{ textShadow: '0 0 16px rgba(255, 79, 154, 0.85)' }}
                >
                  ♡
                </span>
              </h1>

              <p
                className={`max-w-[48ch] text-center text-[clamp(1.02rem,2.4vw,1.28rem)] leading-[1.75] text-[#FFF5FA]/75 transition-all duration-700 ${
                  showSubtitle
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
              >
                النهارده يومك، وفي ناس كتير عندهم كلام حلو ليكي...
              </p>

              <div
                className={`mt-2 transition-all duration-700 ${
                  showCta
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
              >
                <button
                  type="button"
                  onClick={handleOpenMessages}
                  aria-label="انتقلي إلى رسايل من صحابك"
                  className="group relative inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#FFF5FA]/35 px-9 py-3.5 text-[clamp(1.05rem,2.2vw,1.2rem)] font-bold whitespace-nowrap text-[#FFF5FA] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFB6D5]"
                  style={{
                    background:
                      'linear-gradient(135deg, #FF4F9A 0%, #E02E7B 55%, #FF78B4 100%)',
                    boxShadow:
                      '0 10px 30px -4px rgba(255, 79, 154, 0.52), 0 0 0 1px rgba(255, 182, 213, 0.22) inset, 0 2px 12px rgba(255, 245, 250, 0.25) inset',
                  }}
                >
                  <span>رسايل من صحابك</span>
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-6"
                  >
                    ♡
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            الشاشة الثانية: رسائل من صديقات ملك + الرسالة الختامية
            ==================================================================== */}
        <section
          aria-label="رسائل صديقات ملك"
          className={`flex min-h-dvh w-full flex-col items-center justify-start gap-8 px-4 pt-10 pb-16 transition-all duration-700 ease-out ${
            currentScreen === 'messages'
              ? 'relative visible translate-y-0 scale-100 opacity-100'
              : 'pointer-events-none invisible absolute inset-x-0 top-0 h-0 min-h-0 translate-y-6 scale-95 overflow-hidden p-0 opacity-0'
          }`}
        >
          <header className="mx-auto flex max-w-[680px] flex-col items-center gap-2.5 px-4 text-center">
            <h2
              className="flex items-center justify-center gap-2 text-[clamp(1.7rem,4.2vw,2.5rem)] font-bold text-[#FFF5FA]"
              style={{ textShadow: '0 0 24px rgba(255, 79, 154, 0.35)' }}
            >
              <span>رسايل من صحابك</span>
              <span
                aria-hidden="true"
                className="inline-flex animate-pulse items-center justify-center text-[#FF4F9A]"
              >
                ♡
              </span>
            </h2>
            <p className="text-[clamp(1rem,2.2vw,1.18rem)] leading-[1.7] text-[#FFB6D5]/90">
              كل رسالة هنا شايلة معاها حتة حب ليكي...
            </p>
          </header>

          <div
            aria-roledescription="carousel"
            aria-label="بطاقات رسائل الصديقات"
            className="relative mx-auto flex w-full max-w-[1040px] flex-col items-center gap-6"
          >
            <div
              ref={carouselViewportRef}
              tabIndex={0}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUpOrLeave}
              onMouseLeave={onMouseUpOrLeave}
              aria-label="اسحبي يمينًا أو يسارًا أو استخدمي الأسهم للتنقل بين الرسائل"
              className={`relative flex min-h-[clamp(320px,46dvh,410px)] w-full items-center justify-center overflow-hidden py-5 select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{ perspective: '1200px', touchAction: 'pan-y' }}
            >
              <div
                aria-live="polite"
                className="relative flex h-[clamp(300px,42dvh,370px)] w-full items-center justify-center"
              >
                {FRIENDS_MESSAGES.map((item, index) => {
                  const diff = index - activeCardIndex;
                  const isActive = diff === 0;
                  const isPrevOrNext = Math.abs(diff) === 1;
                  const translateX = -diff * baseStepX + dragOffsetPx;
                  const scale = isActive ? 1 : isPrevOrNext ? 0.88 : 0.76;
                  const rotateY = reducedMotionRef.current ? 0 : diff * 8;
                  const inView = Boolean(cardsInView[index] || isActive);

                  return (
                    <article
                      key={index}
                      ref={(el) => {
                        cardRefs.current[index] = el;
                      }}
                      data-index={index}
                      data-active-card={isActive ? 'true' : 'false'}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`رسالة ${index + 1} من ${totalCards}`}
                      aria-hidden={!isActive}
                      onClick={(e) => {
                        if (Math.abs(dragStateRef.current.deltaX) > 10) return;
                        if (!isActive) {
                          e.stopPropagation();
                          goToCard(index, true);
                        }
                      }}
                      className={`absolute flex max-h-[430px] min-h-[clamp(280px,38dvh,350px)] w-[min(88vw,540px)] flex-col justify-between gap-5 overflow-hidden p-6 text-right backdrop-blur-md transition-all duration-500 sm:p-9 ${
                        isActive
                          ? 'z-10 cursor-default border-[#FF4F9A]/60 opacity-100 select-text'
                          : isPrevOrNext
                            ? 'z-[5] cursor-pointer border-[#FFB6D5]/20 opacity-45 hover:opacity-65'
                            : 'pointer-events-none z-[1] border-[#FFB6D5]/15 opacity-0'
                      }`}
                      style={{
                        background: variantBackgrounds[index % variantBackgrounds.length],
                        borderRadius: index % 2 === 0 ? '28px 22px 28px 22px' : '22px 28px 22px 28px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxShadow: isActive
                          ? '0 22px 55px -12px rgba(0, 0, 0, 0.85), 0 0 36px -4px rgba(255, 79, 154, 0.34), 0 0 0 1px rgba(255, 182, 213, 0.18) inset'
                          : '0 18px 45px -12px rgba(0, 0, 0, 0.78)',
                        transform: `translate3d(${translateX}px, 0, 0) scale(${scale}) rotateY(${rotateY}deg)`,
                      }}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-11 -left-11 h-32 w-32 rounded-full"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(255, 79, 154, 0.18) 0%, transparent 70%)',
                        }}
                      />

                      <div className="flex items-center justify-between gap-3 border-b border-[#FFB6D5]/15 pb-3.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFB6D5]/30 bg-[#FF4F9A]/15 text-[#FFB6D5]"
                            style={{ boxShadow: '0 0 16px rgba(255, 79, 154, 0.22)' }}
                          >
                            <MotifIcon type={item.motif} />
                          </span>
                          <h3 className="text-[clamp(1.15rem,2.5vw,1.38rem)] font-bold text-[#FFB6D5]">
                            {item.friendName}
                          </h3>
                        </div>

                        <span className="text-sm text-[#FFB6D5]/60 tabular-nums">
                          {index + 1} / {totalCards}
                        </span>
                      </div>

                      <div
                        className={`flex flex-1 items-center overflow-y-auto py-1 transition-all duration-500 ${
                          isActive && inView
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-2.5 opacity-0'
                        }`}
                      >
                        <p className="w-full text-[clamp(1.05rem,2.3vw,1.24rem)] leading-[1.85] text-[#FFF5FA]">
                          {item.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 text-sm text-[#FFB6D5]/60">
                        <span>بكل حب لملك ♡</span>
                        <span
                          aria-hidden="true"
                          className="mr-3 h-[1px] flex-1"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(255, 79, 154, 0.35), transparent)',
                          }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* أزرار التنقل ومؤشرات البطاقات */}
            <div className="flex w-full flex-wrap items-center justify-center gap-5 px-4">
              <button
                type="button"
                disabled={activeCardIndex <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  goToCard(activeCardIndex - 1, true);
                }}
                aria-label="الرسالة السابقة"
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#FFB6D5]/30 bg-[#180C15]/85 text-[#FFF5FA] transition-all duration-200 hover:scale-105 hover:border-[#FF4F9A] hover:bg-[#FF4F9A]/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <div
                role="tablist"
                aria-label="مؤشرات الرسائل"
                className="flex flex-wrap items-center justify-center gap-2 px-3 py-1.5"
              >
                {FRIENDS_MESSAGES.map((_, idx) => {
                  const isActive = idx === activeCardIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`الانتقال إلى الرسالة ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToCard(idx, true);
                      }}
                      className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 ${
                        isActive
                          ? 'w-7 bg-[#FF4F9A] shadow-[0_0_12px_rgba(255,79,154,0.8)]'
                          : 'w-2.5 bg-[#FFB6D5]/30 hover:bg-[#FFB6D5]/60'
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                disabled={activeCardIndex >= totalCards - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  goToCard(activeCardIndex + 1, true);
                }}
                aria-label="الرسالة التالية"
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[#FFB6D5]/30 bg-[#180C15]/85 text-[#FFF5FA] transition-all duration-200 hover:scale-105 hover:border-[#FF4F9A] hover:bg-[#FF4F9A]/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>

            <p className="text-center text-xs text-[#FFB6D5]/60 sm:text-sm">
              يمكنكِ السحب يمينًا ويسارًا أو استخدام أسهم لوحة المفاتيح للتنقل بين الرسائل
            </p>
          </div>

          {/* القسم الختامي */}
          <footer
            className={`mx-auto mt-6 flex w-full max-w-[660px] flex-col items-center gap-4 rounded-[28px] border px-6 py-8 text-center transition-all duration-500 sm:px-9 sm:py-10 ${
              hasCelebratedLastCard
                ? 'border-[#FF4F9A]/60 shadow-[0_22px_58px_-10px_rgba(0,0,0,0.85),0_0_42px_-4px_rgba(255,79,154,0.35)]'
                : 'border-[#FFB6D5]/20 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.75)]'
            }`}
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(255, 79, 154, 0.18) 0%, transparent 68%), rgba(18, 10, 16, 0.72)',
            }}
          >
            <h3
              className="text-[clamp(1.4rem,3.6vw,2rem)] leading-[1.5] font-bold text-[#FFF5FA]"
              style={{ textShadow: '0 0 20px rgba(255, 79, 154, 0.38)' }}
            >
              وفي الآخر... كل الحب ده ليكي يا ملك ♡
            </h3>
            <p className="max-w-[46ch] text-[clamp(1.02rem,2.3vw,1.22rem)] leading-[1.8] text-[#FFB6D5]">
              يا رب سنتك الجديدة تكون مليانة ضحك وراحة بال وأيام حلوة شبه قلبك.
            </p>
            <button
              type="button"
              onClick={handleReplayCelebration}
              aria-label="احتفلي تاني والعودة إلى شجرة الحب"
              className="mt-2 inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full border border-[#FFB6D5]/45 px-8 py-3 text-[clamp(1rem,2.1vw,1.14rem)] font-bold whitespace-nowrap text-[#FFF5FA] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-[#FF4F9A] active:translate-y-0 active:scale-[0.97]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 79, 154, 0.28) 0%, rgba(255, 182, 213, 0.15) 100%)',
                boxShadow: '0 8px 26px rgba(255, 79, 154, 0.25)',
              }}
            >
              <span>احتفلي تاني ✨</span>
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
}
