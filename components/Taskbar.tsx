
import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { AppId, WindowInstance } from '../types';

interface TaskbarProps {
  windows: WindowInstance[];
  onIconClick: (id: AppId) => void;
  onClose: (id: AppId) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({ windows, onIconClick, onClose }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-t-4 border-purple-100 flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-2 h-full py-2">
        <div className="flex items-center gap-1 ml-2">
          {windows.filter(w => w.isOpen).map(win => (
            <div key={win.id} className="relative group">
              <button
                onClick={() => onIconClick(win.id)}
                className={`flex items-center gap-2 px-3 h-10 rounded-lg transition-all ${
                  win.isMinimized 
                    ? 'bg-transparent text-purple-300' 
                    : 'bg-purple-50 border-2 border-purple-100 text-purple-700 shadow-sm'
                } hover:bg-purple-100 pr-9`} // 버튼 공간 확보를 위해 패딩 소폭 증가
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {win.customIcon ? (
                    <img src={win.customIcon} alt="" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    win.icon
                  )}
                </div>
                <span className="pixel-font font-bold uppercase text-sm hidden md:block tracking-tight">{win.title}</span>
              </button>
              
              {/* Taskbar Close Button - Always Visible, Red fill on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(win.id);
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-red-50 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-200 z-10 border border-red-100"
                title="Close Window"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center px-4 py-2 bg-purple-50 rounded-xl border-2 border-purple-100">
        <div className="flex items-center gap-2 text-purple-400">
           <Clock size={16} />
           <span className="pixel-font text-lg font-bold">
             {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
           </span>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
