import React from 'react';
import { Sparkles, BowArrow, Users, Layers, Workflow, MessageSquareHeart, Gamepad2, FileCode2, Image } from 'lucide-react';
import { AppId } from '../../types';

interface AboutAppProps {
  onOpenWindow: (id: AppId) => void;
}

const AboutApp: React.FC<AboutAppProps> = ({ onOpenWindow }) => {
  return (
    <div className="h-full bg-white p-8 pb-20 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-32 h-32 rounded-full border-4 border-purple-200 p-1 mb-4">
            <img 
              src="/profile/profile.JPG" 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          <h1 className="pixel-font text-4xl font-bold text-purple-900 mb-1 uppercase">Client Programmer</h1>
          <p className="text-gray-500 font-medium mt-1">I'm Sun, a team-oriented programmer who sets the stage for compelling gameplay and memorable storytelling experiences, focused on writing clean, efficient code.</p>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="pixel-font text-2xl font-bold text-purple-900 border-b-2 border-purple-100 mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              All My Life
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Hello! If you have stumbled onto this page, I figure I owe you a proper introduction. 
            </p>
            <p className="text-gray-600 leading-relaxed font-medium mt-3">
              I'm Sun and as the title above suggests, I make games for a living. 
              I grew up playing just about everything — RPGs, platformers, strategy, party, shooters, etc — if it had a start screen, I was there. 
              Somewhere along the way, I think I stopped seeing games as just entertainment and started appreciating them for what they really are: a unique 
              blend of storytelling, visuals, music, and interactivity that no other medium can pull off quite the same way.
            </p>
            <p className="text-center text-purple-900 leading-relaxed font-bold mt-3">
              Naturally, I wanted in on that.
            </p>
            <p className="text-gray-600 leading-relaxed font-medium mt-3">
              Now, with a few years of professional experience under my belt working across gameplay, tools, UI, animation, and other aspects, 
              I've put this website together to show what I've been up to — and to see where the road takes me next. 
              But enough boring you with my backstory, feel free to poke around!
            </p>
            <div className="flex items-center justify-center gap-6 mt-5">
              <button
                onClick={() => onOpenWindow('resume')}
                className="flex items-center gap-1.5 text-purple-500 hover:text-purple-700 font-bold text-sm transition-colors underline underline-offset-2"
              >
                <FileCode2 size={14} />
                Resume
              </button>
              <button
                onClick={() => onOpenWindow('projects')}
                className="flex items-center gap-1.5 text-pink-500 hover:text-pink-700 font-bold text-sm transition-colors underline underline-offset-2"
              >
                <Gamepad2 size={14} />
                Games
              </button>
              <button
                onClick={() => onOpenWindow('gallery')}
                className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 font-bold text-sm transition-colors underline underline-offset-2"
              >
                <Image size={14} />
                Gallery
              </button>
            </div>
          </section>

          <section>
            <h3 className="pixel-font text-2xl font-bold text-purple-900 border-b-2 border-purple-100 mb-4 flex items-center gap-2">
              <MessageSquareHeart size={18} className="text-pink-500" />
              Somewhere I Belong
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center">
                <h4 className="font-bold text-purple-900 mb-1 text-lg">I'm a team player</h4>
                <p className="text-gray-500 text-m leading-relaxed">
                  Experienced working alongside designers, artists, and other programmers 
                  in teams scaling up to 30 members. I enjoy other's company and working together.
                  It naturally pushes me to be a better person and helps me stay busy. 
                  Great ideas come from casual conversations afterall!
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <h4 className="font-bold text-purple-900 mb-1 text-lg">I enjoy learning new concepts</h4>
                <p className="text-gray-500 text-m leading-relaxed">
                  While I hone my skills as a programmer, I'm always looking for opportunities to learn.
                  I thrive when I tackle difficult challenges and learn best when I'm pushed out of my comfort zone. 
                  Client Programming is my strong suit, but I am not afraid to try my hand at other things if the situation calls for it.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <h4 className="font-bold text-purple-900 mb-1 text-lg">Proactive, inquisitive spirit</h4>
                <p className="text-gray-500 text-m leading-relaxed">
                  I like to understand the logic and reasoning behind everything.
                  If I create a tool, it is because I notice a problem that needs to be addressed.
                  If I go for a walk with coworkers, I want to listen to their opinions.
                  If I believe a feature needs to be added to our game, I will try to explain and convince my team.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="pixel-font text-2xl font-bold text-purple-900 border-b-2 border-purple-100 mb-3 flex items-center gap-2">
              <BowArrow size={18} className="text-blue-500" />
              Weapon of Choice
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                Unity
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                C#
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                C++
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                Python
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                SVN
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                Git
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold border border-slate-200">
                Jenkins
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;