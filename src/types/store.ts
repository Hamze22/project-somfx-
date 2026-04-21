export interface EA {
  id: string;
  name: string;
  category: string;
  price: number;
  profit: string;
  winrate: string;
  drawdown: string;
  pairs: string;
  icon: string;
  description: string;
  badge?: string;
  images?: string[];
  file_url?: string;
  status: 'active' | 'hidden';
  rating?: string;
  reviews?: number;
}

export interface Indicator {
  id: string;
  name: string;
  type: string;
  price: number;
  icon: string;
  description: string;
  features: string[];
  images?: string[];
  file_url?: string;
  status: 'active' | 'hidden';
}

export interface Course {
  id: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration: string;
  icon: string;
  description: string;
  tags: string[];
  thumb?: string;
  video_count?: number;
  pdf_count?: number;
  file_url?: string;
  content_type: 'file' | 'youtube';
  youtube_url?: string;
  status: 'active' | 'hidden';
}
