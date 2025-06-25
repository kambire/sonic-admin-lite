
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Server, 
  Database, 
  Shield, 
  Bell,
  Globe,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados exitosamente"
    });
  };

  const systemInfo = [
    { label: 'Versión del Sistema', value: 'RadioPanel v2.1.0', icon: Cpu },
    { label: 'Servidor Web', value: 'Apache 2.4.52', icon: Server },
    { label: 'Base de Datos', value: 'MySQL 8.0.33', icon: Database },
    { label: 'Espacio Libre', value: '847 GB / 1 TB', icon: HardDrive },
    { label: 'Memoria RAM', value: '14.2 GB / 16 GB', icon: Activity },
    { label: 'Uptime', value: '23 días, 14 horas', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
        <p className="text-gray-600">Gestiona la configuración general y monitoreo del sistema</p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Información del Administrador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" value={user?.username || ''} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {user?.role === 'superadmin' ? 'Super Administrador' : 'Administrador'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Server Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Configuración del Servidor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="server_ip">IP del Servidor</Label>
              <Input id="server_ip" placeholder="192.168.1.100" />
            </div>
            <div>
              <Label htmlFor="domain">Dominio Principal</Label>
              <Input id="domain" placeholder="radio.tudominio.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shoutcast_path">Ruta Shoutcast</Label>
              <Input id="shoutcast_path" placeholder="/opt/shoutcast" />
            </div>
            <div>
              <Label htmlFor="icecast_path">Ruta Icecast</Label>
              <Input id="icecast_path" placeholder="/opt/icecast" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Información del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{info.label}</p>
                    <p className="text-sm text-gray-600">{info.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configuración de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp_server">Servidor SMTP</Label>
              <Input id="smtp_server" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <Label htmlFor="smtp_port">Puerto SMTP</Label>
              <Input id="smtp_port" placeholder="587" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp_user">Usuario SMTP</Label>
              <Input id="smtp_user" placeholder="admin@tudominio.com" />
            </div>
            <div>
              <Label htmlFor="smtp_pass">Contraseña SMTP</Label>
              <Input id="smtp_pass" type="password" placeholder="••••••••" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configuración API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api_endpoint">Endpoint API de SonicPanel (opcional)</Label>
            <Input id="api_endpoint" placeholder="https://api.sonicpanel.com/v1" />
            <p className="text-sm text-gray-500 mt-1">
              Deja vacío para usar el modo de prueba local
            </p>
          </div>
          <div>
            <Label htmlFor="api_key">API Key</Label>
            <Input id="api_key" type="password" placeholder="••••••••••••••••" />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
