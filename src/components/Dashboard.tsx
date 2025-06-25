
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDashboardStats, mockRadios, mockClients } from '@/data/mockData';
import { 
  Radio, 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp,
  Headphones,
  Play,
  Pause
} from 'lucide-react';

export default function Dashboard() {
  const stats = mockDashboardStats;
  const recentRadios = mockRadios.slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="flex items-center mt-1">
            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido al Panel de Administración!</h1>
        <p className="text-blue-100">Gestiona todas tus radios desde un solo lugar.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Radios"
          value={stats.totalRadios}
          icon={Radio}
          trend="+2 este mes"
          color="blue"
        />
        <StatCard
          title="Radios Activas"
          value={stats.activeRadios}
          icon={Activity}
          trend="100% uptime"
          color="green"
        />
        <StatCard
          title="Total Clientes"
          value={stats.totalClients}
          icon={Users}
          trend="+1 nuevo"
          color="purple"
        />
        <StatCard
          title="Oyentes Activos"
          value={stats.totalListeners}
          icon={Headphones}
          trend="+15% vs ayer"
          color="orange"
        />
      </div>

      {/* Recent Activity & Radio Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Radios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Estado de Radios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRadios.map((radio) => (
              <div key={radio.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${radio.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {radio.status === 'active' ? (
                      <Play className={`w-4 h-4 text-green-600`} />
                    ) : (
                      <Pause className={`w-4 h-4 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{radio.name}</p>
                    <p className="text-sm text-gray-500">Puerto {radio.port}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={radio.status === 'active' ? 'default' : 'destructive'}>
                    {radio.status === 'active' ? 'Activa' : 'Suspendida'}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    {radio.listeners}/{radio.maxListeners} oyentes
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Revenue & Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-green-600 font-medium">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-green-700">${stats.revenue}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan Básico</span>
                <span className="font-medium">1 cliente</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan Profesional</span>
                <span className="font-medium">1 cliente</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plan Enterprise</span>
                <span className="font-medium">1 cliente</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-700">Servicios Shoutcast</p>
                <p className="text-sm text-green-600">Operativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-700">Servicios Icecast</p>
                <p className="text-sm text-green-600">Operativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-700">Base de Datos</p>
                <p className="text-sm text-green-600">Conectada</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
