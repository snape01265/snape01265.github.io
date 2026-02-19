
import React from 'react';
import { Settings, Info, Heart } from 'lucide-react';

const SettingsApp: React.FC = () => {
  return (
    <div className="h-full bg-slate-50 p-10 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-indigo-600/10 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-6 border-4 border-indigo-600/5">
        <Settings size={40} />
      </div>
      <h2 className="pixel-font text-3xl font-bold uppercase text-slate-900 mb-2">DreamOS Configuration</h2>
      <p className="text-slate-500 max-w-sm font-medium mb-8 italic">
        "Customizing your digital universe, one pixel at a time."
      </p>
      
      <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm max-w-md w-full">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 bg-pink-100 text-pink-500 rounded-2xl">
            <Heart size={24} />
          </div>
          <div>
            <h4 className="font-black uppercase text-xs tracking-widest text-slate-400">System Core</h4>
            <p className="font-bold text-slate-800">React v19.0.0 Stable</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
        <Info size={14} />
        Version 2.4.0 Alpha Build
      </div>
    </div>
  );
};

export default SettingsApp;
