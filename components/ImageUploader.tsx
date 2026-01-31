import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, FileWarning } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size exceeds 10MB limit.');
      return;
    }
    setError(null);
    onUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndUpload(file);
    }
  }, [onUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          Remove Anything, Instantly.
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Upload an image to magically remove unwanted objects, text, or defects using advanced generative AI. 
          Professional quality, zero artifacts.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-2xl aspect-[16/9] md:aspect-[21/9] rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
          }
        `}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center p-8">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform duration-300
            ${isDragging ? 'bg-indigo-500 scale-110' : 'bg-slate-700'}
          `}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Drag & Drop or Click to Upload
          </h3>
          <p className="text-slate-500 text-sm">
            Supports JPG, PNG, WEBP (Max 10MB)
          </p>
          
          {error && (
            <div className="mt-4 flex items-center gap-2 text-rose-400 bg-rose-400/10 px-4 py-2 rounded-lg">
              <FileWarning className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </label>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
        {[
          { title: 'Text Removal', desc: 'Auto-detect and erase watermarks & captions', icon: '📝' },
          { title: 'Object Eraser', desc: 'Brush over unwanted people or items', icon: '🧹' },
          { title: 'Lossless Quality', desc: 'Preserves original resolution & details', icon: '✨' }
        ].map((feature, i) => (
          <div key={i} className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
            <div className="text-2xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-slate-200 mb-1">{feature.title}</h3>
            <p className="text-sm text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};