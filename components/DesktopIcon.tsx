import React from 'react';

interface DesktopIconProps {
  icon: React.ReactNode;
  customIcon?: string;
  label: string;
  onClick: () => void;
  color: string;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, customIcon, label, onClick, color }) => {
  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-center gap-1 p-2 transition-all w-24"
    >
      <div className={`relative p-4 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-white group-hover:border-purple-300 group-hover:bg-white shadow-sm transition-all group-hover:-translate-y-1 ${color}`}>
        {customIcon ? (
          <img src={customIcon} alt={label} className="w-8 h-8 object-cover rounded-md" />
        ) : (
          icon
        )}
      </div>
      <span className="pixel-font text-lg font-bold text-purple-900 group-hover:text-purple-600 drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;