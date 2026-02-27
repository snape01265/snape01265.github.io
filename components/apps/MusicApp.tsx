
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Share2
} from 'lucide-react';
import { Song } from '../../types';

// ============================================================
// PLAYLIST CONFIGURATION
// To add songs: place .mp3 files in the /public/music/ folder,
// then add entries below with the matching filename.
// ============================================================
const INITIAL_PLAYLIST: Song[] = [
  {
    id: '1',
    title: "New Home (Slowed)",
    artist: "Austin Farwell",
    url: "/music/song01.mp3",
    cover: "/music/image01.jpeg",
  },
  {
    id: '2',
    title: "parkside in bloom",
    artist: "Kensuke Ushio",
    url: "/music/song02.mp3",
    cover: "/music/image02.jpeg",
  },
  {
    id: '3',
    title: "Rose's Fountain",
    artist: "Steven Universe, aivi & surasshu",
    url: "/music/song03.mp3",
    cover: "/music/image03.jpeg",
  },
  {
    id: '4',
    title: "Somewhere in the Woods (Short Hike)",
    artist: "Mark Sparling",
    url: "/music/song04.mp3",
    cover: "/music/image04.jpeg",
  },
  {
    id: '5',
    title: "Good night (Revival Rhythm Mix)",
    artist: "Genki Rockets",
    url: "/music/song05.mp3",
    cover: "/music/image05.jpeg",
  },
  {
    id: '6',
    title: "Title Theme",
    artist: "Koji Kondo",
    url: "/music/song06.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '7',
    title: "Opening",
    artist: "Koji Kondo",
    url: "/music/song07.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '8',
    title: "Inside The Castle Walls",
    artist: "Koji Kondo",
    url: "/music/song08.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '9',
    title: "Dire, Dire Docks",
    artist: "Koji Kondo",
    url: "/music/song09.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '10',
    title: "Snow Mountain",
    artist: "Koji Kondo",
    url: "/music/song10.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '11',
    title: "Piranha Plant's Lullaby",
    artist: "Koji Kondo",
    url: "/music/song11.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '12',
    title: "File Select",
    artist: "Koji Kondo",
    url: "/music/song12.mp3",
    cover: "/music/image06.jpeg",
  },
  {
    id: '13',
    title: "Panacea",
    artist: "Disasterpeace",
    url: "/music/song13.mp3",
    cover: "/music/image07.jpeg",
  },
  {
    id: '14',
    title: "Glass Ocean",
    artist: "Machine Girl",
    url: "/music/song14.mp3",
    cover: "/music/image08.jpeg",
  },
  {
    id: '15',
    title: "Sin to Win!",
    artist: "Machine Girl",
    url: "/music/song15.mp3",
    cover: "/music/image08.jpeg",
  },
  {
    id: '16',
    title: "House of Cards",
    artist: "Machine Girl",
    url: "/music/song16.mp3",
    cover: "/music/image08.jpeg",
  },
  {
    id: '17',
    title: "Rigged Game",
    artist: "Machine Girl",
    url: "/music/song17.mp3",
    cover: "/music/image08.jpeg",
  },
  {
    id: '18',
    title: "Angel's Peak",
    artist: "Machine Girl",
    url: "/music/song18.mp3",
    cover: "/music/image08.jpeg",
  },
  {
    id: '19',
    title: "Solitary Grace",
    artist: "Machine Girl",
    url: "/music/song19.mp3",
    cover: "/music/image08.jpeg",
  },
  {
    id: '20',
    title: "Pearly Gate Promenade",
    artist: "Machine Girl",
    url: "/music/song20.mp3",
    cover: "/music/image09.jpeg",
  },
  {
    id: '21',
    title: "Peace of Mind",
    artist: "Machine Girl",
    url: "/music/song21.mp3",
    cover: "/music/image09.jpeg",
  },
  {
    id: '22',
    title: "Map",
    artist: "Koji Kondo",
    url: "/music/song22.mp3",
    cover: "/music/image10.jpeg",
  },
  {
    id: '23',
    title: "Flower Garden",
    artist: "Koji Kondo",
    url: "/music/song23.mp3",
    cover: "/music/image10.jpeg",
  },
  {
    id: '24',
    title: "Cinco de Chocobo",
    artist: "Nobuo Uematsu",
    url: "/music/song24.mp3",
    cover: "/music/image11.jpeg",
  },
  {
    id: '25',
    title: "Sanctuary Guardian",
    artist: "Keiichi Suzuki, Hirokazu Tanaka, Akio Ohmori, Ritsuo Kamimura",
    url: "/music/song25.mp3",
    cover: "/music/image12.jpeg",
  },
  {
    id: '26',
    title: "Clocktowers Beneath The Sea",
    artist: "Pascal Michael Stiefel",
    url: "/music/song26.mp3",
    cover: "/music/image13.jpeg",
  },
  {
    id: '27',
    title: "Peace and Tranquility",
    artist: "Pascal Michael Stiefel",
    url: "/music/song27.mp3",
    cover: "/music/image14.jpeg",
  },
  {
    id: '28',
    title: "Garbage Day",
    artist: "Daniel Koestner",
    url: "/music/song28.mp3",
    cover: "/music/image15.jpeg",
  },
  {
    id: '29',
    title: "Slackers",
    artist: "Daniel Koestner",
    url: "/music/song29.mp3",
    cover: "/music/image15.jpeg",
  },
  {
    id: '30',
    title: "Breaking Ground",
    artist: "Daniel Koestner",
    url: "/music/song30.mp3",
    cover: "/music/image15.jpeg",
  },
  {
    id: '31',
    title: "Lazy River",
    artist: "Daniel Koestner",
    url: "/music/song31.mp3",
    cover: "/music/image15.jpeg",
  },
  {
    id: '32',
    title: "Bird of Paradise",
    artist: "Daniel Koestner",
    url: "/music/song32.mp3",
    cover: "/music/image15.jpeg",
  },
  {
    id: '33',
    title: "Raccoon House Music",
    artist: "Daniel Koestner, Ben Esposito",
    url: "/music/song33.mp3",
    cover: "/music/image15.jpeg",
  },
  {
    id: '34',
    title: "Corridor of Time",
    artist: "Yasunori Mitsuda",
    url: "/music/song34.mp3",
    cover: "/music/image16.jpeg",
  },
  {
    id: '35',
    title: "Secret of the Forest",
    artist: "Yasunori Mitsuda",
    url: "/music/song35.mp3",
    cover: "/music/image16.jpeg",
  },
  {
    id: '36',
    title: "Reflection",
    artist: "Christopher Larkin",
    url: "/music/song36.mp3",
    cover: "/music/image17.jpeg",
  },
  {
    id: '37',
    title: "City of Tears",
    artist: "Christopher Larkin",
    url: "/music/song37.mp3",
    cover: "/music/image17.jpeg",
  },
  {
    id: '38',
    title: "Snowman",
    artist: "Hirokazu Tanaka, Keiichi Suzuki, Hiroshi Kanazu",
    url: "/music/song38.mp3",
    cover: "/music/image18.jpeg",
  },
  {
    id: '39',
    title: "Boom Town Lounge",
    artist: "Shane Mesa",
    url: "/music/song39.mp3",
    cover: "/music/image18.jpeg",
  },
  {
    id: '40',
    title: "Late Late Matinee",
    artist: "Shane Mesa",
    url: "/music/song40.mp3",
    cover: "/music/image18.jpeg",
  },
  {
    id: '41',
    title: "Knife & Crystal",
    artist: "Epoch",
    url: "/music/song41.mp3",
    cover: "/music/image19.jpeg",
  },
  {
    id: '42',
    title: "Begin Again",
    artist: "Daniel Olsén, Jonathan Eng, Linnea Olsson",
    url: "/music/song42.mp3",
    cover: "/music/image20.jpeg",
  },
  {
    id: '43',
    title: "icosa",
    artist: "Oliver Buckland",
    url: "/music/song43.mp3",
    cover: "/music/image21.jpeg",
  },
  {
    id: '44',
    title: "Browser History",
    artist: "Graham Kartna",
    url: "/music/song44.mp3",
    cover: "/music/image22.jpeg",
  },
  {
    id: '45',
    title: "backroom labyrinth",
    artist: "Oliver Buckland",
    url: "/music/song45.mp3",
    cover: "/music/image23.jpeg",
  },
  {
    id: '46',
    title: "Temptation Stairway (Waltz)",
    artist: "Metaroom",
    url: "/music/song46.mp3",
    cover: "/music/image24.jpeg",
  },
  {
    id: '47',
    title: "God Race",
    artist: "Metaroom",
    url: "/music/song47.mp3",
    cover: "/music/image25.jpeg",
  },
  {
    id: '48',
    title: "Hourglass Meadow",
    artist: "Oliver Buckland",
    url: "/music/song48.mp3",
    cover: "/music/image26.jpeg",
  },
  {
    id: '49',
    title: "Dandy in Love",
    artist: "Shutoku Mukai",
    url: "/music/song49.mp3",
    cover: "/music/image27.jpeg",
  },
  {
    id: '50',
    title: "Pokke Village Theme",
    artist: "Akihiko Narita",
    url: "/music/song50.mp3",
    cover: "/music/image28.jpeg",
  },
  {
    id: '51',
    title: "going home",
    artist: "Shiro SAGISU",
    url: "/music/song51.mp3",
    cover: "/music/image29.jpeg",
  },
  {
    id: '52',
    title: "Title Theme",
    artist: "Koji Kondo",
    url: "/music/song52.mp3",
    cover: "/music/image30.jpeg",
  },
  {
    id: '53',
    title: "Kokiri Forest",
    artist: "Koji Kondo",
    url: "/music/song53.mp3",
    cover: "/music/image30.jpeg",
  },
  {
    id: '54',
    title: "Ocarina of Time",
    artist: "Koji Kondo",
    url: "/music/song54.mp3",
    cover: "/music/image30.jpeg",
  },
  {
    id: '55',
    title: "Lost Woods",
    artist: "Koji Kondo",
    url: "/music/song55.mp3",
    cover: "/music/image30.jpeg",
  },
  {
    id: '56',
    title: "Great Fairy's Fountain",
    artist: "Koji Kondo",
    url: "/music/song56.mp3",
    cover: "/music/image30.jpeg",
  },
  {
    id: '57',
    title: "Gerudo Valley",
    artist: "Koji Kondo",
    url: "/music/song57.mp3",
    cover: "/music/image30.jpeg",
  },
  {
    id: '58',
    title: "The Pub on a Sleepy Afternoon",
    artist: "Smilegate Megaport",
    url: "/music/song58.mp3",
    cover: "/music/image31.jpeg",
  },
  {
    id: '59',
    title: "Fall (The Smell of Mushroom)",
    artist: "ConcernedApe",
    url: "/music/song59.mp3",
    cover: "/music/image32.jpeg",
  },
  {
    id: '60',
    title: "Duet",
    artist: "Omori",
    url: "/music/song60.mp3",
    cover: "/music/image33.jpeg",
  },
  {
    id: '61',
    title: "Fallen Down",
    artist: "toby fox",
    url: "/music/song61.mp3",
    cover: "/music/image34.jpeg",
  },
  {
    id: '62',
    title: "Ghost Fight",
    artist: "toby fox",
    url: "/music/song62.mp3",
    cover: "/music/image34.jpeg",
  },
  {
    id: '63',
    title: "Home",
    artist: "toby fox",
    url: "/music/song63.mp3",
    cover: "/music/image34.jpeg",
  },
  {
    id: '64',
    title: "sans.",
    artist: "toby fox",
    url: "/music/song64.mp3",
    cover: "/music/image34.jpeg",
  },
  {
    id: '65',
    title: "Snowdin Town",
    artist: "toby fox",
    url: "/music/song65.mp3",
    cover: "/music/image34.jpeg",
  },
  {
    id: '66',
    title: "Welcome to VA-11 HALL-A",
    artist: "Garoad",
    url: "/music/song66.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '67',
    title: "Every Day is Night",
    artist: "Garoad",
    url: "/music/song67.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '68',
    title: "A Gaze That Invited Disaster",
    artist: "Garoad",
    url: "/music/song68.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '69',
    title: "Digital Drive",
    artist: "Garoad",
    url: "/music/song69.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '70',
    title: "Safe Haven",
    artist: "Garoad",
    url: "/music/song70.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '71',
    title: "Karmotrine Dream",
    artist: "Garoad",
    url: "/music/song71.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '72',
    title: "Your Love is a Drug",
    artist: "Garoad",
    url: "/music/song72.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '73',
    title: "Snowfall",
    artist: "Garoad",
    url: "/music/song73.mp3",
    cover: "/music/image35.jpeg",
  },
  {
    id: '74',
    title: "Believe in Me Who Believes in You",
    artist: "Garoad",
    url: "/music/song74.mp3",
    cover: "/music/image35.jpeg",
  },
];

// Fisher-Yates shuffle to create a randomized index order
// If excludeFirst is provided, that index won't appear as the first song in the queue
const createShuffledOrder = (length: number, excludeFirst?: number): number[] => {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (excludeFirst !== undefined && order.length > 1 && order[0] === excludeFirst) {
    const swapIdx = 1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[swapIdx]] = [order[swapIdx], order[0]];
  }
  return order;
};

const MAX_VOLUME = 0.5;

const MusicApp: React.FC = () => {
  const [songs] = useState<Song[]>(INITIAL_PLAYLIST);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(true);
  const [isRepeat, setIsRepeat] = useState(true);

  // Shuffle queue: an ordered list of song indices to play through
  const [shuffleQueue, setShuffleQueue] = useState<number[]>(() => createShuffledOrder(INITIAL_PLAYLIST.length));
  // Position within the queue
  const [queuePos, setQueuePos] = useState(0);
  // The actual song index is derived from the queue when shuffling, or queuePos directly when not
  const currentIdx = isShuffle ? shuffleQueue[queuePos] : queuePos;
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHoveringArt, setIsHoveringArt] = useState(false);

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const artistRef = useRef<HTMLParagraphElement | null>(null);
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const artistContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateScrollDistance = (textEl: HTMLElement | null, containerEl: HTMLElement | null) => {
      if (!textEl || !containerEl) return;
      const overflow = textEl.scrollWidth - containerEl.clientWidth;
      containerEl.style.setProperty('--scroll-distance', overflow > 0 ? `-${overflow}px` : '0px');
    };
    updateScrollDistance(titleRef.current, titleContainerRef.current);
    updateScrollDistance(artistRef.current, artistContainerRef.current);
  }, [currentIdx, queuePos, shuffleQueue]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const currentSong = songs[currentIdx];

  const safePlay = useCallback(async () => {
    if (!audioRef.current || !currentSong.url) return;
    
    try {
      playPromiseRef.current = audioRef.current.play();
      setIsPlaying(true);
      await playPromiseRef.current;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error("Playback failed:", err);
      }
      setIsPlaying(false);
    }
  }, [currentSong.url]);

  const safePause = useCallback(async () => {
    if (!audioRef.current) return;
    
    if (playPromiseRef.current !== null) {
      try {
        await playPromiseRef.current;
      } catch (e) {
        // Ignore aborted play errors
      } finally {
        playPromiseRef.current = null;
      }
    }
    
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      safePause();
    } else {
      safePlay();
    }
  };

  const shouldAutoPlay = useRef(false);

  const changeSong = useCallback(async (next: boolean) => {
    let nextPos = queuePos;
    if (next) {
      if (queuePos < songs.length - 1) {
        nextPos = queuePos + 1;
      } else if (isRepeat) {
        // Reshuffle when looping back to the start in shuffle mode
        // Exclude the current (last) song so it doesn't repeat immediately
        if (isShuffle) {
          const lastSongIdx = shuffleQueue[queuePos];
          setShuffleQueue(createShuffledOrder(songs.length, lastSongIdx));
        }
        nextPos = 0;
      } else {
        await safePause();
        return;
      }
    } else {
      nextPos = (queuePos - 1 + songs.length) % songs.length;
    }

    shouldAutoPlay.current = true;
    await safePause();
    setQueuePos(nextPos);
  }, [queuePos, isShuffle, isRepeat, songs.length, safePause, shuffleQueue]);

  useEffect(() => {
    if (audioRef.current && currentSong.url) {
      audioRef.current.src = currentSong.url;
    }
  }, []);

  const prevSongIdx = useRef(currentIdx);
  const prevQueuePos = useRef(queuePos);

  useEffect(() => {
    if (!audioRef.current) return;

    const songChanged = currentIdx !== prevSongIdx.current;
    const posChanged = queuePos !== prevQueuePos.current;
    prevSongIdx.current = currentIdx;
    prevQueuePos.current = queuePos;

    if (songChanged || posChanged) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
    }
  }, [queuePos, shuffleQueue]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume * MAX_VOLUME;
    }
  }, [volume, isMuted]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full bg-black flex flex-col select-none overflow-hidden font-sans text-white relative">
      <audio 
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => changeSong(true)}
        onCanPlay={() => {
          if (shouldAutoPlay.current) {
            shouldAutoPlay.current = false;
            safePlay();
          }
        }}
      />

      {/* Album Art Section (Controls appear on hover) */}
      <div 
        className="relative w-full aspect-square"
        onMouseEnter={() => setIsHoveringArt(true)}
        onMouseLeave={() => setIsHoveringArt(false)}
      >
        <img src={currentSong.cover} className="w-full h-full object-cover opacity-80" alt="Cover" />
        
        {/* Controls Overlay */}
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-around px-4 transition-opacity duration-300 ${isHoveringArt ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => {
              if (!isShuffle) {
                // Turning shuffle ON: create a new queue with the current song first
                const remaining = Array.from({ length: songs.length }, (_, i) => i).filter(i => i !== currentIdx);
                for (let i = remaining.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
                }
                setShuffleQueue([currentIdx, ...remaining]);
                setQueuePos(0);
              } else {
                // Turning shuffle OFF: jump to the current song's natural position
                setQueuePos(currentIdx);
              }
              setIsShuffle(!isShuffle);
            }}
            className={`p-1.5 transition-colors ${isShuffle ? 'text-white' : 'text-white/40 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          
          <button onClick={() => changeSong(false)} className="p-1.5 hover:text-white" title="Previous">
            <SkipBack size={22} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
          </button>
          
          <button onClick={() => changeSong(true)} className="p-1.5 hover:text-white" title="Next">
            <SkipForward size={22} fill="currentColor" />
          </button>
          
          <button 
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-1.5 transition-colors relative ${isRepeat ? 'text-white' : 'text-white/40 hover:text-white'}`}
            title="Repeat"
          >
            <Repeat size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Info & Progress Section */}
      <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-black/20 to-black">
        {/* Progress Bar */}
        <div className="space-y-1 mb-1">
          <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-white transition-all duration-100" 
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if(audioRef.current) audioRef.current.currentTime = val;
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-white/30">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Title & Volume Gauge */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="marquee-container" ref={titleContainerRef}>
              <h2 ref={titleRef} className="marquee-text text-xl font-black tracking-tight leading-tight whitespace-nowrap">{currentSong.title}</h2>
            </div>
            <div className="marquee-container" ref={artistContainerRef}>
              <p ref={artistRef} className="marquee-text text-xs font-bold text-white/40 tracking-widest whitespace-nowrap">{currentSong.artist}</p>
            </div>
          </div>
          
          {/* Volume Control Area */}
          <div className="flex items-center gap-1.5 h-6 shrink-0">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`transition-colors ${isMuted ? 'text-red-500' : 'text-white/40 hover:text-white/80'}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <div className="flex items-center gap-0.5 h-full group">
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
                <button 
                  key={v}
                  onClick={() => {
                    setVolume(v);
                    setIsMuted(false);
                  }}
                  className={`w-1 rounded-full transition-all duration-200 ${!isMuted && volume >= v ? 'bg-white' : 'bg-white/10 hover:bg-white/30'}`}
                  style={{ height: `${20 + (v * 80)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicApp;
