import React, { useEffect, useRef } from 'react';

export const LiquidCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationFrameId: number;

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.04;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.04;

      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${currentPos.current.x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${currentPos.current.y}px`);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      style={{
        '--mouse-x': '50vw',
        '--mouse-y': '40vh',
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-[#07080b]" />

      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 mix-blend-screen transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(45, 55, 72, 0.8) 0%, rgba(15, 23, 42, 0) 70%)',
          transform: 'translate(calc(var(--mouse-x) - 300px), calc(var(--mouse-y) - 300px))',
        }}
      />

      <div 
        className="absolute top-[-10%] right-[10%] w-[700px] h-[700px] rounded-full blur-[160px] opacity-20 animate-pulse mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(55, 65, 81, 0.7) 0%, rgba(17, 24, 39, 0) 75%)',
          animationDuration: '14s',
        }}
      />

      <div 
        className="absolute bottom-[-15%] left-[5%] w-[800px] h-[600px] rounded-full blur-[180px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(30, 41, 59, 0.9) 0%, rgba(10, 15, 25, 0) 80%)',
        }}
      />

      <div 
        className="absolute w-[360px] h-[360px] rounded-full blur-[80px] opacity-15 mix-blend-overlay pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)',
          transform: 'translate(calc(var(--mouse-x) - 180px), calc(var(--mouse-y) - 180px))',
        }}
      />

      <div className="absolute inset-0 grain-overlay opacity-30" />

      <svg className="hidden">
        <defs>
          <filter id="liquid-displacement">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
