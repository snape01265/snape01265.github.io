
import React, { useState } from 'react';
import { Gamepad, ExternalLink, ArrowLeft, Users, Calendar, Wrench, ChevronRight } from 'lucide-react';
import { Project } from '../../types';

const PROJECTS: Project[] = [
  {
    id: 'soul-after',
    title: 'Soul After',
    description: 'A story-driven top-down adventure game that explores the relationship between life and death. Developed as a passion project by a team of 6 students, marking our debut in game development.',
    genre: 'Adventure / Story / Top Down 2D',
    thumbnail: '/games/soul-after/thumbnail.png',
    tech: ['Unity', 'C#', 'Git'],
    link: 'https://store.steampowered.com/app/2148220/Soul_After/',
    duration: 'Aug 2021 - Aug 2022',
    teamSize: 6,
    roles: ['Game Design', 'General Programming', 'Level & System Design'],
    caseStudy: [
      {
        heading: '',
        body: 'While working on Soul After, I was responsible for implementing additional gameplay mechanics and core systems like movement, camera, and interaction. With the help of Dialogue System, I have created a system that tracks player progression through the story. Cutscenes for the game was implemented by combining Timeline and Custom Events for timelines.',
      },
      {
        heading: 'Features',
        body: '',
        bullets: [
          'Movement',
          'Camera',
          'Progression System (We called it Quest System)',
          'Cutscenes',
          'NPC Interaction',
          'NPC Behaviour',
          'Rhythm Game',
          'Chasing Sequence Gameplay & Level Design',
          'Sokoban Gameplay & Puzzle Design',
          'Dungeon Traps, Enemies, Gimmicks',
          'Boss AI & Gimmicks',
          'Additional FX/Post Processing',
          'Level Transition',
          'Settings/Main Menu/UI Behaviour',
        ],
      },
      {
        heading: 'Takeaways',
        body: 'I would not say I have learned a whole lot about programming from this project. It was all entry level knowledge about game development and programming, like movement, camera, interactions, and vector math. Overall, this project helped me understand Unity and C# better over anything else. This introductory project showed me what game development is like and how to work with a team. Also, it was a great learning experience for me to understand what it takes to ship a game from start to finish, and made me realize how much I am lacking in the technical side of things.',
      },
      {
        heading: 'Interesting Probelms',
        body: 'Hmm... Literally everything was a new challenge for me as I had 0 programming knowledge at the time. Even connecting the IDE to the project was a challenge for me. So, I would say there were no technical challenges, but more like a learning experience. Creating progression system and customizing Dialogue System was a bit challenging though😭',
      },
    ],
  },
];

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-3xl border-4 border-purple-200 overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer"
    >
      <div className="aspect-video relative overflow-hidden bg-slate-100">
        {project.videoUrl ? (
          <video
            muted
            loop
            className="w-full h-full object-cover"
            poster={project.thumbnail}
          >
            <source src={project.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-4 text-white/90 text-sm font-semibold" style={{ fontFamily: 'system-ui, sans-serif' }}>
            {project.teamSize && (
              <span className="flex items-center gap-1.5"><Users size={16} /> {project.teamSize}</span>
            )}
            {project.duration && (
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {project.duration}</span>
            )}
            {project.tech.length > 0 && (
              <span className="flex items-center gap-1.5"><Wrench size={16} /> {project.tech.join(', ')}</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="pixel-font text-2xl font-bold text-purple-900 uppercase tracking-tight group-hover:text-purple-600 transition-colors">
              {project.title}
            </h3>
            {project.roles && (
              <p className="text-sm font-bold text-purple-400">{project.roles.join(' / ')}</p>
            )}
          </div>
          <ChevronRight size={24} className="text-purple-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0" />
        </div>
        <p className="text-gray-500 leading-relaxed font-medium text-sm mt-2">
          {project.description}
        </p>
      </div>
    </button>
  );
};

interface CaseStudyViewProps {
  project: Project;
  onBack: () => void;
}

const CaseStudyView: React.FC<CaseStudyViewProps> = ({ project, onBack }) => {
  return (
    <div className="h-full bg-white overflow-y-auto relative">
      <button
        onClick={onBack}
        className="sticky top-4 left-4 z-10 ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-purple-700 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-md"
      >
        <ArrowLeft size={16} />
        Go Back
      </button>
      <div className="relative aspect-[3/1] overflow-hidden bg-slate-100 -mt-10">
        <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-6 right-6">
          <h1 className="pixel-font text-6xl font-medium text-white uppercase tracking-tight drop-shadow-lg">{project.title}</h1>
        </div>
      </div>

      <div className="mx-auto px-8 py-8" style={{ maxWidth: '90%' }}>
        <div className="grid grid-cols-[1fr_auto] gap-8 mb-10">
          <div>
            <h3 className="pixel-font text-3xl font-bold text-purple-900 uppercase mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed">{project.description}</p>
          </div>

          <div className="bg-purple-50 rounded-2xl border-2 border-purple-100 p-5 min-w-[200px]">
            <h3 className="pixel-font text-3xl font-bold text-purple-900 uppercase mb-4">Project Info</h3>
            <div className="flex flex-col gap-3 text-sm">
              {project.roles && (
                <div className="flex items-start gap-2">
                  <Wrench size={14} className="text-purple-400 mt-0.5 shrink-0" />
                  <span className="text-purple-700">{project.roles.join(', ')}</span>
                </div>
              )}
              {project.teamSize && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-purple-400 shrink-0" />
                  <span className="text-purple-700">Team of {project.teamSize}</span>
                </div>
              )}
              {project.duration && (
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-400 shrink-0" />
                  <span className="text-purple-700">{project.duration}</span>
                </div>
              )}
              {project.tech.length > 0 && (
                <div className="flex items-start gap-2">
                  <Wrench size={14} className="text-purple-400 mt-0.5 shrink-0" />
                  <span className="text-purple-700">{project.tech.join(', ')}</span>
                </div>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-500 hover:text-indigo-700 transition-colors mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} className="shrink-0" />
                  Steam Page
                </a>
              )}
            </div>
          </div>
        </div>

        {project.caseStudy && project.caseStudy.map((section, i) => (
          <section key={i} className="mb-10">
            <h3 className="pixel-font text-3xl font-bold text-purple-900 border-b-2 border-purple-100 pb-1 mb-4 uppercase">
              {section.heading}
            </h3>

            {section.body && (
              <p className="text-gray-600 leading-relaxed font-medium mb-4">{section.body}</p>
            )}

            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-600 font-medium mb-4 ml-2">
                {section.bullets.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}

            {section.images && section.images.length > 0 && (
              <div className={`grid gap-4 mb-4 ${section.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {section.images.map((img, j) => (
                  <figure key={j} className="rounded-xl overflow-hidden border-2 border-purple-100">
                    <img src={img.src} alt={img.caption || ''} className="w-full h-auto object-cover" />
                    {img.caption && (
                      <figcaption className="px-3 py-2 text-xs text-gray-400 italic font-medium bg-purple-50/50">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {section.links && section.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {section.links.map((link, j) => (
                  <a
                    key={j}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 font-bold text-sm underline underline-offset-2 transition-colors"
                  >
                    <ExternalLink size={14} />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

const PROJECT_FONT: React.CSSProperties = {
  fontFamily: "'Coming Soon', cursive",
  WebkitTextStroke: '0.3px currentColor',
};

const ProjectApp: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (selectedProject) {
    return (
      <div style={PROJECT_FONT} className="h-full">
        <CaseStudyView project={selectedProject} onBack={() => setSelectedProject(null)} />
      </div>
    );
  }

  return (
    <div style={PROJECT_FONT} className="p-6 h-full bg-[#fdf2f8]/50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Gamepad className="text-pink-500" size={32} />
          <h2 className="pixel-font text-4xl font-bold text-purple-900 uppercase tracking-tighter">My Creations</h2>
        </div>
        <div className="flex flex-col gap-10">
          {PROJECTS.map((proj) => (
            <ProjectCard key={proj.id} project={proj} onClick={() => setSelectedProject(proj)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectApp;
