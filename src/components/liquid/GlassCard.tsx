import React, { useRef, useState, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'surface' | 'subtle' | 'elevated';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
  variant = 'surface',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number; isHovered: boolean }>({
    x: 0,
    y: 0,
    isHovered: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMouseCoord({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovered: true,
    });
  };

  const handleMouseEnter = () => {
    setMouseCoord(prev => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setMouseCoord(prev => ({ ...prev, isHovered: false }));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return 'glass-panel-subtle';
      case 'elevated':
        return 'glass-panel shadow-2xl';
      case 'surface':
      default:
        return 'glass-panel';
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl transition-all duration-200 ${getVariantStyles()} ${
        interactive ? 'glass-panel-interactive cursor-pointer active:scale-[0.995]' : ''
      } ${className}`}
    >
      {interactive && mouseCoord.isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mouseCoord.x}px ${mouseCoord.y}px, rgba(255, 255, 255, 0.08), transparent 70%)`,
          }}
        />
      )}

      <div className="pointer-events-none absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
};
