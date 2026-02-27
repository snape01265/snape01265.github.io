
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GallerySection {
  title: string;
  images: string[];
}

const SECTIONS: GallerySection[] = [
  {
    title: 'My Little Puppy',
    images: [
      '/gallery/01_07.jpg',
      '/gallery/01_13.png',
      '/gallery/01_03.jpg',
      '/gallery/01_16.jpg',
      '/gallery/01_01.png',
      '/gallery/01_10.jpg',
      '/gallery/01_05.jpg',
      '/gallery/01_14.png',
      '/gallery/01_08.jpg',
      '/gallery/01_02.jpg',
      '/gallery/01_11.jpg',
      '/gallery/01_06.jpg',
      '/gallery/01_15.jpg',
      '/gallery/01_09.jpg',
      '/gallery/01_04.jpg',
      '/gallery/01_12.jpg',
    ],
  },
  {
    title: 'Soul After',
    images: [
      '/gallery/02_05.jpg',
      '/gallery/02_12.jpg',
      '/gallery/02_01.jpg',
      '/gallery/02_09.jpg',
      '/gallery/02_03.jpg',
      '/gallery/02_14.jpg',
      '/gallery/02_07.jpg',
      '/gallery/02_10.jpg',
      '/gallery/02_02.jpg',
      '/gallery/02_15.jpg',
      '/gallery/02_06.jpg',
      '/gallery/02_11.jpg',
      '/gallery/02_04.jpg',
      '/gallery/02_13.jpg',
      '/gallery/02_08.jpg',
    ],
  },
];

const ALL_IMAGES = SECTIONS.flatMap((s) => s.images);

const GalleryApp: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (globalIndex: number) => setSelectedIndex(globalIndex);
  const closeLightbox = () => setSelectedIndex(null);

  const goNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % ALL_IMAGES.length);
  };

  const goPrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + ALL_IMAGES.length) % ALL_IMAGES.length);
  };

  let globalIndex = 0;

  return (
    <div className="p-8 h-full bg-slate-950 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Gallery</h2>
          <p className="text-slate-400 text-lg">A collection of moments and visuals.</p>
        </header>

        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-12">
            <h3 className="pixel-font text-2xl font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {section.images.map((src) => {
                const idx = globalIndex++;
                return (
                  <button
                    key={src}
                    onClick={() => openLightbox(idx)}
                    className="group relative rounded-xl overflow-hidden bg-slate-900 border border-white/5 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full aspect-square object-cover group-hover:brightness-110 transition-all duration-300"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 p-2 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={36} />
          </button>
          <img
            src={ALL_IMAGES[selectedIndex]}
            alt=""
            className="max-w-[85%] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 p-2 text-white/50 hover:text-white transition-colors"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryApp;
