
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
import { AppId, WindowInstance, PostIt } from './types';
import PostItNote from './components/PostItNote';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const INITIAL_WINDOWS: WindowInstance[] = [
  { id: 'projects', title: 'Games', icon: <Gamepad2 size={18} />, isOpen: false, isMinimized: false, zIndex: 11 },
  { id: 'about', title: 'Profile', icon: <User size={18} />, isOpen: true, isMinimized: false, zIndex: 12 },
  { id: 'resume', title: 'Resume', icon: <FileCode2 size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  { id: 'paint', title: 'Sketchbook', icon: <Palette size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  { id: 'music', title: 'Music', icon: <Music size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
  { id: 'gallery', title: 'Gallery', icon: <Image size={18} />, isOpen: false, isMinimized: false, zIndex: 10 },
];

const POSTIT_STORAGE_KEY = 'desktop-postits';

const DEFAULT_SUN_POSTIT: PostIt = {
  id: 'default-sun',
  imageDataUrl: '/background/default-postit.png',
  x: 30,
  y: 300,
  rotation: -3,
};

const SUN_DISMISSED_KEY = 'postit-sun-dismissed';

const loadPostIts = (): PostIt[] => {
  let postIts: PostIt[] = [];
  try {
    const stored = localStorage.getItem(POSTIT_STORAGE_KEY);
    if (stored) postIts = JSON.parse(stored);
  } catch { /* ignore */ }

  const hasSun = postIts.some(p => p.id === 'default-sun');
  const isEmpty = postIts.length === 0;
  const sunDismissed = localStorage.getItem(SUN_DISMISSED_KEY) === 'true';

  if (!hasSun && (isEmpty || !sunDismissed)) {
    postIts = [{ ...DEFAULT_SUN_POSTIT }, ...postIts];
  }

  if (isEmpty) {
    localStorage.removeItem(SUN_DISMISSED_KEY);
  }

  return postIts;
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInstance[]>(INITIAL_WINDOWS);
  const [topZ, setTopZ] = useState(30);
  const [postIts, setPostIts] = useState<PostIt[]>(loadPostIts);

  useEffect(() => {
    localStorage.setItem(POSTIT_STORAGE_KEY, JSON.stringify(postIts));
  }, [postIts]);

  const addPostIt = useCallback((imageDataUrl: string) => {
    const x = 100 + Math.random() * (window.innerWidth - 300);
    const y = 150 + Math.random() * (window.innerHeight - 400);
    const newPostIt: PostIt = {
      id: Date.now().toString(),
      imageDataUrl,
      x: Math.max(20, Math.min(x, window.innerWidth - 140)),
      y: Math.max(80, Math.min(y, window.innerHeight - 200)),
      rotation: (Math.random() - 0.5) * 12,
    };
    setPostIts(prev => [...prev, newPostIt]);
  }, []);

  const removePostIt = useCallback((id: string) => {
    if (id === 'default-sun') {
      localStorage.setItem(SUN_DISMISSED_KEY, 'true');
    }
    setPostIts(prev => prev.filter(p => p.id !== id));
  }, []);

  const movePostIt = useCallback((id: string, x: number, y: number) => {
    setPostIts(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  }, []);

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
      case 'paint': return <PaintApp onCreatePostIt={addPostIt} />;
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

      {/* Post-it notes on the desktop */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        {postIts.map(p => (
          <PostItNote key={p.id} postIt={p} onDelete={removePostIt} onMove={movePostIt} />
        ))}
      </div>

      {/* 가로로 나열되는 아이콘들 */}
      <div className="relative z-10 p-8 flex flex-wrap gap-4 items-start content-start pointer-events-none">
        <DesktopIcon icon={<Gamepad2 size={32} />} label="Games" onClick={() => openWindow('projects')} color="text-pink-500" />
        <DesktopIcon icon={<Image size={32} />} label="Gallery" onClick={() => openWindow('gallery')} color="text-emerald-500" />
        <DesktopIcon icon={<Music size={32} />} label="Music" onClick={() => openWindow('music')} color="text-indigo-500" />
        <DesktopIcon icon={<User size={32} />} label="Profile" onClick={() => openWindow('about')} color="text-purple-500" />
        <DesktopIcon icon={<FileCode2 size={32} />} label="Resume" onClick={() => openWindow('resume')} color="text-blue-500" />
        <DesktopIcon icon={<Palette size={32} />} label="Sketchbook" onClick={() => openWindow('paint')} color="text-orange-500" />
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

      <div className="absolute bottom-16 left-0 right-0 z-0 text-center">
        <span className="text-purple-400/50 text-xs font-medium">Last Updated: Feb 27, 2026</span>
      </div>

      <Taskbar windows={windows} onIconClick={focusWindow} onClose={closeWindow} />
      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
