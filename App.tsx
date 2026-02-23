
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Palette, 
  Music, 
  Gamepad2, 
  User,
  FileCode2,
  Image,
  Sparkles,
  Heart
} from 'lucide-react';
import DesktopIcon from './components/DesktopIcon';
import Window from './components/Window';
import Taskbar from './components/Taskbar';
import PaintApp from './components/apps/PaintApp';
import MusicApp from './components/apps/MusicApp';
import ProjectApp from './components/apps/ProjectApp';
import AboutApp from './components/apps/AboutApp';
import ResumeApp from './components/apps/ResumeApp';
import GalleryApp from './components/apps/GalleryApp';
import { AppId, WindowInstance } from './types';

const INITIAL_WINDOWS: WindowInstance[] = [
  { id: 'projects', title: 'Games', icon: <Gamepad2 size={18} />, isOpen: false, isMinimized: false, zIndex: 11 },
  { id: 'about', title: 'Profile', icon: <User size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  { id: 'resume', title: 'Resume', icon: <FileCode2 size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  { id: 'paint', title: 'Sketchbook', icon: <Palette size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  { id: 'music', title: 'Music', icon: <Music size={18} />, isOpen: true, isMinimized: false, zIndex: 10 },
  { id: 'gallery', title: 'Gallery', icon: <Image size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
];

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInstance[]>(INITIAL_WINDOWS);
  const [topZ, setTopZ] = useState(30);

  const openWindow = useCallback((id: AppId) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) return { ...w, isOpen: true, isMinimized: false, zIndex: topZ + 1 };
      return w;
    }));
    setTopZ(prev => prev + 1);
  }, [topZ]);

  const closeWindow = useCallback((id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  }, []);

  const focusWindow = useCallback((id: AppId) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) return { ...w, isMinimized: false, zIndex: topZ + 1 };
      return w;
    }));
    setTopZ(prev => prev + 1);
  }, [topZ]);

  const renderApp = (id: AppId) => {
    switch (id) {
      case 'paint': return <PaintApp />;
      case 'music': return <MusicApp />;
      case 'projects': return <ProjectApp />;
      case 'about': return <AboutApp onOpenWindow={openWindow} />;
      case 'resume': return <ResumeApp />;
      case 'gallery': return <GalleryApp />;
      default: return null;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#e2fdf5]">
      <div className="absolute inset-0 desktop-pattern z-0" />
      
      {/* 가로로 나열되는 아이콘들 */}
      <div className="relative z-10 p-8 flex flex-wrap gap-4 items-start content-start">
        <DesktopIcon icon={<Gamepad2 size={32} />} label="Games" onClick={() => openWindow('projects')} color="text-pink-500" />
        <DesktopIcon icon={<Image size={32} />} label="Gallery" onClick={() => openWindow('gallery')} color="text-emerald-500" />
        <DesktopIcon icon={<Palette size={32} />} label="Sketchbook" onClick={() => openWindow('paint')} color="text-orange-500" />
        <DesktopIcon icon={<Music size={32} />} label="Music" onClick={() => openWindow('music')} color="text-indigo-500" />
        <DesktopIcon icon={<User size={32} />} label="Profile" onClick={() => openWindow('about')} color="text-purple-500" />
        <DesktopIcon icon={<FileCode2 size={32} />} label="Resume" onClick={() => openWindow('resume')} color="text-blue-500" />
      </div>

      <div className="absolute inset-0 z-20 pointer-events-none">
        {windows.filter(w => w.isOpen).map((win) => (
          <Window 
            key={win.id} 
            instance={win} 
            onClose={() => closeWindow(win.id)} 
            onMinimize={() => minimizeWindow(win.id)} 
            onFocus={() => focusWindow(win.id)}
          >
            {renderApp(win.id)}
          </Window>
        ))}
      </div>

      <Taskbar windows={windows} onIconClick={focusWindow} onClose={closeWindow} />
    </div>
  );
};

export default App;
