import React, { useEffect, useRef } from 'react';

const PremiumMeshBackground = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999, targetX: -999, targetY: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isActive = true;

    // Detect prefers-reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Resize canvas to full viewport size
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

    // Track mouse telemetry across the screen
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

    // Monitor tab visibility to pause animation loop when page is hidden
    const handleVisibilityChange = () => {
      isActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Detect if dark mode is active
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    // Generate 180 nodes with depth, pulsing phases, and role-based themes (38% increase in density)
    const nodeCount = 180;
    const nodes = [];
    const activePulses = [];

    const initializeNodes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Calculate approximate globe center on desktop vs mobile
      const isMobile = width < 1024;
      const globeX = isMobile ? width * 0.5 : width * 0.725;
      const globeY = isMobile ? height * 0.7 : height * 0.5;

      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        // Bias some nodes (35%) to cluster around the globe
        const nearGlobe = i < nodeCount * 0.35;
        let x, y;
        
        if (nearGlobe) {
          // Cluster around globe center
          const angle = Math.random() * Math.PI * 2;
          const dist = 80 + Math.random() * 220;
          x = globeX + Math.cos(angle) * dist;
          y = globeY + Math.sin(angle) * dist;
        } else {
          // Spread across canvas
          x = Math.random() * width;
          y = Math.random() * height;
        }

        // Slow velocities (even slower if prefers-reduced-motion is active)
        const speedMultiplier = prefersReducedMotion ? 0.08 : 0.45;
        const vx = (Math.random() - 0.5) * speedMultiplier;
        const vy = (Math.random() - 0.5) * speedMultiplier;

        nodes.push({
          x,
          y,
          vx,
          vy,
          baseRadius: 1.0 + Math.random() * 0.5, // radius 1px to 1.5px, so size/diameter is 2px to 3px!
          depth: 0.3 + Math.random() * 0.7, // Parallax depth layer
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.01, // gentle 4-6s cycle
          isPulsing: Math.random() > 0.7, // 30% of particles are pulsing
          colorType: i % 4, // map to 4 colors now!
          nearGlobe
        });
      }
    };

    initializeNodes();

    let tick = 0;
    const render = () => {
      if (!isActive) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      tick += 0.003;
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
          mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
          mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;
        }
      }

      const dark = isDarkMode();
      const isMobile = width < 1024;
      const globeX = isMobile ? width * 0.5 : width * 0.725;
      const globeY = isMobile ? height * 0.7 : height * 0.5;

      // 1. Draw subtle background mesh radial glows
      // Soft blue glow behind page layout (exactly 15-20% opacity in light, 8% in dark)
      const glowX = width * 0.3 + Math.sin(tick) * 50;
      const glowY = height * 0.45 + Math.cos(tick) * 40;
      const glowRad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, 550);
      glowRad.addColorStop(0, dark ? 'rgba(37, 99, 235, 0.07)' : 'rgba(59, 130, 246, 0.16)');
      glowRad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowRad;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 550, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw faint technical grid pattern (3-5% opacity in dark, 2-3% opacity in light mode)
      ctx.lineWidth = 0.45;
      ctx.strokeStyle = dark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(37, 99, 235, 0.025)';
      const gridSize = 45;
      
      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 3. Draw gentle spotlight following mouse
      if (mouseRef.current.x !== -999) {
        const spotlight = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 220
        );
        spotlight.addColorStop(0, dark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.06)');
        spotlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = spotlight;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 220, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Update and render nodes
      const projectedNodes = nodes.map((node) => {
        // Slow movement step
        node.x += node.vx;
        node.y += node.vy;

        // Pulse logic
        node.pulsePhase += node.pulseSpeed;

        // Wrap boundaries
        if (node.x < -15) node.x = width + 15;
        if (node.x > width + 15) node.x = -15;
        if (node.y < -15) node.y = height + 15;
        if (node.y > height + 15) node.y = -15;

        // Subtle mouse repulsion/reaction
        let dx = node.x - mouseRef.current.x;
        let dy = node.y - mouseRef.current.y;
        let dist = Math.hypot(dx, dy);

        let forceX = 0;
        let forceY = 0;
        if (mouseRef.current.x !== -999 && dist < 130) {
          const strength = (130 - dist) / 130 * 0.45;
          forceX = (dx / dist) * strength;
          forceY = (dy / dist) * strength;
        }

        // Parallax offset matching depth
        const parallaxX = mouseRef.current.x !== -999 ? (mouseRef.current.x - width / 2) * 0.015 * node.depth : 0;
        const parallaxY = mouseRef.current.y !== -999 ? (mouseRef.current.y - height / 2) * 0.015 * node.depth : 0;

        const renderX = node.x + forceX + parallaxX;
        const renderY = node.y + forceY + parallaxY;

        // Dynamic coloring matching user requirements:
        // Dark Mode: Blue, Cyan, White
        // Light Mode: Mix of #2563EB (blue), #60A5FA (light blue), #0EA5E9 (cyan), and #94A3B8 (slate) at 0.22 - 0.30 opacity
        let color = '';
        if (dark) {
          if (node.colorType === 0) color = 'rgba(59, 130, 246, 0.65)'; // Blue
          else if (node.colorType === 1) color = 'rgba(6, 182, 212, 0.65)'; // Cyan
          else if (node.colorType === 2) color = 'rgba(255, 255, 255, 0.7)'; // White
          else color = 'rgba(147, 197, 253, 0.6)'; // Blue-white
        } else {
          const pulseFactor = Math.sin(node.pulsePhase) * 0.04; // +/- 0.04 variation
          const baseAlpha = 0.26 + pulseFactor; // exactly in 0.22 - 0.30 opacity range!
          
          if (node.colorType === 0) color = `rgba(37, 99, 235, ${baseAlpha})`; // #2563EB Blue
          else if (node.colorType === 1) color = `rgba(96, 165, 250, ${baseAlpha})`; // #60A5FA Light Blue
          else if (node.colorType === 2) color = `rgba(14, 165, 233, ${baseAlpha})`; // #0EA5E9 Cyan
          else color = `rgba(148, 163, 184, ${baseAlpha})`; // #94A3B8 Slate
        }

        return {
          ...node,
          renderX,
          renderY,
          color
        };
      });

      // 5. Draw connection lines (Mesh connections with opacity targets)
      // Dark mode: rgba(80,170,255,0.18)
      // Light mode: rgba(30,110,255,0.08)
      ctx.lineWidth = 0.55;
      const connectionDist = 110;

      for (let i = 0; i < projectedNodes.length; i++) {
        const nA = projectedNodes[i];
        
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const nB = projectedNodes[j];
          const distBetween = Math.hypot(nA.renderX - nB.renderX, nA.renderY - nB.renderY);

          if (distBetween < connectionDist) {
            // Calculate base opacity
            const fade = 1 - distBetween / connectionDist;
            const targetMaxOpacity = dark ? 0.18 : 0.15;
            
            // Boost line opacity slightly if close to the globe center (to visually lead toward the globe)
            const distToGlobe = Math.hypot((nA.renderX + nB.renderX) / 2 - globeX, (nA.renderY + nB.renderY) / 2 - globeY);
            const globeBoost = distToGlobe < 250 ? (250 - distToGlobe) / 250 * 0.075 : 0;
            
            let lineOpacity = fade * (targetMaxOpacity + globeBoost) * nA.depth;

            // Clamp light mode opacity to exactly 0.12 - 0.18 so they stay visible on white
            if (!dark) {
              lineOpacity = Math.max(0.12, Math.min(0.18, lineOpacity));
            }

            ctx.strokeStyle = dark
              ? `rgba(80, 170, 255, ${lineOpacity})`
              : `rgba(37, 99, 235, ${lineOpacity})`;

            ctx.beginPath();
            ctx.moveTo(nA.renderX, nA.renderY);
            ctx.lineTo(nB.renderX, nB.renderY);
            ctx.stroke();
          }
        }
      }

      // 5.1 Update and render active pulses representing developers collaborating in real time
      if (Math.random() < 0.02 && activePulses.length < 6) {
        const fromIdx = Math.floor(Math.random() * projectedNodes.length);
        const fromNode = projectedNodes[fromIdx];
        const neighbors = [];
        projectedNodes.forEach((node, idx) => {
          if (idx !== fromIdx) {
            const d = Math.hypot(node.renderX - fromNode.renderX, node.renderY - fromNode.renderY);
            if (d < 110) {
              neighbors.push(idx);
            }
          }
        });
        if (neighbors.length > 0) {
          const toIdx = neighbors[Math.floor(Math.random() * neighbors.length)];
          activePulses.push({
            fromIdx,
            toIdx,
            progress: 0,
            speed: 0.007 + Math.random() * 0.012
          });
        }
      }

      for (let k = activePulses.length - 1; k >= 0; k--) {
        const pulse = activePulses[k];
        pulse.progress += pulse.speed;
        
        if (pulse.progress >= 1) {
          activePulses.splice(k, 1);
          continue;
        }

        const nA = projectedNodes[pulse.fromIdx];
        const nB = projectedNodes[pulse.toIdx];

        if (nA && nB) {
          // Interpolate current position
          const px = nA.renderX + (nB.renderX - nA.renderX) * pulse.progress;
          const py = nA.renderY + (nB.renderY - nA.renderY) * pulse.progress;

          // Draw a small glowing pulse traveling along the connection line
          ctx.shadowBlur = 8;
          ctx.shadowColor = dark ? 'rgba(59, 130, 246, 0.9)' : 'rgba(37, 99, 235, 0.7)';
          ctx.fillStyle = dark ? '#60A5FA' : '#2563EB';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }

      // 6. Draw actual nodes
      projectedNodes.forEach((node) => {
        // Calculate pulse scale (modulates size gently by 0.5px)
        let size = node.baseRadius;
        if (node.isPulsing) {
          size += Math.sin(node.pulsePhase) * 0.45;
        }

        // Globe node interaction: nodes close to the globe glow stronger
        const distToGlobe = Math.hypot(node.renderX - globeX, node.renderY - globeY);
        const nearGlobeActive = distToGlobe < 200;

        if (nearGlobeActive) {
          // Boost size and add glow ring
          size *= 1.15;
          ctx.shadowBlur = 6;
          ctx.shadowColor = dark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.65)';
        } else if (!dark) {
          // In Light Mode, active particles get a soft blue glow (blur 4-8px)
          ctx.shadowBlur = node.isPulsing ? 7 : 4;
          ctx.shadowColor = 'rgba(37, 99, 235, 0.35)';
        } else if (dark && node.colorType === 0) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.renderX, node.renderY, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw soft pulsing outline ring for active nodes
        if (node.isPulsing && (nearGlobeActive || node.colorType === 0)) {
          ctx.strokeStyle = dark ? 'rgba(80, 170, 255, 0.15)' : 'rgba(37, 99, 235, 0.12)';
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.arc(node.renderX, node.renderY, size * 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Reset shadow settings for next renders
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <canvas ref={canvasRef} className="block w-full h-full opacity-[0.92]" />
    </div>
  );
};

export default PremiumMeshBackground;
