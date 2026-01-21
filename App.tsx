
import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * The Dark Secret - Joke Website
 * Minimalist version:
 * - "Nothing..." text minimized to 5px and moved to bottom-left.
 * - Vertical scroll: Color cycling.
 * - Blur effects removed.
 */

const SECRET_TEXT = "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39";

const App: React.FC = () => {
  const [copied, setCopied] = useState(false);

  // Position tracking
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  // Virtual tracking for color
  const virtualColor = useRef(0);
  
  const requestRef = useRef<number>(null);

  const LERP_FACTOR = 0.15;
  const COLOR_SENSITIVITY = 0.5;

  const animate = useCallback(() => {
    // Smoothen mouse position
    currentPos.current.x += (mousePos.current.x - currentPos.current.x) * LERP_FACTOR;
    currentPos.current.y += (mousePos.current.y - currentPos.current.y) * LERP_FACTOR;

    document.documentElement.style.setProperty('--mouse-x', `${currentPos.current.x}px`);
    document.documentElement.style.setProperty('--mouse-y', `${currentPos.current.y}px`);

    // Color shifting (Vertical Scroll controls color now)
    const hue = Math.abs(virtualColor.current * COLOR_SENSITIVITY) % 360;
    document.documentElement.style.setProperty('--beam-color', `hsla(${hue}, 100%, 75%, 1)`);

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    // Vertical wheel now changes colors again
    virtualColor.current += e.deltaY;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleWheel]);

  const handleCopy = () => {
    navigator.clipboard.writeText(SECRET_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-screen bg-[#000000] cursor-none overflow-hidden select-none">
      {/* Visual Flashlight Beam Layers */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="flashlight-ambient"></div>
        <div className="flashlight-beam"></div>
      </div>

      {/* Hidden Content Layer */}
      <div className="flashlight-mask fixed inset-0 pointer-events-none z-40">
        {/* "Nothing..." positioned bottom left, 5px font size */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <div className="relative flex flex-col items-start">
            <span 
              onClick={handleCopy}
              className="text-white font-mono cursor-pointer transition-opacity hover:opacity-80 active:scale-95"
              style={{
                fontSize: '5px',
                letterSpacing: '0.05em',
              }}
            >
              Nothing...
            </span>
            
            {copied && (
              <div className="absolute left-0 -top-8 whitespace-nowrap">
                <span className="text-[10px] text-white font-mono uppercase tracking-widest bg-white/10 px-2 py-1 rounded backdrop-blur-sm">
                  Copied
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Atmospheric noise overlay */}
      <div 
        className="fixed inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>
    </div>
  );
};

export default App;
