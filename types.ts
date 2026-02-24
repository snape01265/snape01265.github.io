
import React from 'react';

export type AppId = 'paint' | 'music' | 'projects' | 'about' | 'resume' | 'gallery';

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

export interface CaseStudyImage {
  src: string;
  caption?: string;
}

export interface CaseStudyLink {
  label: string;
  url: string;
}

export interface CaseStudyVideo {
  src: string;
  caption?: string;
}

export interface CaseStudySection {
  heading: string;
  body?: string;
  bullets?: string[];
  images?: CaseStudyImage[];
  videos?: CaseStudyVideo[];
  links?: CaseStudyLink[];
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
  duration?: string;
  teamSize?: number;
  teamSizeLabel?: string;
  roles?: string[];
  platforms?: string[];
  caseStudy?: CaseStudySection[];
}
