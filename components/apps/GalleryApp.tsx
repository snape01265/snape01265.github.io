
import React from 'react';
import { Maximize2, ExternalLink } from 'lucide-react';

const PROJECTS = [
  { id: '1', title: 'Neon Nights', category: 'Photography', img: 'https://picsum.photos/id/101/400/300' },
  { id: '2', title: 'Minimal UI Kit', category: 'Design', img: 'https://picsum.photos/id/102/400/300' },
  { id: '3', title: 'Architecture Study', category: '3D Render', img: 'https://picsum.photos/id/103/400/300' },
  { id: '4', title: 'Nature Unbound', category: 'Motion', img: 'https://picsum.photos/id/104/400/300' },
  { id: '5', title: 'Abstract Flow', category: 'Art', img: 'https://picsum.photos/id/106/400/300' },
  { id: '6', title: 'Digital Portrait', category: 'Illustration', img: 'https://picsum.photos/id/107/400/300' },
];

const GalleryApp: React.FC = () => {
  return (
    <div className="p-8 h-full bg-slate-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Visual Showcase</h2>
          <p className="text-slate-400 text-lg">A curated selection of my creative explorations.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROJECTS.map(project => (
            <div key={project.id} className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/5 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10">
              <img src={project.img} alt={project.title} className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{project.category}</span>
                <h3 className="text-xl font-bold text-white mb-4">{project.title}</h3>
                
                <div className="flex gap-2">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-colors">
                    <Maximize2 size={18} />
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryApp;
