import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Eraser, Download, Trash2, StickyNote } from 'lucide-react';

const COLORS = ['#ef4444', '#fbcfe8', '#e9d5ff', '#22c55e', '#06b6d4', '#3b82f6', '#9d8dbd', '#f472b6', '#ffffff', '#000000'];

interface PaintAppProps {
  onCreatePostIt?: (dataUrl: string) => void;
}

const PaintApp: React.FC<PaintAppProps> = ({ onCreatePostIt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#9d8dbd');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);
    };

    resizeCanvas();

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e) ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = ('clientY' in e) ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e) ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = ('clientY' in e) ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'masterpiece.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex items-center gap-4 p-3 bg-white border-b-2 border-purple-100">
        <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-xl border border-purple-100">
          <button 
            onClick={() => setTool('brush')}
            className={`p-2 rounded-lg transition-all ${tool === 'brush' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-purple-400'}`}
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-purple-400'}`}
          >
            <Eraser size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 border-r border-purple-100">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool('brush'); }}
              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 ${color === c ? 'border-purple-600 scale-125' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="range" min="1" max="50" value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 accent-purple-500 h-1"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={clearCanvas} className="p-2 text-pink-400 hover:bg-pink-50 rounded-lg transition-all">
            <Trash2 size={18} />
          </button>
          <button onClick={downloadImage} className="p-2 text-purple-400 hover:bg-purple-50 rounded-lg transition-all">
            <Download size={18} />
          </button>
          {onCreatePostIt && (
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const { data, width, height } = imageData;

                let minX = width, minY = height, maxX = 0, maxY = 0;
                let hasContent = false;

                for (let y = 0; y < height; y++) {
                  for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;
                    if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
                      hasContent = true;
                      if (x < minX) minX = x;
                      if (x > maxX) maxX = x;
                      if (y < minY) minY = y;
                      if (y > maxY) maxY = y;
                    }
                  }
                }

                if (!hasContent) return;

                const PADDING = 5;
                const contentW = maxX - minX + 1;
                const contentH = maxY - minY + 1;
                const side = Math.max(contentW, contentH) + PADDING * 2;

                const cropCanvas = document.createElement('canvas');
                cropCanvas.width = side;
                cropCanvas.height = side;
                const cropCtx = cropCanvas.getContext('2d');
                if (!cropCtx) return;

                cropCtx.fillStyle = '#ffffff';
                cropCtx.fillRect(0, 0, side, side);

                const offsetX = (side - contentW) / 2;
                const offsetY = (side - contentH) / 2;
                cropCtx.drawImage(
                  canvas,
                  minX, minY, contentW, contentH,
                  offsetX, offsetY, contentW, contentH
                );

                onCreatePostIt(cropCanvas.toDataURL('image/jpeg', 0.7));
              }}
              className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all"
              title="Create Post-it"
            >
              <StickyNote size={18} />
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-white cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
};

export default PaintApp;