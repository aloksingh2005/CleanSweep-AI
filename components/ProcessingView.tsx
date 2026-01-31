import React from 'react';
import { Cpu } from 'lucide-react';

export const ProcessingView: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <Cpu className="w-16 h-16 text-emerald-500 animate-bounce relative z-10" />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-white">Calculating Inpaint...</h2>
      <p className="mt-2 text-slate-400 text-center max-w-md">
        Running Fast Marching Method (Telea algorithm). <br/>
        Analysing neighborhood pixels and propagating texture mathematically.
      </p>
      
      <div className="mt-8 flex flex-col gap-2 w-64">
        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_1s_ease-in-out_infinite] w-1/3"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};