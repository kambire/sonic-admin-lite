import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockClients } from '@/data/mockData';
import { Client } from '@/types';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-react';

export default function ClientsManagement() {
  const [clients, setClients] = useLocalStorage<Client[]>('radiopanel_clients', mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Nombre y email son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setClients([...clients, newClient]);
    setFormData({ name: '', email: '', phone: '' });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Cliente creado",
      description: `${newClient.name} ha sido agregado exitosamente`
    });
  };

  const handleEditClient = () => {
    if (!editingClient || !formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Nombre y email son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const updatedClients = clients.map(client =>
      client.id === editingClient.id
        ? { ...client, name: formData.name, email: formData.email, phone: formData.phone }
        : client
    );

    setClients(updatedClients);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '' });
    
    toast({
      title: "Cliente actualizado",
      description: "Los datos del cliente han sido actualizados"
    });
  };

  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setClients(clients.filter(c => c.id !== clientId));
    
    toast({
      title: "Cliente eliminado",
      description: `${client?.name} ha sido eliminado`
    });
  };

  const toggleClientStatus = (clientId: string) => {
    const updatedClients = clients.map(client =>
      client.id === clientId
        ? { ...client, status: (client.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended' }
        : client
    );

    setClients(updatedClients);
    const client = updatedClients.find(c => c.id === clientId);
    
    toast({
      title: client?.status === 'active' ? "Cliente activado" : "Cliente suspendido",
      description: `${client?.name} ha sido ${client?.status === 'active' ? 'activado' : 'suspendido'}`
    });
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-gray-600">Administra todos los clientes y sus estados</p>
        </div>
        
        <Dialog open={isCreateDialogOpen || !!editingClient} onOpenChange={(open) => {
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
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+34 666 123 456"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingClient ? handleEditClient : handleCreateClient}
                  className="flex-1"
                >
                  {editingClient ? 'Actualizar' : 'Crear'} Cliente
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
              placeholder="Buscar clientes por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
                      {client.status === 'active' ? 'Activo' : 'Suspendido'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {new Date(client.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleClientStatus(client.id)}
                    className={client.status === 'active' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {client.status === 'active' ? (
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
                    onClick={() => openEditDialog(client)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
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

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primer cliente'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
