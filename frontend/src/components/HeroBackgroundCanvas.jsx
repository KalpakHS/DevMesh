import React, { useEffect, useRef } from 'react';

const HeroBackgroundCanvas = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999, targetX: -999, targetY: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize handler
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track global window mouse coordinates relative to canvas
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -999;
      mouseRef.current.targetY = -999;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize 120 tiny particles with depth (for parallax)
    const particleCount = 125;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseX: 0,
      baseY: 0,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: 0.6 + Math.random() * 1.5,
      depth: 0.3 + Math.random() * 0.7, // 0.3 (far) to 1.0 (close)
      alpha: 0.15 + Math.random() * 0.3
    }));

    // No large floating circles or blobs
    const geoCircles = [];

    // Detect if dark mode is active
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    // 60FPS loop
    let tick = 0;
    const render = () => {
      tick += 0.002;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, width, height);

      // Damp mouse coordinates
      if (mouseRef.current.targetX === -999) {
        mouseRef.current.x = -999;
        mouseRef.current.y = -999;
      } else {
        if (mouseRef.current.x === -999) {
          mouseRef.current.x = mouseRef.current.targetX;
          mouseRef.current.y = mouseRef.current.targetY;
        } else {
          mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
          mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;
        }
      }

      const dark = isDarkMode();

      // 1. Draw subtle animated gradient mesh background
      // Soft blue & light purple blurs moving using sines/cosines
      const meshX1 = width * 0.25 + Math.sin(tick) * 110;
      const meshY1 = height * 0.35 + Math.cos(tick) * 70;
      const meshX2 = width * 0.75 + Math.cos(tick * 0.8) * 120;
      const meshY2 = height * 0.65 + Math.sin(tick * 0.8) * 80;

      // Glow spot 1 (soft blue - 8% opacity in light mode)
      const grad1 = ctx.createRadialGradient(meshX1, meshY1, 10, meshX1, meshY1, 550);
      grad1.addColorStop(0, dark ? 'rgba(37, 99, 235, 0.05)' : 'rgba(59, 130, 246, 0.08)');
      grad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(meshX1, meshY1, 550, 0, Math.PI * 2);
      ctx.fill();

      // Glow spot 2 (soft purple - 5% opacity in light mode)
      const grad2 = ctx.createRadialGradient(meshX2, meshY2, 10, meshX2, meshY2, 500);
      grad2.addColorStop(0, dark ? 'rgba(124, 58, 237, 0.04)' : 'rgba(139, 92, 246, 0.05)');
      grad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(meshX2, meshY2, 500, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw very faint blueprint dot grid (2% opacity in light mode)
      ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(37, 99, 235, 0.02)';
      const dotSpacing = 36;
      for (let y = 0; y < height; y += dotSpacing) {
        for (let x = 0; x < width; x += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw gentle spotlight following the cursor (6% opacity in light mode)
      if (mouseRef.current.x !== -999) {
        const spotlight = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 250
        );
        spotlight.addColorStop(0, dark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.06)');
        spotlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = spotlight;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 250, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Floating glass circles and blobs removed (geoCircles is an empty array)

      // 5. Draw 120+ particles and constellation network lines
      particles.forEach((p, index) => {
        // Slow drifting velocities
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Mouse repulsion: push particles away gently
        let dx = p.x - mouseRef.current.x;
        let dy = p.y - mouseRef.current.y;
        let dist = Math.hypot(dx, dy);
        
        let forceX = 0;
        let forceY = 0;
        if (mouseRef.current.x !== -999 && dist < 120) {
          const force = (120 - dist) / 120 * 0.35; // strength of push
          forceX = (dx / dist) * force;
          forceY = (dy / dist) * force;
        }

        // Apply velocities + repulsion + depth-based parallax offsets
        // Particles move slightly relative to mouse displacement
        const parallaxX = mouseRef.current.x !== -999 ? (mouseRef.current.x - width / 2) * 0.02 * p.depth : 0;
        const parallaxY = mouseRef.current.y !== -999 ? (mouseRef.current.y - height / 2) * 0.02 * p.depth : 0;

        const renderX = p.x + forceX + parallaxX;
        const renderY = p.y + forceY + parallaxY;

        // Draw particle dot
        ctx.fillStyle = dark 
          ? `rgba(147, 197, 253, ${p.alpha * p.depth})` // light-blue in dark mode
          : `rgba(37, 99, 235, ${p.alpha * 0.7 * p.depth})`; // blue in light mode
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect close particles (constellation lines)
        for (let j = index + 1; j < particles.length; j++) {
          const nextP = particles[j];
          
          let ndx = nextP.x - mouseRef.current.x;
          let ndy = nextP.y - mouseRef.current.y;
          let ndist = Math.hypot(ndx, ndy);
          
          let nforceX = 0;
          let nforceY = 0;
          if (mouseRef.current.x !== -999 && ndist < 120) {
            const nforce = (120 - ndist) / 120 * 0.35;
            nforceX = (ndx / ndist) * nforce;
            nforceY = (ndy / ndist) * nforce;
          }

          const nparallaxX = mouseRef.current.x !== -999 ? (mouseRef.current.x - width / 2) * 0.02 * nextP.depth : 0;
          const nparallaxY = mouseRef.current.y !== -999 ? (mouseRef.current.y - height / 2) * 0.02 * nextP.depth : 0;

          const nRenderX = nextP.x + nforceX + nparallaxX;
          const nRenderY = nextP.y + nforceY + nparallaxY;

          const distanceBetween = Math.hypot(renderX - nRenderX, renderY - nRenderY);
          
          // Connect if close enough and check depth threshold to form layers
          if (distanceBetween < 75 && Math.abs(p.depth - nextP.depth) < 0.25) {
            const lineAlpha = (1 - distanceBetween / 75) * 0.02 * p.depth;
            ctx.strokeStyle = dark 
              ? `rgba(147, 197, 253, ${lineAlpha})` 
              : `rgba(37, 99, 235, ${lineAlpha})`;
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(nRenderX, nRenderY);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <canvas ref={canvasRef} className="block w-full h-full opacity-[0.9]" />
    </div>
  );
};

export default HeroBackgroundCanvas;
