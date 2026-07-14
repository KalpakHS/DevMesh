import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Base Tech Hubs to cluster coordinates realistically
const BASE_HUBS = [
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194, color: '#3B82F6' },
  { name: 'New York', lat: 40.7128, lon: -74.0060, color: '#3B82F6' },
  { name: 'London', lat: 51.5074, lon: -0.1278, color: '#8B5CF6' },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, color: '#8B5CF6' },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, color: '#10B981' },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, color: '#10B981' },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, color: '#F59E0B' },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, color: '#F59E0B' },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, color: '#EF4444' },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, color: '#3B82F6' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, color: '#8B5CF6' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, color: '#F59E0B' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, color: '#10B981' },
  { name: 'Austin', lat: 30.2672, lon: -97.7431, color: '#3B82F6' }
];

const NAMES = [
  'Aarav Patel', 'Priya Sharma', 'Rohan Mehta', 'Sneha Reddy', 'Aditya Verma',
  'Ananya Rao', 'Vikram Singh', 'Kavya Nair', 'Rahul Joshi', 'Diya Iyer',
  'Amit Gupta', 'Neha Sen', 'Sanjay Kumar', 'Riya Kapoor', 'Arjun Malhotra'
];

const ROLES = [
  { title: 'React Developer', type: 'Developer', color: '#3B82F6' },
  { title: 'Fullstack Engineer', type: 'Developer', color: '#3B82F6' },
  { title: 'Python Architect', type: 'Developer', color: '#3B82F6' },
  { title: 'Staff Engineer', type: 'Mentor', color: '#10B981' },
  { title: 'Stanford Professor', type: 'Mentor', color: '#10B981' },
  { title: 'Senior Architect', type: 'Mentor', color: '#10B981' },
  { title: 'Vercel HR Lead', type: 'Recruiter', color: '#F59E0B' },
  { title: 'Stripe Recruiter', type: 'Recruiter', color: '#F59E0B' },
  { title: 'Talent Partner', type: 'Recruiter', color: '#F59E0B' }
];

const ACTIVITIES = [
  { type: 'join', text: '✓ Aarav joined AI Interview Platform' },
  { type: 'milestone', text: '✓ Mentor approved Sprint 3' },
  { type: 'view', text: "✓ Recruiter viewed Priya's profile" },
  { type: 'collab', text: '✓ Sarah accepted collaboration invite' },
  { type: 'sync', text: '✓ GitHub repository synchronized' },
  { type: 'interview', text: '✓ Interview scheduled for tomorrow' },
  { type: 'milestone', text: '✓ Team milestone completed' }
];

const GlobeVisualization = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Animation/Interactive state
  const [notifications, setNotifications] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [stats, setStats] = useState({ devs: 0, projects: 0, mentors: 0, recruiters: 0, countries: 0 });

  const rotationRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, canvasX: 0, canvasY: 0 });
  const nodesRef = useRef([]);
  const globePulsesRef = useRef([]);

  // Generate 75 nodes clustered around main tech hubs
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 75; i++) {
      const hub = BASE_HUBS[i % BASE_HUBS.length];
      const role = ROLES[i % ROLES.length];
      // Add slight random offset to create a scatter clustering effect
      const latOffset = (Math.random() - 0.5) * 8;
      const lonOffset = (Math.random() - 0.5) * 8;
      list.push({
        id: i,
        name: NAMES[i % NAMES.length] + ` #${100 + i}`,
        role: role.title,
        type: role.type,
        color: role.color,
        lat: hub.lat + latOffset,
        lon: hub.lon + lonOffset,
        status: Math.random() > 0.35 ? 'Online ●' : 'Idle ◑'
      });
    }
    nodesRef.current = list;
  }, []);

  // Periodic notification generator
  useEffect(() => {
    // Initial notifications setup
    setNotifications([
      { id: 1, text: ACTIVITIES[0].text },
      { id: 2, text: ACTIVITIES[1].text }
    ]);

    const interval = setInterval(() => {
      const item = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      const id = Date.now();
      setNotifications((prev) => [...prev.slice(-2), { id, text: item.text }]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Smooth Count-up Statistics on mount
  useEffect(() => {
    let start = null;
    const duration = 1800; // 1.8s count up duration
    
    const animateStats = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      setStats({
        devs: Math.floor(progress * 2000),
        projects: Math.floor(progress * 500),
        mentors: Math.floor(progress * 120),
        recruiters: Math.floor(progress * 50),
        countries: Math.floor(progress * 45)
      });

      if (progress < 1) {
        requestAnimationFrame(animateStats);
      }
    };

    requestAnimationFrame(animateStats);
  }, []);

  // Mouse telemetry handler
  const handleMouseMove = (e) => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    
    // Rotation targets
    mouseRef.current.targetX = (e.clientX - cx) / (rect.width / 2);
    mouseRef.current.targetY = (e.clientY - cy) / (rect.height / 2);

    // Canvas coordinates for hover culling checks
    const canvasRect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.canvasX = e.clientX - canvasRect.left;
    mouseRef.current.canvasY = e.clientY - canvasRect.top;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    mouseRef.current.canvasX = -999;
    mouseRef.current.canvasY = -999;
    setHoveredNode(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const GLOBE_RADIUS = 160;
    const CAMERA_DISTANCE = 450;

    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getCartesian = (lat, lon, radius = GLOBE_RADIUS) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return {
        x: -(radius * Math.sin(phi) * Math.sin(theta)),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.cos(theta)
      };
    };

    // 1. Constellation background nodes (40 stars)
    const backgroundStars = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * 600 - 300,
      y: Math.random() * 600 - 300,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: 0.8 + Math.random() * 1.5
    }));

    // Orbiting globe particles
    const orbitParticles = Array.from({ length: 40 }).map(() => {
      const radius = GLOBE_RADIUS + 25 + Math.random() * 45;
      const speed = 0.0015 + Math.random() * 0.002;
      const angle = Math.random() * Math.PI * 2;
      const planeAngle = (Math.random() - 0.5) * Math.PI * 0.25;
      return { radius, speed, angle, planeAngle, size: 1.2 + Math.random() * 1.2 };
    });

    let tick = 0;
    const render = () => {
      tick += 1;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Damp mouse target displacement (easing rotation offsets)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Slow rotation increment
      rotationRef.current.y += 0.0012; // slow rotation speed
      
      const rotY = rotationRef.current.y + mouseRef.current.x * 0.25;
      const rotX = mouseRef.current.y * 0.25;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Transformation logic
      const transform3D = (pt) => {
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;
        let y2 = pt.y * cosX - z1 * sinX;
        let z2 = pt.y * sinX + z1 * cosX;
        const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE + z2);
        return { x: x1 * scale + cx, y: y2 * scale + cy, z: z2, scale };
      };

      // Draw background constellation particles
      ctx.lineWidth = 0.45;
      backgroundStars.forEach((star, index) => {
        // Drift movement
        star.x += star.vx;
        star.y += star.vy;

        // Bounce back inside virtual frame bounds
        if (Math.abs(star.x) > cx) star.vx *= -1;
        if (Math.abs(star.y) > cy) star.vy *= -1;

        // Apply mouse-reactive parallax offsets
        const px = star.x + cx - mouseRef.current.x * 20;
        const py = star.y + cy - mouseRef.current.y * 20;

        ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect star to nearby stars (constellation lines)
        for (let j = index + 1; j < backgroundStars.length; j++) {
          const nextStar = backgroundStars[j];
          const npx = nextStar.x + cx - mouseRef.current.x * 20;
          const npy = nextStar.y + cy - mouseRef.current.y * 20;
          const dist = Math.hypot(px - npx, py - npy);
          if (dist < 80) {
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.08 * (1 - dist / 80)})`;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(npx, npy);
            ctx.stroke();
          }
        }
      });

      // Soft backing halo glow
      const haloGradient = ctx.createRadialGradient(cx, cy, GLOBE_RADIUS - 10, cx, cy, GLOBE_RADIUS + 90);
      haloGradient.addColorStop(0, 'rgba(37, 99, 235, 0.07)');
      haloGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.03)');
      haloGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, GLOBE_RADIUS + 90, 0, Math.PI * 2);
      ctx.fill();

      // Draw premium digital Earth dotted lines
      const gridSegments = 90;
      for (let lat = -80; lat <= 80; lat += 8) {
        for (let lonStep = 0; lonStep <= gridSegments; lonStep++) {
          const lon = (lonStep / gridSegments) * 360 - 180;
          const pt3d = getCartesian(lat, lon);
          const screenPt = transform3D(pt3d);

          if (screenPt.z < GLOBE_RADIUS * 0.15) {
            if (lonStep % 3 === 0) {
              const depthOpacity = 1 + screenPt.z / GLOBE_RADIUS;
              ctx.fillStyle = `rgba(59, 130, 246, ${0.18 * depthOpacity})`;
              ctx.beginPath();
              ctx.arc(screenPt.x, screenPt.y, 0.95, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw Orbiting particles
      orbitParticles.forEach((p) => {
        p.angle += p.speed;
        const ptOrbit = {
          x: p.radius * Math.cos(p.angle) * Math.cos(p.planeAngle),
          y: p.radius * Math.sin(p.planeAngle),
          z: p.radius * Math.sin(p.angle) * Math.cos(p.planeAngle)
        };
        const sPt = transform3D(ptOrbit);
        const opacity = sPt.z < 0 ? 0.7 : 0.15;
        ctx.fillStyle = `rgba(124, 58, 237, ${opacity})`;
        ctx.beginPath();
        ctx.arc(sPt.x, sPt.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Map cities coordinates
      const projectedNodes = nodesRef.current.map((node) => {
        const pt = getCartesian(node.lat, node.lon);
        return {
          ...node,
          pt3d: pt,
          screenPt: transform3D(pt)
        };
      });

      // Draw Connection lines (randomly connecting subset of nodes to keep it clean but busy)
      ctx.lineWidth = 0.95;
      for (let i = 0; i < projectedNodes.length; i += 3) {
        const fromNode = projectedNodes[i];
        const toNode = projectedNodes[(i + 7) % projectedNodes.length];
        
        if (fromNode.screenPt.z > 0 && toNode.screenPt.z > 0) continue;

        const pA = fromNode.screenPt;
        const pB = toNode.screenPt;

        // Draw bezier curves
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;
        const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
        const dx = midX - cx;
        const dy = midY - cy;
        const len = Math.hypot(dx, dy) || 1;
        const bendOffset = (dist * 0.3) * (pA.scale + pB.scale) / 2;
        const ctrlX = midX + (dx / len) * bendOffset;
        const ctrlY = midY + (dy / len) * bendOffset;

        ctx.quadraticCurveTo(ctrlX, ctrlY, pB.x, pB.y);

        const lineGrad = ctx.createLinearGradient(pA.x, pA.y, pB.x, pB.y);
        lineGrad.addColorStop(0, `${fromNode.color}25`);
        lineGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.45)');
        lineGrad.addColorStop(1, `${toNode.color}25`);
        ctx.strokeStyle = lineGrad;
        ctx.stroke();
      }

      // Draw active connection pulses traveling between globe nodes
      if (Math.random() < 0.035 && globePulsesRef.current.length < 5) {
        const fromIdx = Math.floor(Math.random() * projectedNodes.length);
        const toIdx = (fromIdx + 7) % projectedNodes.length;
        if (projectedNodes[fromIdx].screenPt.z <= 0 && projectedNodes[toIdx].screenPt.z <= 0) {
          globePulsesRef.current.push({
            fromIdx,
            toIdx,
            progress: 0,
            speed: 0.01 + Math.random() * 0.015
          });
        }
      }

      globePulsesRef.current = globePulsesRef.current.filter((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) return false;

        const fromNode = projectedNodes[pulse.fromIdx];
        const toNode = projectedNodes[pulse.toIdx];
        if (!fromNode || !toNode) return false;

        const pA = fromNode.screenPt;
        const pB = toNode.screenPt;

        // Calculate control point for bezier curve matching
        const midX = (pA.x + pB.x) / 2;
        const midY = (pA.y + pB.y) / 2;
        const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
        const dx = midX - cx;
        const dy = midY - cy;
        const len = Math.hypot(dx, dy) || 1;
        const bendOffset = (dist * 0.3) * (pA.scale + pB.scale) / 2;
        const ctrlX = midX + (dx / len) * bendOffset;
        const ctrlY = midY + (dy / len) * bendOffset;

        const t = pulse.progress;
        const mt = 1 - t;
        const pulseX = mt * mt * pA.x + 2 * mt * t * ctrlX + t * t * pB.x;
        const pulseY = mt * mt * pA.y + 2 * mt * t * ctrlY + t * t * pB.y;

        const opacity = (1 - (pA.z + pB.z) / (2 * GLOBE_RADIUS)) * 0.9;
        if (opacity > 0.1) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#60A5FA';
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        return true;
      });

      // Check hover coordinates (find closest node under cursor)
      let closestNode = null;
      let minDistance = 14; // hover culling pixel boundary

      projectedNodes.forEach((node) => {
        const pt = node.screenPt;
        if (pt.z > GLOBE_RADIUS * 0.25) return; // backside culling

        // Calculate distance from cursor
        const distance = Math.hypot(pt.x - mouseRef.current.canvasX, pt.y - mouseRef.current.canvasY);
        if (distance < minDistance) {
          minDistance = distance;
          closestNode = node;
        }

        const depthOpacity = 1 - pt.z / GLOBE_RADIUS;

        // Draw node pulsing ring
        const pulseRate = 60;
        const ringScale = 1 + (tick % pulseRate) / pulseRate * 1.5;
        ctx.strokeStyle = `${node.color}${Math.floor((1 - (tick % pulseRate) / pulseRate) * 80).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5 * ringScale, 0, Math.PI * 2);
        ctx.stroke();

        // Core solid node dot
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update hover node state
      if (closestNode) {
        setHoveredNode({
          name: closestNode.name,
          role: closestNode.role,
          status: closestNode.status,
          x: closestNode.screenPt.x,
          y: closestNode.screenPt.y
        });
      } else if (hoveredNode) {
        // clear if moved away
        setHoveredNode(null);
      }

      // Atmosphere outer rim
      const atmosphereGrad = ctx.createRadialGradient(cx, cy, GLOBE_RADIUS - 8, cx, cy, GLOBE_RADIUS + 3);
      atmosphereGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      atmosphereGrad.addColorStop(0.8, 'rgba(37, 99, 235, 0.18)');
      atmosphereGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = atmosphereGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, GLOBE_RADIUS + 5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hoveredNode]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square max-w-[530px] mx-auto flex items-center justify-center select-none"
    >
      {/* 1. Main Canvas Render Block */}
      <canvas ref={canvasRef} className="block pointer-events-auto cursor-crosshair" />

      {/* 2. Custom Node Hover Tooltip overlay */}
      {hoveredNode && (
        <div
          style={{ left: `${hoveredNode.x}px`, top: `${hoveredNode.y - 12}px` }}
          className="absolute -translate-x-1/2 -translate-y-full px-3 py-2 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xl text-left space-y-0.5 pointer-events-none z-30 transition-all duration-150"
        >
          <span className="block font-bold text-[10px] text-slate-850 dark:text-white truncate">
            {hoveredNode.name}
          </span>
          <span className="block text-[8px] text-slate-450 dark:text-slate-400 font-mono">
            {hoveredNode.role}
          </span>
          <span className="block text-[8px] font-semibold text-emerald-500 font-mono flex items-center space-x-1">
            <span>●</span>
            <span className="scale-95">{hoveredNode.status}</span>
          </span>
        </div>
      )}

      {/* 3. Floating Live Activity notifications */}
      <div className="absolute top-2 left-2 right-2 flex flex-col space-y-2 pointer-events-none z-10 text-left">
        <AnimatePresence>
          {notifications.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: -20, y: -5 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: -5 }}
              transition={{ type: 'spring', damping: 22, stiffness: 350 }}
              className="self-start px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md shadow-lg text-[9px] font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2"
            >
              <span>{note.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. Floating telemetry statistics cards */}
      <div className="absolute inset-x-2 bottom-2 grid grid-cols-5 gap-1 md:gap-2 z-10 pointer-events-none">
        {[
          { label: 'Developers', value: stats.devs, suffix: '+' },
          { label: 'Projects', value: stats.projects, suffix: '+' },
          { label: 'Mentors', value: stats.mentors, suffix: '+' },
          { label: 'Recruiters', value: stats.recruiters, suffix: '+' },
          { label: 'Countries', value: stats.countries, suffix: '+' }
        ].map((stat, i) => (
          <div
            key={i}
            className="p-1 sm:p-2 border border-slate-200/50 dark:border-slate-850 bg-white/60 dark:bg-slate-950/50 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center shadow-md shadow-black/5"
          >
            <span className="block font-extrabold text-[9px] sm:text-xs md:text-sm text-brand-primary dark:text-brand-accent font-mono tracking-tight">
              {stat.value}{stat.suffix}
            </span>
            <span className="block text-[6px] sm:text-[8px] text-slate-500 uppercase tracking-widest mt-0.5 scale-95 font-bold font-mono">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobeVisualization;
