
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockRadios, mockClients, mockPlans } from '@/data/mockData';
import { Radio, Client, Plan } from '@/types';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Play,
  Pause,
  Radio as RadioIcon,
  Users,
  ExternalLink,
  Settings
} from 'lucide-react';

export default function RadiosManagement() {
  const [radios, setRadios] = useLocalStorage<Radio[]>('radiopanel_radios', mockRadios);
  const [clients] = useLocalStorage<Client[]>('radiopanel_clients', mockClients);
  const [plans] = useLocalStorage<Plan[]>('radiopanel_plans', mockPlans);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRadio, setEditingRadio] = useState<Radio | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    planId: '',
    serverType: 'shoutcast' as 'shoutcast' | 'icecast',
    port: '',
    hasAutoDJ: false
  });

  const filteredRadios = radios.filter(radio => {
    const client = clients.find(c => c.id === radio.clientId);
    return radio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getNextAvailablePort = () => {
    const usedPorts = radios.map(r => r.port);
    let port = 8000;
    while (usedPorts.includes(port)) {
      port++;
    }
    return port;
  };

  const handleCreateRadio = () => {
    if (!formData.name || !formData.clientId || !formData.planId) {
      toast({
        title: "Error",
        description: "Nombre, cliente y plan son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const client = clients.find(c => c.id === formData.clientId);
    const plan = plans.find(p => p.id === formData.planId);
    const port = formData.port ? parseInt(formData.port) : getNextAvailablePort();

    const newRadio: Radio = {
      id: Date.now().toString(),
      name: formData.name,
      clientId: formData.clientId,
      planId: formData.planId,
      serverType: formData.serverType,
      port: port,
      status: 'active',
      listeners: 0,
      maxListeners: plan?.listeners || 50,
      createdAt: new Date().toISOString().split('T')[0],
      lastOnline: new Date().toISOString(),
      hasAutoDJ: formData.hasAutoDJ,
      streamUrl: `http://stream.${client?.name.toLowerCase().replace(/\s+/g, '')}.com:${port}`
    };

    setRadios([...radios, newRadio]);
    resetForm();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Radio creada",
      description: `${newRadio.name} ha sido creada exitosamente`
    });
  };

  const handleEditRadio = () => {
    if (!editingRadio || !formData.name || !formData.clientId || !formData.planId) {
      toast({
        title: "Error",
        description: "Nombre, cliente y plan son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const client = clients.find(c => c.id === formData.clientId);
    const plan = plans.find(p => p.id === formData.planId);
    const port = formData.port ? parseInt(formData.port) : editingRadio.port;

    const updatedRadios = radios.map(radio =>
      radio.id === editingRadio.id
        ? {
            ...radio,
            name: formData.name,
            clientId: formData.clientId,
            planId: formData.planId,
            serverType: formData.serverType,
            port: port,
            maxListeners: plan?.listeners || radio.maxListeners,
            hasAutoDJ: formData.hasAutoDJ,
            streamUrl: `http://stream.${client?.name.toLowerCase().replace(/\s+/g, '')}.com:${port}`
          }
        : radio
    );

    setRadios(updatedRadios);
    setEditingRadio(null);
    resetForm();
    
    toast({
      title: "Radio actualizada",
      description: "Los datos de la radio han sido actualizados"
    });
  };

  const handleDeleteRadio = (radioId: string) => {
    const radio = radios.find(r => r.id === radioId);
    setRadios(radios.filter(r => r.id !== radioId));
    
    toast({
      title: "Radio eliminada",
      description: `${radio?.name} ha sido eliminada`
    });
  };

  const toggleRadioStatus = (radioId: string) => {
    const updatedRadios = radios.map(radio =>
      radio.id === radioId
        ? { 
            ...radio, 
            status: (radio.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' | 'offline',
            listeners: radio.status === 'active' ? 0 : radio.listeners
          }
        : radio
    );

    setRadios(updatedRadios);
    const radio = updatedRadios.find(r => r.id === radioId);
    
    toast({
      title: radio?.status === 'active' ? "Radio activada" : "Radio suspendida",
      description: `${radio?.name} ha sido ${radio?.status === 'active' ? 'activada' : 'suspendida'}`
    });
  };

  const openEditDialog = (radio: Radio) => {
    setEditingRadio(radio);
    setFormData({
      name: radio.name,
      clientId: radio.clientId,
      planId: radio.planId,
      serverType: radio.serverType,
      port: radio.port.toString(),
      hasAutoDJ: radio.hasAutoDJ
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      clientId: '',
      planId: '',
      serverType: 'shoutcast',
      port: '',
      hasAutoDJ: false
    });
    setEditingRadio(null);
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente desconocido';
  };

  const getPlanName = (planId: string) => {
    return plans.find(p => p.id === planId)?.name || 'Plan desconocido';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Radios</h2>
          <p className="text-gray-600">Administra todas las radios Shoutcast/Icecast</p>
        </div>
        
        <Dialog open={isCreateDialogOpen || !!editingRadio} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Radio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRadio ? 'Editar Radio' : 'Crear Nueva Radio'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Radio *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mi Radio FM"
                  />
                </div>
                <div>
                  <Label htmlFor="port">Puerto (opcional)</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    placeholder={`Auto: ${getNextAvailablePort()}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.filter(c => c.status === 'active').map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="planId">Plan *</Label>
                  <Select value={formData.planId} onValueChange={(value) => setFormData({ ...formData, planId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.filter(p => p.isActive).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ${plan.price}/mes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="serverType">Tipo de Servidor</Label>
                <Select value={formData.serverType} onValueChange={(value: 'shoutcast' | 'icecast') => setFormData({ ...formData, serverType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shoutcast">Shoutcast</SelectItem>
                    <SelectItem value="icecast">Icecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="hasAutoDJ"
                  checked={formData.hasAutoDJ}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasAutoDJ: checked })}
                />
                <Label htmlFor="hasAutoDJ">Incluir AutoDJ</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingRadio ? handleEditRadio : handleCreateRadio}
                  className="flex-1"
                >
                  {editingRadio ? 'Actualizar' : 'Crear'} Radio
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar radios por nombre o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Radios List */}
      <div className="grid gap-4">
        {filteredRadios.map((radio) => (
          <Card key={radio.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${radio.status === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <RadioIcon className={`w-5 h-5 ${radio.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{radio.name}</h3>
                      <p className="text-sm text-gray-500">
                        {getClientName(radio.clientId)} • {getPlanName(radio.planId)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={radio.status === 'active' ? 'default' : 'destructive'}>
                        {radio.status === 'active' ? 'Activa' : 'Suspendida'}
                      </Badge>
                      <Badge variant="outline">
                        {radio.serverType.toUpperCase()}
                      </Badge>
                      {radio.hasAutoDJ && (
                        <Badge variant="secondary">AutoDJ</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Puerto: {radio.port}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{radio.listeners}/{radio.maxListeners} oyentes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      <a 
                        href={radio.streamUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        {radio.streamUrl}
                      </a>
                    </div>
                    <div>
                      <span>Creada: {new Date(radio.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRadioStatus(radio.id)}
                    className={radio.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {radio.status === 'active' ? (
                      <>
                        <Pause className="w-4 h-4 mr-1" />
                        Suspender
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Activar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(radio)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRadio(radio.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRadios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <RadioIcon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron radios</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera radio'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Radio
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
