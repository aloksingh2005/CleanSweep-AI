import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ProcessedResult } from '../types';
import { Download, RefreshCcw, ArrowLeft, Check } from 'lucide-react';

interface ComparisonViewProps {
  result: ProcessedResult;
  onReset: () => void;
  onBack: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ result, onReset, onBack }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsResizing(true);
  
  const handleMouseUp = useCallback(() => setIsResizing(false), []);
  
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  }, [isResizing]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = result.processed;
    link.download = `cleansweep-edited-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> New Image
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Download className="w-4 h-4" /> Download Result
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div 
          ref={containerRef}
          className="relative w-full h-full max-w-5xl select-none"
        >
          {/* Processed Image (Background) */}
          <img 
            src={result.processed} 
            alt="Processed" 
            className="absolute top-0 left-0 w-full h-full object-contain"
          />

          {/* Original Image (Foreground, clipped) */}
          <div 
            className="absolute top-0 left-0 w-full h-full overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src={result.original} 
              alt="Original" 
              className="absolute top-0 left-0 w-full h-full object-contain" 
            />
            {/* Label */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wider">
              Original
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-indigo-600/90 backdrop-blur px-3 py-1 rounded text-xs font-bold text-white uppercase tracking-wider">
             Cleaned
          </div>

          {/* Slider Handle */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-slate-400"></div>
                <div className="w-0.5 h-3 bg-slate-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-500 text-sm">
        Drag slider to compare • High resolution preserved
      </p>
    </div>
  );
};