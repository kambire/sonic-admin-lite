
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface Plan {
  id: string;
  name: string;
  diskSpace: number; // GB
  listeners: number;
  bitrate: number; // kbps
  price: number; // monthly
  features: string[];
  isActive: boolean;
}

export interface Radio {
  id: string;
  name: string;
  clientId: string;
  planId: string;
  serverType: 'shoutcast' | 'icecast';
  port: number;
  status: 'active' | 'suspended' | 'offline';
  listeners: number;
  maxListeners: number;
  createdAt: string;
  lastOnline: string;
  hasAutoDJ: boolean;
  streamUrl: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface DashboardStats {
  totalRadios: number;
  activeRadios: number;
  suspendedRadios: number;
  totalClients: number;
  totalListeners: number;
  revenue: number;
}
