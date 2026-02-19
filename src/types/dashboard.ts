export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  categoryId: string;
  watched?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId?: string;
  children?: Category[];
}

// New folder-based content types
export interface ContentItem {
  id: string;
  name: string;
  type: 'folder' | 'video' | 'pdf';
  parentId: string | null;
  createdAt: string;
  // For videos
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  // For PDFs
  pdfUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  progress: Record<string, boolean>;
  devices: DeviceSession[];
}

export interface DeviceSession {
  id: string;
  userAgent: string;
  lastActive: string;
}

export interface DashboardData {
  categories: Category[];
  videos: Video[];
  contents?: ContentItem[];
}
