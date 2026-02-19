import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

const AboutApp: React.FC = () => {
  return (
    <div className="h-full bg-white p-8 overflow-y-auto">
      <div className="max-w-xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-32 h-32 rounded-full border-4 border-purple-200 p-1 mb-4">
            <img 
              src="/profile/test.png" 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          <h1 className="pixel-font text-4xl font-bold text-purple-900 mb-1 uppercase">Dev Wanderer</h1>
          <p className="text-pink-500 font-bold uppercase tracking-widest text-xs">Level 99 Game Architect</p>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="pixel-font text-2xl font-bold text-purple-900 border-b-2 border-purple-100 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              The Journey
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Hello! I'm a game developer who loves building worlds where players can lose themselves. 
              I specialize in gameplay programming and creative technical solutions. My goal is to craft 
              experiences that stick with people, much like the games that shaped my childhood.
            </p>
          </section>

          <section>
            <h3 className="pixel-font text-2xl font-bold text-purple-900 border-b-2 border-purple-100 mb-3 flex items-center gap-2">
              <MessageCircle size={18} className="text-blue-500" />
              Party Chat
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Unity', 'Unreal', 'C#', 'C++', 'Shaders', 'React', 'Pixel Art'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                  #{skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-dashed border-purple-200 text-center">
          <p className="handwritten text-2xl text-purple-400">"Let's make something magical together."</p>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;