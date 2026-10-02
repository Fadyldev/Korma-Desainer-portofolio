export type UserRole = 'admin' | 'client';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  company?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

export type ProjectStatus =
  | 'Brief'
  | 'Research'
  | 'Concept'
  | 'Design'
  | 'Revision'
  | 'Final'
  | 'Completed';

export interface ProjectDeliverable {
  id: string;
  name: string;
  url: string;
  size?: string;
  date: string;
}

export interface Project {
  id: number;
  client_id: number;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  client_phone?: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  start_date: string;
  deadline: string;
  deliverables?: ProjectDeliverable[];
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: string;
  file_url?: string | null;
  file_name?: string | null;
  created_at: string;
}

export interface Service {
  id: number;
  category: 'UMKM' | 'BUSINESS / CORPORATE' | 'PERSONAL / CUSTOM' | string;
  name: string;
  description: string;
  features: string[];
  starting_price: number;
  image_url?: string | null;
  is_active: number;
  cta_text: string;
  created_at?: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  client_name: string;
  category: string;
  description: string;
  concept: string;
  year: string;
  tools: string;
  image_url: string;
  is_featured: number;
  created_at?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: number;
  reply_text?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface AdminStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  totalPortfolio: number;
  unreadMessages: number;
}

export interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  nearestDeadline: string | null;
}
