
import React from 'react';

export type AppId = 'notes' | 'paint' | 'music' | 'projects' | 'about' | 'resume';

export interface WindowInstance {
  id: AppId;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  customIcon?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string; // 실제 스트리밍 가능한 MP3 URL 또는 Blob URL
  cover?: string;
  duration?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'image' | 'video' | 'text';
  url?: string;
  date: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  thumbnail: string;
  videoUrl?: string;
  link?: string;
  tech: string[];
}
