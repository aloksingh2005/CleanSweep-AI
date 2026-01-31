import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppMode, BrushSettings } from '../types';
import { Brush, Eraser, Type, MousePointer, Undo, Trash2, ArrowRight, AlertCircle, Wand2, Zap } from 'lucide-react';
import { drawImageScaled, getMaskDataUrl } from '../utils/canvasUtils';

interface EditorProps {
  imageSrc: string;
  onProcess: (mode: AppMode, maskData?: string, promptOverride?: string) => void;
  error: string | null;
}

export const Editor: React.FC<EditorProps> = ({ imageSrc, onProcess, error }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<AppMode>(AppMode.OBJECT_REMOVAL);
  const [brush, setBrush] = useState<BrushSettings>({ size: 40, hardness: 0.8, opacity: 1.0 }); // High opacity for binary mask
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  // Initialize Canvas
  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!containerRef.current || !canvasRef.current || !maskCanvasRef.current) return;

      const container = containerRef.current;
      const aspect = img.width / img.height;
      
      // Fit to container
      let drawWidth = container.clientWidth;
      let drawHeight = drawWidth / aspect;

      if (drawHeight > container.clientHeight) {
        drawHeight = container.clientHeight;
        drawWidth = drawHeight * aspect;
      }

      setImageDimensions({ width: drawWidth, height: drawHeight });
      setScale(img.width / drawWidth); // Ratio to map canvas coords back to original image

      // Set canvas sizes
      [canvasRef.current, maskCanvasRef.current].forEach(canvas => {
        canvas.width = drawWidth;
        canvas.height = drawHeight;
      });

      // Draw Image
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, drawWidth, drawHeight);
        ctx.drawImage(img, 0, 0, drawWidth, drawHeight);
      }
    };
  }, [imageSrc]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!maskCanvasRef.current) return { x: 0, y: 0 };
    const rect = maskCanvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    draw(x, y);
  };

  const draw = (x: number, y: number) => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brush.size;
    ctx.strokeStyle = `rgba(255, 0, 0, 1)`; // Solid red for OpenCV mask
    ctx.globalCompositeOperation = 'source-over';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasMask(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      ctx?.beginPath(); // Reset path
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    draw(x, y);
  };

  const clearMask = () => {
    if (!maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext('2d');
    ctx?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    setHasMask(false);
  };

  const handleProcessClick = () => {
    if (!canvasRef.current || !maskCanvasRef.current) return;
    // We send the mask directly
    const maskUrl = getMaskDataUrl(canvasRef.current, maskCanvasRef.current);
    onProcess(mode, maskUrl);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      {/* Toolbar */}
      <div className="w-full md:w-80 flex-shrink-0 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col gap-8 shadow-xl">
        
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-400" />
            Tool Settings
          </h2>
          
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-6">
             <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
               <Zap className="w-4 h-4" /> Offline Mode
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               Using <strong className="text-slate-300">OpenCV Algorithm</strong> (Telea). 
               Zero AI hallucination. 100% pixel preservation outside the mask. 
               Best for small defects and scratches.
             </p>
          </div>

          <div className="animate-fade-in">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Brush Size</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2 text-slate-300">
                  <span>{brush.size}px</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={brush.size}
                  onChange={(e) => setBrush({...brush, size: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={clearMask}
                  disabled={!hasMask}
                  className="flex-1 py-2 px-4 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear Mask
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <button
            onClick={handleProcessClick}
            disabled={!hasMask || !!error}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all
              ${!hasMask || !!error
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white hover:shadow-emerald-500/25'
              }
            `}
          >
            Run Inpaint <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"
        style={{
             backgroundImage: `radial-gradient(#334155 1px, transparent 1px)`,
             backgroundSize: '20px 20px'
        }}
      >
        <div className="relative shadow-2xl rounded-lg overflow-hidden">
          <canvas 
            ref={canvasRef}
            className="block max-w-full max-h-full"
          />
          <canvas 
            ref={maskCanvasRef}
            className="absolute top-0 left-0 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={handleMouseMove}
            onTouchEnd={stopDrawing}
          />
        </div>
        
        {/* Helper overlay */}
        {!hasMask && (
           <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium border border-slate-700 pointer-events-none animate-bounce">
             Paint over the object/text to remove
           </div>
        )}
      </div>
    </div>
  );
};