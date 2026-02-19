
import React from 'react';
import { Gamepad, ExternalLink, Code, Layers } from 'lucide-react';
import { Project } from '../../types';

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Odyssey',
    description: 'A fast-paced synthwave bullet hell. Fight through neon-lit space corridors and defeat digital gods.',
    genre: 'Shoot \'em Up',
    thumbnail: 'https://picsum.photos/id/60/800/450',
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    tech: ['Unity', 'C#', 'Compute Shaders'],
    link: '#'
  },
  {
    id: '2',
    title: 'Echoes of Eon',
    description: 'An atmospheric puzzle platformer about a robot exploring the ruins of a botanical space station.',
    genre: 'Puzzle Platformer',
    thumbnail: 'https://picsum.photos/id/48/800/450',
    tech: ['Godot', 'GDScript', 'Aseprite'],
    link: '#'
  },
  {
    id: '3',
    title: 'Shadow Realm Tactics',
    description: 'Turn-based strategy game inspired by classic RPGs. Build your party and conquer the dark abyss.',
    genre: 'Strategy',
    thumbnail: 'https://picsum.photos/id/29/800/450',
    tech: ['Unreal Engine', 'C++', 'Blueprints'],
    link: '#'
  }
];

const ProjectApp: React.FC = () => {
  const handleMouseEnter = async (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    try {
      await video.play();
    } catch (err) {
      // AbortError is common when hovering quickly, we can safely ignore it
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <div className="p-6 h-full bg-[#fdf2f8]/50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad className="text-pink-500" size={32} />
          <h2 className="pixel-font text-4xl font-bold text-purple-900 uppercase tracking-tighter">My Creations</h2>
        </div>

        <div className="flex flex-col gap-10">
          {PROJECTS.map((proj) => (
            <div key={proj.id} className="group bg-white rounded-3xl border-4 border-purple-200 overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.01]">
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                {proj.videoUrl ? (
                  <video 
                    muted 
                    loop 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="w-full h-full object-cover"
                    poster={proj.thumbnail}
                  >
                    <source src={proj.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img src={proj.thumbnail} alt={proj.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 left-4 px-3 py-1 bg-purple-600 text-white pixel-font text-sm rounded-full">
                  {proj.genre}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-900 mb-1">{proj.title}</h3>
                    <div className="flex gap-2">
                      {proj.tech.map(t => (
                        <span key={t} className="text-[10px] font-bold px-2 py-0.5 bg-pink-50 text-pink-500 rounded border border-pink-100 uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all">
                    <ExternalLink size={20} />
                  </button>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                  {proj.description}
                </p>

                <div className="flex gap-4">
                  <button className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20">
                    <Code size={18} />
                    View Case Study
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

export default ProjectApp;
