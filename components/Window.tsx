
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

interface WindowProps {
  instance: {
    id: string;
    title: string;
    icon: React.ReactNode;
    isMinimized: boolean;
    zIndex: number;
    customIcon?: string;
  };
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

const CASCADE_STEP_X = 30;
const CASCADE_STEP_Y = 25;
const MAX_CASCADE_STEPS = 8;
const OVERLAP_THRESHOLD = 20;
const openWindowPositions: { id: string; x: number; y: number }[] = [];

const MOBILE_BREAKPOINT = 768;

const Window: React.FC<WindowProps> = ({ instance, onClose, onMinimize, onFocus, children }) => {
  const isMusicApp = instance.id === 'music';
  
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (mobile) setIsMaximized(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    if (instance.id === 'music') {
      return { x: winW - 360, y: winH - 500 };
    }

    const appW = 820;
    const appH = 620;
    
    const baseX = Math.max(20, (winW - appW) / 2);
    const baseY = Math.max(20, (winH - appH) / 2 - 30);
    
    return { x: baseX, y: baseY };
  });

  useLayoutEffect(() => {
    if (isMusicApp) return;

    let posX = position.x;
    let posY = position.y;
    let moved = false;

    for (let step = 0; step < MAX_CASCADE_STEPS; step++) {
      const overlapping = openWindowPositions.some(
        (entry) => entry.id !== instance.id &&
          Math.abs(entry.x - posX) < OVERLAP_THRESHOLD &&
          Math.abs(entry.y - posY) < OVERLAP_THRESHOLD
      );
      if (!overlapping) break;
      posX += CASCADE_STEP_X;
      posY += CASCADE_STEP_Y;
      moved = true;
    }

    const existing = openWindowPositions.findIndex((e) => e.id === instance.id);
    if (existing !== -1) {
      openWindowPositions[existing] = { id: instance.id, x: posX, y: posY };
    } else {
      openWindowPositions.push({ id: instance.id, x: posX, y: posY });
    }

    if (moved) setPosition({ x: posX, y: posY });
    
    return () => {
      const idx = openWindowPositions.findIndex((e) => e.id === instance.id);
      if (idx !== -1) openWindowPositions.splice(idx, 1);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(isMobile);
  const [showClose, setShowClose] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized || isMobile) return;
    onFocus();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.startPosX + dx,
        y: dragRef.current.startPosY + dy
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const defaultWidth = isMusicApp ? '320px' : '820px';
  const defaultHeight = isMusicApp ? '420px' : '620px';

  const windowStyle: React.CSSProperties = isMaximized 
    ? { top: 0, left: 0, right: 0, bottom: '56px', zIndex: instance.zIndex }
    : { top: position.y, left: position.x, width: defaultWidth, height: defaultHeight, zIndex: instance.zIndex };

  if (instance.isMinimized) {
    windowStyle.display = 'none';
  }

  return (
    <div 
      className={`absolute pointer-events-auto flex flex-col rounded-xl overflow-hidden transition-shadow duration-300 ${
        isMusicApp ? 'bg-black shadow-2xl' : 'retro-window-border shadow-lg'
      } ${isDragging ? 'scale-[1.01]' : ''}`}
      style={windowStyle}
      onMouseDown={onFocus}
      onMouseEnter={() => isMusicApp && setShowClose(true)}
      onMouseLeave={() => isMusicApp && setShowClose(false)}
    >
      {/* Title Bar logic */}
      {!isMusicApp ? (
        <div 
          className="flex items-center justify-between px-3 py-2 bg-[#fdf2f8] border-b-4 border-purple-200 cursor-move select-none"
          onMouseDown={handleMouseDown}
          onDoubleClick={() => !isMobile && setIsMaximized(!isMaximized)}
        >
          <div className="flex items-center gap-2">
            <div className="scale-90 flex items-center justify-center text-purple-500">
              {instance.icon}
            </div>
            <span className="pixel-font text-lg font-bold text-purple-700 uppercase tracking-wider">{instance.title}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="p-1 hover:bg-purple-100 rounded text-purple-400">
              <Minus size={16} strokeWidth={3} />
            </button>
            {!isMobile && (
            <button onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }} className="p-1 hover:bg-purple-100 rounded text-purple-400">
              {isMaximized ? <Square size={14} strokeWidth={3} /> : <Maximize2 size={14} strokeWidth={3} />}
            </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-1 p-1 bg-pink-100 hover:bg-pink-500 hover:text-white rounded text-pink-500 border-2 border-pink-200">
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      ) : (
        /* Music App Special Handle (Transparent overlay drag zone) */
        <div 
          className="absolute top-0 left-0 right-0 h-10 z-50 cursor-move"
          onMouseDown={handleMouseDown}
        >
           {/* Floating Minimize & Close Buttons for Music App */}
           <div className={`absolute top-2 right-2 flex items-center gap-1.5 transition-all duration-200 ${showClose ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
             <button 
               onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
               className="p-1.5 bg-black/60 hover:bg-yellow-500 text-white rounded-full transition-colors duration-200"
             >
               <Minus size={16} strokeWidth={3} />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onClose(); }} 
               className="p-1.5 bg-black/60 hover:bg-red-500 text-white rounded-full transition-colors duration-200"
             >
               <X size={16} strokeWidth={3} />
             </button>
           </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default Window;
