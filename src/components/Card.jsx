import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({
  children,
  className,
  tilt = true,
  glow = true,
  glass = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate relative mouse position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (tilt) {
      // Calculate rotation based on center of the card
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Maximum 8 degrees tilt for subtle effect
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      setRotate({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const cardStyle = {
    transform: isHovered && tilt
      ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: isHovered ? 'transform 0.05s ease-out' : 'transform 0.5s ease-out, border-color 0.3s ease, background 0.3s ease',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      onClick={onClick}
      className={clsx(
        'relative rounded-xl border border-border-custom bg-bg-card p-6 shadow-xl transition-all duration-300 overflow-hidden',
        glass && 'glass-panel',
        onClick && 'cursor-pointer hover:border-brand-purple/40',
        className
      )}
      {...props}
    >
      {/* Glow Overlay */}
      {glow && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
          }}
        />
      )}
      
      {/* Light border reflection overlay */}
      {glow && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 border border-transparent rounded-xl"
          style={{
            background: `radial-gradient(150px circle at ${coords.x}px ${coords.y}px, rgba(139, 92, 246, 0.35), transparent 60%)`,
            WebkitMaskImage: 'linear-gradient(white, white), linear-gradient(white, white)',
            WebkitMaskComposite: 'source-out',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      )}

      {/* Light shimmer line that sweeps across the card */}
      <div className="absolute inset-0 pointer-events-none card-shine-effect" />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
