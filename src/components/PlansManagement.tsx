
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockPlans } from '@/data/mockData';
import { Plan } from '@/types';
import { 
  Plus, 
  Edit,
  Trash2,
  HardDrive,
  Users,
  Zap,
  DollarSign,
  Check
} from 'lucide-react';

export default function PlansManagement() {
  const [plans, setPlans] = useLocalStorage<Plan[]>('radiopanel_plans', mockPlans);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    diskSpace: '',
    listeners: '',
    bitrate: '',
    price: '',
    features: '',
    isActive: true
  });

  const handleCreatePlan = () => {
    if (!formData.name || !formData.diskSpace || !formData.listeners || !formData.bitrate || !formData.price) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const newPlan: Plan = {
      id: Date.now().toString(),
      name: formData.name,
      diskSpace: parseInt(formData.diskSpace),
      listeners: parseInt(formData.listeners),
      bitrate: parseInt(formData.bitrate),
      price: parseFloat(formData.price),
      features: formData.features.split('\n').filter(f => f.trim()),
      isActive: formData.isActive
    };

    setPlans([...plans, newPlan]);
    resetForm();
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Plan creado",
      description: `${newPlan.name} ha sido creado exitosamente`
    });
  };

  const handleEditPlan = () => {
    if (!editingPlan || !formData.name || !formData.diskSpace || !formData.listeners || !formData.bitrate || !formData.price) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      });
      return;
    }

    const updatedPlans = plans.map(plan =>
      plan.id === editingPlan.id
        ? {
            ...plan,
            name: formData.name,
            diskSpace: parseInt(formData.diskSpace),
            listeners: parseInt(formData.listeners),
            bitrate: parseInt(formData.bitrate),
            price: parseFloat(formData.price),
            features: formData.features.split('\n').filter(f => f.trim()),
            isActive: formData.isActive
          }
        : plan
    );

    setPlans(updatedPlans);
    setEditingPlan(null);
    resetForm();
    
    toast({
      title: "Plan actualizado",
      description: "Los datos del plan han sido actualizados"
    });
  };

  const handleDeletePlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    setPlans(plans.filter(p => p.id !== planId));
    
    toast({
      title: "Plan eliminado",
      description: `${plan?.name} ha sido eliminado`
    });
  };

  const togglePlanStatus = (planId: string) => {
    const updatedPlans = plans.map(plan =>
      plan.id === planId
        ? { ...plan, isActive: !plan.isActive }
        : plan
    );

    setPlans(updatedPlans);
    const plan = updatedPlans.find(p => p.id === planId);
    
    toast({
      title: plan?.isActive ? "Plan activado" : "Plan desactivado",
      description: `${plan?.name} ha sido ${plan?.isActive ? 'activado' : 'desactivado'}`
    });
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      diskSpace: plan.diskSpace.toString(),
      listeners: plan.listeners.toString(),
      bitrate: plan.bitrate.toString(),
      price: plan.price.toString(),
      features: plan.features.join('\n'),
      isActive: plan.isActive
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      diskSpace: '',
      listeners: '',
      bitrate: '',
      price: '',
      features: '',
      isActive: true
    });
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Planes</h2>
          <p className="text-gray-600">Configura los planes de radio disponibles</p>
        </div>
        
        <Dialog open={isCreateDialogOpen || !!editingPlan} onOpenChange={(open) => {
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
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Plan *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Plan Básico"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio Mensual ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="19.99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="diskSpace">Espacio en Disco (GB) *</Label>
                  <Input
                    id="diskSpace"
                    type="number"
                    value={formData.diskSpace}
                    onChange={(e) => setFormData({ ...formData, diskSpace: e.target.value })}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="listeners">Máx. Oyentes *</Label>
                  <Input
                    id="listeners"
                    type="number"
                    value={formData.listeners}
                    onChange={(e) => setFormData({ ...formData, listeners: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="bitrate">Bitrate (kbps) *</Label>
                  <Input
                    id="bitrate"
                    type="number"
                    value={formData.bitrate}
                    onChange={(e) => setFormData({ ...formData, bitrate: e.target.value })}
                    placeholder="128"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Características (una por línea)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Streaming 24/7&#10;Panel de control&#10;Estadísticas básicas"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Plan activo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={editingPlan ? handleEditPlan : handleCreatePlan}
                  className="flex-1"
                >
                  {editingPlan ? 'Actualizar' : 'Crear'} Plan
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

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden ${plan.isActive ? '' : 'opacity-60'}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${plan.price}
                <span className="text-sm font-normal text-gray-500">/mes</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Plan specs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <HardDrive className="w-4 h-4 text-gray-500" />
                  <span>{plan.diskSpace} GB de espacio</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Hasta {plan.listeners} oyentes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span>{plan.bitrate} kbps calidad</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Características:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePlanStatus(plan.id)}
                  className="flex-1"
                >
                  {plan.isActive ? 'Desactivar' : 'Activar'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(plan)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <DollarSign className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes configurados</h3>
            <p className="text-gray-600 mb-4">
              Comienza creando tu primer plan de radio
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
