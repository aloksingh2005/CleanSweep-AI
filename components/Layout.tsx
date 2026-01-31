import React from 'react';
import { Eraser, Zap, Github } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Eraser className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              CleanSweep AI
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-indigo-400 transition-colors">Features</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Docs</a>
            </nav>
            <div className="h-6 w-px bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-3">
               <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">v1.0.0-beta</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        {children}
      </main>
    </div>
  );
};