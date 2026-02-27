
import React, { useState } from 'react';
import { Gamepad, ExternalLink, ArrowLeft, Users, Calendar, Wrench, ChevronRight, Monitor, Briefcase } from 'lucide-react';
import { Project } from '../../types';

const PROJECTS: Project[] = [
  {
    id: 'my-little-puppy',
    title: 'My Little Puppy',
    description: 'A heartwarming adventure game about a dog\'s journey through the afterlife to reunite with his owner. Developed at Dreamotion Inc. by a team scaling up to 30 members, this project marked my entry into the professional game industry.',
    genre: 'Singleplayer / Adventure / 3D Platformer',
    thumbnail: '/games/my-little-puppy/thumbnail.jpg',
    tech: ['Unity', 'C#', 'SVN', 'Jenkins'],
    link: 'https://store.steampowered.com/app/2102040/My_Little_Puppy/',
    duration: 'May 2023 - Nov 2025',
    teamSize: 30,
    teamSizeLabel: '30+',
    roles: ['General Programming'],
    platforms: ['PC', 'Nintendo Switch', 'PS5', 'LG TV'],
    caseStudy: [
      {
        heading: '',
        body: 'Participating in the development and experiencing the full cycle of a game project until its release was humbling. Also, trying a 3D platformer gave me new insights as well as tough challenges in programming that I enjoyed solving. Eventhough I had experience working with a small group of friends, a team of 30 people was a completely different experience.',
      },
      {
        heading: 'My Role',
        body: 'As a Junior Programmer, I collaborated with a cross-functional team of designers, artists, and other programmers to design, prototype, and implement gameplay mechanics, systems, and tools. Developed clean, maintainable and readable C# code within an Agile environment, consistently meeting design specifications and project milestones.'
      },
      {
        heading: 'Gameplay Mechanics',
        body: 'Responsibilities include:',
        bullets: [
            'Complete additional gameplay implementation tasks',
            'Collaborate with others to implement 3Cs, specifically tuned for a \'dog-like\' feel',
            'Collaborate with others to implement core system mechanics',
            'Implement event system that would be utilized throughout the entire game',
            'Implement in-game and out-game UI with art and design departments for gameplay systems and menu',
            'Implement cross-platform input manager',
            'Collaborate with outsource sound designers to implement audio solutions',
            'A lot of refactoring, debugging, and polishing'
        ]
      },
      {
        heading: 'Tools',
        body: 'Due to project requirements and personal preference of our CTO, most of the tools and systems for our game was built from scratch. While many advanced tools like Light Baker, Terrain Editor, and Custom Animator were done by our CTO, I still had some foothold in the development of many tools and systems that would be used throughout the entire development period.',
        bullets: [
            'General gameplay editor tools',
            'Built core system editor tools',
            'Built visual scripting tool for the core event system',
            'Art asset management/search tool',
        ],
      },
      {
        heading: 'Interesting Problems',
        subsections: [
          {
            title: 'Barista System',
            body: 'Early in the project, every narrative sequence was hard-coded, including repetitive tasks like triggering animations at certain timings. But as the project progressed, we realized that these tasks were becoming bottlenecks for the sequences that the designers had envisioned.',
          },
          {
            title: '',
            body: 'Instead of programmers trying to figure out the details for that scene\'s narrative sequences, I built a system and an editor tool that gave designers (and everybody else) the authority to author events themselves. This drastically sped up our pipeline, enabling all members to test and iterate on multiple ideas without waiting on a programmer.',
          },
          {
            title: '',
            body: 'What started as a simple tool for narrative sequences quickly scaled into the backbone of our game\'s logic. We expanded Barista for use in cutscenes, trigger events, checkpoint progression, and more. Ultimately, it became an essential framework that powered nearly every scripted event in MLP, streamlining our entire development pipeline.',
            videos: [{ src: '/games/my-little-puppy/video01.mp4' }],
          },
          {
            title: 'Cross-Platform Input System',
            body: 'To support our release across PC, PS5, and Nintendo Switch, I built an abstraction layer over Unity\'s Input System.',
          },
          {
            title: '',
            body: 'The "OmniInput" system handles seamless device switching and key/pad remapping. It features a dynamic sprite mapper that automatically translates raw inputs into platform-specific key sprites. This ensured console compliance and allowed designers to write text in Baristas without worrying about the active hardware. All the UIs (in-game, menu, settings, etc...) would be affected by this system.',
            videos: [{ src: '/games/my-little-puppy/video02.mp4' }]
          },
          {
            title: 'Porting to different platforms & Optimization',
            body: 'Bringing MLP to the Nintendo Switch, PS5, and LG TV introduced strict hardware constraints that required aggressive optimization. No but really, why is the Switch so low in memory and specs...😭 I have gained a lot of respect for all console games. Older games on consoles were really using black magics to run the game so seemlessly.',
          },
          {
            title: '',
            body: 'For the Nintendo Switch, I built a streamlined profiling system and helped optimizing the base game, ensuring we maintained a stable framerate without sacrificing the game\'s visual aesthetic. This was a great opportunity for me to learn all kinds of optimization techniques.',
            images: [{ src: '/games/my-little-puppy/example01.jpg', caption: 'Example of profiling on the Nintendo Switch' }],
          },
          {
            title: '',
            body: 'Beyond raw performance, translating the game to console required tweaking values to improve player experience. I rebalanced the difficulty of mini-games, overhauled the input handling to smooth out the roughness of the controls, and added additional mechanics to assist platforming. The goal was to ensure the dog\'s movement and platforming feel natural and responsive on a thumbstick, providing a good experience across all devices.',
          },
          {
            title: '',
            body: 'The difference in platforms caused a lot of issues in the game, so naturally quick cycle of testing and fixing was crucial. I utilized CI tools, including Jenkins, NintendoSDK, and PS5SDK, to automate our deployment processes. This allowed the team to run fast, on-device iterations and test sessions, catching TRC violations and bugs early and significantly increasing our overall development speed.',
          }
        ],
      },
      {
        heading: 'Takeaways',
        body: 'Working on My Little Puppy at Dreamotion was my first professional project and a massive leap from my student days. Collaborating with a team of up to 30 people taught me how to work within established pipelines, communicate across disciplines, and deliver production quality work under tight deadlines. Shipping on multiple platforms gave me hands-on experience with platform specific development that I wouldn\'t have gotten anywhere else.',
      },
    ],
  },
  {
    id: 'soul-after',
    title: 'Soul After',
    description: 'A story-driven top-down adventure game that explores the relationship between life and death. Developed as a passion project by a team of 6 students, marking our debut in game development.',
    genre: 'Adventure / Story / Top Down 2D',
    thumbnail: '/games/soul-after/thumbnail.jpg',
    tech: ['Unity', 'C#', 'Git'],
    link: 'https://store.steampowered.com/app/2148220/Soul_After/',
    duration: 'Aug 2021 - Aug 2022',
    teamSize: 6,
    roles: ['Game Design', 'General Programming', 'Level & System Design'],
    platforms: ['PC'],
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
        heading: 'Interesting Probelms',
        body: 'Hmm... Literally everything was a new challenge for me as I had 0 game dev knowledge prior to this project. Even using an IDE was a challenge for me. So, I would say there were no technical challenges, but more like a learning experience. Creating progression system and customizing Dialogue System was a bit challenging though😭',
      },
      {
        heading: 'Takeaways',
        body: 'I would not say I have learned a whole lot about programming from this project. It was all entry level knowledge about game development and programming, like movement, camera, interactions, and vector math. Overall, this project helped me understand Unity and C# better over anything else. This introductory project showed me what game development is like and how to work with a team. Also, it was a great learning experience for me to understand what it takes to ship a game from start to finish, and made me realize how much I am lacking in the technical side of things.',
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
              <span className="flex items-center gap-1.5"><Users size={16} /> {project.teamSizeLabel || project.teamSize}</span>
            )}
            {project.duration && (
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {project.duration}</span>
            )}
            {project.tech.length > 0 && (
              <span className="flex items-center gap-1.5"><Wrench size={16} /> {project.tech.join(', ')}</span>
            )}
            {project.platforms && project.platforms.length > 0 && (
              <span className="flex items-center gap-1.5"><Monitor size={16} /> {project.platforms.join(', ')}</span>
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
                  <Briefcase size={14} className="text-purple-400 mt-0.5 shrink-0" />
                  <span className="text-purple-700">{project.roles.join(', ')}</span>
                </div>
              )}
              {project.teamSize && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-purple-400 shrink-0" />
                  <span className="text-purple-700">Team of {project.teamSizeLabel || project.teamSize}</span>
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
              {project.platforms && project.platforms.length > 0 && (
                <div className="flex items-start gap-2">
                  <Monitor size={14} className="text-purple-400 mt-0.5 shrink-0" />
                  <span className="text-purple-700">{project.platforms.join(', ')}</span>
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
            {section.heading && (
              <h3 className="pixel-font text-3xl font-bold text-purple-900 border-b-2 border-purple-100 pb-1 mb-4 uppercase">
                {section.heading}
              </h3>
            )}

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
              <div className={`grid gap-4 mb-4 ${section.images.length > 1 ? 'grid-cols-2' : 'mx-auto'}`} style={section.images.length === 1 ? { maxWidth: '50%' } : undefined}>
                {section.images.map((img, j) => (
                  <figure key={j} className="rounded-xl overflow-hidden border-2 border-purple-100">
                    <img src={img.src} alt={img.caption || ''} className="w-full h-auto object-cover" />
                    {img.caption && (
                      <figcaption className="px-3 py-2 text-xs text-gray-400 italic font-medium bg-purple-50/50 text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {section.videos && section.videos.length > 0 && (
              <div className="flex flex-col gap-4 mb-4">
                {section.videos.map((vid, j) => (
                  <figure key={j} className="rounded-xl overflow-hidden border-2 border-purple-100">
                    <video
                      src={vid.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-auto"
                      onClick={(e) => e.preventDefault()}
                    />
                    {vid.caption && (
                      <figcaption className="px-3 py-2 text-xs text-gray-400 italic font-medium bg-purple-50/50 text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
                        {vid.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}

            {section.subsections && section.subsections.length > 0 && (
              <div className="flex flex-col gap-5 mt-4">
                {section.subsections.map((sub, j) => (
                  <div key={j} className="pl-4 border-l-4 border-purple-100">
                    <h4 className="text-lg font-bold text-purple-700 mb-2">{sub.title}</h4>
                    {sub.body && (
                      <p className="text-gray-600 leading-relaxed font-medium mb-2">{sub.body}</p>
                    )}
                    {sub.bullets && sub.bullets.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-600 font-medium ml-2 mb-2">
                        {sub.bullets.map((item, k) => (
                          <li key={k}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {sub.images && sub.images.length > 0 && (
                      <div className={`grid gap-4 mb-2 ${sub.images.length > 1 ? 'grid-cols-2' : 'mx-auto'}`} style={sub.images.length === 1 ? { maxWidth: '50%' } : undefined}>
                        {sub.images.map((img, k) => (
                          <figure key={k} className="rounded-xl overflow-hidden border-2 border-purple-100">
                            <img src={img.src} alt={img.caption || ''} className="w-full h-auto object-cover" />
                            {img.caption && (
                              <figcaption className="px-3 py-2 text-xs text-gray-400 italic font-medium bg-purple-50/50 text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
                                {img.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    )}
                    {sub.videos && sub.videos.length > 0 && (
                      <div className="flex flex-col gap-4 mb-2">
                        {sub.videos.map((vid, k) => (
                          <figure key={k} className="rounded-xl overflow-hidden border-2 border-purple-100">
                            <video
                              src={vid.src}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-auto"
                              onClick={(e) => e.preventDefault()}
                            />
                            {vid.caption && (
                              <figcaption className="px-3 py-2 text-xs text-gray-400 italic font-medium bg-purple-50/50 text-center" style={{ fontFamily: 'system-ui, sans-serif' }}>
                                {vid.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
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
