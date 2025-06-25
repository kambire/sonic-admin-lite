
import { Client, Plan, Radio, DashboardStats } from '@/types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Radio Música FM',
    email: 'contacto@radiomusica.com',
    phone: '+34 666 123 456',
    createdAt: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Beats Online',
    email: 'info@beatsonline.net',
    phone: '+34 677 987 654',
    createdAt: '2024-02-20',
    status: 'active'
  },
  {
    id: '3',
    name: 'Radio Clásica',
    email: 'admin@radioclasica.es',
    phone: '+34 688 456 789',
    createdAt: '2024-01-10',
    status: 'suspended'
  }
];

export const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Básico',
    diskSpace: 5,
    listeners: 50,
    bitrate: 128,
    price: 19.99,
    features: ['Streaming 24/7', 'Panel de control', 'Estadísticas básicas'],
    isActive: true
  },
  {
    id: '2',
    name: 'Profesional',
    diskSpace: 20,
    listeners: 200,
    bitrate: 320,
    price: 49.99,
    features: ['Streaming 24/7', 'AutoDJ incluido', 'Estadísticas avanzadas', 'API access'],
    isActive: true
  },
  {
    id: '3',
    name: 'Enterprise',
    diskSpace: 100,
    listeners: 1000,
    bitrate: 320,
    price: 149.99,
    features: ['Streaming 24/7', 'AutoDJ Premium', 'CDN global', 'Soporte prioritario', 'White label'],
    isActive: true
  }
];

export const mockRadios: Radio[] = [
  {
    id: '1',
    name: 'Música FM Principal',
    clientId: '1',
    planId: '2',
    serverType: 'shoutcast',
    port: 8000,
    status: 'active',
    listeners: 45,
    maxListeners: 200,
    createdAt: '2024-01-15',
    lastOnline: '2024-06-25T10:30:00Z',
    hasAutoDJ: true,
    streamUrl: 'http://stream.radiomusica.com:8000'
  },
  {
    id: '2',
    name: 'Beats Online Stream',
    clientId: '2',
    planId: '1',
    serverType: 'icecast',
    port: 8001,
    status: 'active',
    listeners: 23,
    maxListeners: 50,
    createdAt: '2024-02-20',
    lastOnline: '2024-06-25T10:25:00Z',
    hasAutoDJ: false,
    streamUrl: 'http://stream.beatsonline.net:8001'
  },
  {
    id: '3',
    name: 'Radio Clásica Premium',
    clientId: '3',
    planId: '3',
    serverType: 'shoutcast',
    port: 8002,
    status: 'suspended',
    listeners: 0,
    maxListeners: 1000,
    createdAt: '2024-01-10',
    lastOnline: '2024-06-20T15:45:00Z',
    hasAutoDJ: true,
    streamUrl: 'http://stream.radioclasica.es:8002'
  }
];

export const mockDashboardStats: DashboardStats = {
  totalRadios: 3,
  activeRadios: 2,
  suspendedRadios: 1,
  totalClients: 3,
  totalListeners: 68,
  revenue: 219.97
};
