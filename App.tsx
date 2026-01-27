
import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * The Dark Secret - Joke Website
 * Minimalist version:
 * - "Nothing" text at 25px in the center.
 * - Text becomes transparent on hover.
 * - Clicking copies "Nothing Pasted" to clipboard and shows "Nothing Copied" toast.
 * - Vertical scroll: Color cycling.
 */

const App: React.FC = () => {
  const [showToastCenter, setShowToastCenter] = useState(false);

  // Initial position at center of screen
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  const virtualColor = useRef(0);
  const requestRef = useRef<number | null>(null);

  const LERP_FACTOR = 0.15;
  const COLOR_SENSITIVITY = 0.5;

  const animate = useCallback(() => {
    // Smoothen mouse position
    currentPos.current.x += (mousePos.current.x - currentPos.current.x) * LERP_FACTOR;
    currentPos.current.y += (mousePos.current.y - currentPos.current.y) * LERP_FACTOR;

    // Apply to :root
    const root = document.documentElement;
    root.style.setProperty('--mouse-x', `${currentPos.current.x}px`);
    root.style.setProperty('--mouse-y', `${currentPos.current.y}px`);

    const hue = Math.abs(virtualColor.current * COLOR_SENSITIVITY) % 360;
    root.style.setProperty('--beam-color', `hsla(${hue}, 100%, 75%, 1)`);

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleTouch = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    virtualColor.current += e.deltaY;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleWheel, handleTouch]);

  const copyJokeText = async () => {
    try {
      await navigator.clipboard.writeText("Nothing Pasted");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleCenterClick = () => {
    copyJokeText();
    setShowToastCenter(true);
    setTimeout(() => setShowToastCenter(false), 2000);
  };

  return (
    <div className="relative w-full h-screen bg-[#000000] cursor-none overflow-hidden select-none touch-none">
      {/* Visual Flashlight Beam Layers */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="flashlight-ambient"></div>
        <div className="flashlight-beam"></div>
      </div>

      {/* Hidden Content Layer */}
      <div className="flashlight-mask fixed inset-0 pointer-events-none z-40">
        
        {/* "Nothing" positioned center screen, moved up by 30px */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-30px] pointer-events-auto">
          <div className="relative flex flex-col items-center">
            <span 
              onClick={handleCenterClick}
              className="text-white font-mono cursor-pointer transition-opacity duration-300 hover:opacity-0 active:scale-95"
              style={{
                fontSize: '25px',
                letterSpacing: '0.05em',
              }}
            >
              Nothing
            </span>
            
            {showToastCenter && (
              <div className="absolute left-1/2 -top-12 -translate-x-1/2 whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-[12px] text-white font-mono uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded border border-white/20 backdrop-blur-md">
                  Nothing Copied
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Atmospheric noise overlay */}
      <div 
        className="fixed inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>
    </div>
  );
};

export default App;
