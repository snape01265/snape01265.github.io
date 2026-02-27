
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { PostIt } from '../types';

interface PostItNoteProps {
  postIt: PostIt;
  onDelete: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

const PostItNote: React.FC<PostItNoteProps> = ({ postIt, onDelete, onMove }) => {
  const [position, setPosition] = useState({ x: postIt.x, y: postIt.y });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy,
    });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragRef.current = null;
    onMove(postIt.id, position.x, position.y);
  };

  useEffect(() => {
    setPosition({ x: postIt.x, y: postIt.y });
  }, [postIt.x, postIt.y]);

  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing select-none pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: `rotate(${postIt.rotation}deg)`,
        zIndex: 5,
        touchAction: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-[240px] h-[240px] bg-yellow-100 rounded-sm shadow-lg border border-yellow-200/60 p-1.5 transition-shadow hover:shadow-xl">
        <img
          src={postIt.imageDataUrl}
          alt="Post-it sketch"
          className="w-full h-full object-cover rounded-sm pointer-events-none"
          draggable={false}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(postIt.id);
          }}
          className={`absolute -top-2 -right-2 p-0.5 bg-red-400 hover:bg-red-500 text-white rounded-full shadow-md transition-all duration-150 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default PostItNote;

