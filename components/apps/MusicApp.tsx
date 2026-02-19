
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
    cover: "/music/song01.jpeg",
  },
  {
    id: '2',
    title: "parkside in bloom",
    artist: "Kensuke Ushio",
    url: "/music/song02.mp3",
    cover: "/music/song02.jpeg",
  },
  {
    id: '3',
    title: "Rose's Fountain",
    artist: "Steven Universe, aivi & surasshu",
    url: "/music/song03.mp3",
    cover: "/music/song03.jpeg",
  },
  {
    id: '4',
    title: "Somewhere in the Woods (Short Hike)",
    artist: "Mark Sparling",
    url: "/music/song04.mp3",
    cover: "/music/song04.jpeg",
  },
  {
    id: '5',
    title: "Good night (Revival Rhythm Mix)",
    artist: "Genki Rockets",
    url: "/music/song05.mp3",
    cover: "/music/song05.jpeg",
  },
  // Add more songs here following the same pattern:
  // {
  //   id: '5',
  //   title: "Song Title",
  //   artist: "Artist Name",
  //   url: "/music/song05.mp3",
  //   cover: "/music/song05.jpeg",
  // },
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
  const [volume, setVolume] = useState(0.8);
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
      audioRef.current.volume = isMuted ? 0 : volume;
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
              <h2 ref={titleRef} className="marquee-text text-xl font-black tracking-tight leading-tight whitespace-nowrap uppercase">{currentSong.title}</h2>
            </div>
            <div className="marquee-container" ref={artistContainerRef}>
              <p ref={artistRef} className="marquee-text text-xs font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">{currentSong.artist}</p>
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
