
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '@/types';

interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Detectar la URL base del API basada en la ubicación actual
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Si estamos en desarrollo local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // En producción, usar HTTPS si está disponible
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${window.location.hostname}:3000/api`;
};

const API_BASE_URL = getApiBaseUrl();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('API Base URL:', API_BASE_URL);
    // Check if user is already logged in
    const token = localStorage.getItem('radiopanel_token');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      console.log('Verifying token...');
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Verify response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Verify response data:', data);
        if (data.success) {
          setUser(data.data.user);
        } else {
          localStorage.removeItem('radiopanel_token');
        }
      } else {
        console.log('Token verification failed with status:', response.status);
        localStorage.removeItem('radiopanel_token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('radiopanel_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      console.log('Login credentials:', { username, password });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        return false;
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (data.success) {
        setUser(data.data.user);
        localStorage.setItem('radiopanel_token', data.data.token);
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('radiopanel_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
