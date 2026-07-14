import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const ringRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if the user prefers reduced motion or is on a mobile device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (prefersReducedMotion || isMobile) return;

    setIsVisible(true);

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      // Expand ring when hovering over buttons, links, inputs, or interactive roles
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer');
      
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // Smooth outer ring lag animation using requestAnimationFrame
    let animFrameId;
    const updateRing = () => {
      // Linear interpolation to make the ring catch up smoothly
      const ease = 0.15;
      ringRef.current.x += (position.x - ringRef.current.x) * ease;
      ringRef.current.y += (position.y - ringRef.current.y) * ease;

      const ringEl = document.getElementById('custom-cursor-ring');
      if (ringEl) {
        ringEl.style.transform = `translate3d(${ringRef.current.x}px, ${ringRef.current.y}px, 0) translate3d(-50%, -50%, 0)`;
      }
      animFrameId = requestAnimationFrame(updateRing);
    };

    animFrameId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animFrameId);
    };
  }, [position.x, position.y]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* 1. Core blue dot tracking cursor position instantly */}
      <div
        className="fixed w-1.5 h-1.5 bg-blue-500 rounded-full transition-transform duration-75 ease-out shadow-[0_0_8px_rgba(59,130,246,0.8)]"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate3d(-50%, -50%, 0)'
        }}
      />
      
      {/* 2. Lagging outer ring tracking position with spring interpolation */}
      <div
        id="custom-cursor-ring"
        className={`fixed border border-blue-500/40 rounded-full transition-all duration-300 ease-out ${
          isHovered ? 'w-8 h-8 bg-blue-500/5 border-blue-400' : 'w-5 h-5 bg-transparent'
        }`}
        style={{
          left: 0,
          top: 0
        }}
      />
    </div>
  );
};

export default CustomCursor;
