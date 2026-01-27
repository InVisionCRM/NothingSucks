
import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * The Dark Secret - Joke Website
 * Minimalist version:
 * - "Nothing" text at 25px in the center.
 * - Text becomes transparent on hover.
 * - Clicking copies "Nothing Pasted" to clipboard.
 * - Click triggers a cinematic beam expansion and screen whiteout with "Nothing Copied" text.
 * - Vertical scroll: Color cycling.
 */

const App: React.FC = () => {
  const [isExploded, setIsExploded] = useState(false);

  // Initial position at center of screen
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  // Beam size animation state
  const currentBeamSize = useRef(320);
  const targetBeamSize = useRef(320);
  
  const virtualColor = useRef(0);
  const requestRef = useRef<number | null>(null);

  const LERP_FACTOR = 0.15;
  const SIZE_LERP_FACTOR = 0.08; // Control the speed of the expansion
  const COLOR_SENSITIVITY = 0.5;

  const animate = useCallback(() => {
    // Smoothen mouse position
    currentPos.current.x += (mousePos.current.x - currentPos.current.x) * LERP_FACTOR;
    currentPos.current.y += (mousePos.current.y - currentPos.current.y) * LERP_FACTOR;

    // Smoothen beam size
    currentBeamSize.current += (targetBeamSize.current - currentBeamSize.current) * SIZE_LERP_FACTOR;

    // Apply to :root
    const root = document.documentElement;
    root.style.setProperty('--mouse-x', `${currentPos.current.x}px`);
    root.style.setProperty('--mouse-y', `${currentPos.current.y}px`);
    root.style.setProperty('--beam-size', `${currentBeamSize.current}px`);

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
    setIsExploded(true);
    
    // Expand beam dramatically to cover the screen
    targetBeamSize.current = Math.max(window.innerWidth, window.innerHeight) * 3;

    setTimeout(() => {
      setIsExploded(false);
      // Contract beam back to normal
      targetBeamSize.current = 320;
    }, 2500);
  };

  return (
    <div className="relative w-full h-screen bg-[#000000] cursor-none overflow-hidden select-none touch-none">
      {/* Visual Flashlight Beam Layers */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="flashlight-ambient"></div>
        <div className="flashlight-beam"></div>
      </div>

      {/* Whiteout Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-700 ${isExploded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <span className="text-black font-mono text-sm tracking-[0.2em] uppercase">
          Nothing Copied
        </span>
      </div>

      {/* Hidden Content Layer */}
      <div className="flashlight-mask fixed inset-0 pointer-events-none z-40">
        
        {/* "Nothing" positioned center screen, moved up by 30px */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-30px] pointer-events-auto">
          <div className="relative flex flex-col items-center">
            
            {/* Wrapper for bigger hit/disappear area */}
            <div 
              onClick={handleCenterClick}
              className="group p-24 -m-20 cursor-pointer flex items-center justify-center"
            >
              <span 
                className="text-white font-mono transition-opacity duration-300 group-hover:opacity-0 active:scale-95"
                style={{
                  fontSize: '25px',
                  letterSpacing: '0.05em',
                }}
              >
                Nothing
              </span>
            </div>
            
            {/* Hint with animated arrow */}
            <div className="mt-8 flex flex-col items-center opacity-60 pointer-events-none">
              <svg 
                className="w-4 h-4 text-white animate-bounce mb-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="text-[10px] text-white font-mono tracking-widest uppercase">
                (Copy Nothing)
              </span>
            </div>
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
