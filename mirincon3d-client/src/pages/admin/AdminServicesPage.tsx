import { useEffect, useState } from 'react';
import { Container, Table, Button, Image} from 'react-bootstrap';
import { Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import type { Product } from '../../types';
import { ServiceForm } from '../../components/admin/ServiceForm';
import { Modal } from 'react-bootstrap';

export const AdminServicesPage = () => {
  const [services, setServices] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Product | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    // Reutilizamos el endpoint pero filtramos en el front o pedimos por query si implementamos filtro
    const { data } = await api.get('/products');
    const servicesOnly = (Array.isArray(data) ? data : []).filter((p: Product) => p.category === 'Servicios');
    setServices(servicesOnly);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingService) {
        await api.put(`/products/${editingService.id}`, data);
      } else {
        await api.post('/products', { ...data, is_featured: true });
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      alert("Error al guardar servicio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Borrar este servicio?")) return;
    await api.delete(`/products/${id}`);
    fetchServices();
  };

  const openCreate = () => { setEditingService(undefined); setShowModal(true); };
  const openEdit = (s: Product) => { setEditingService(s); setShowModal(true); };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h2 className="fw-bold mb-0">Gestión de Servicios</h2>
           <p className="text-muted">Administra tu portafolio de servicios</p>
        </div>
        <Button variant="dark" onClick={openCreate} className="fw-bold d-flex align-items-center gap-2">
           <Plus size={18}/> Nuevo Servicio
        </Button>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm p-3">
        <Table hover align="center">
          <thead className="bg-light">
            <tr>
              <th>Img</th>
              <th>Título</th>
              <th>Descripción Breve</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td style={{width: 80}}>
                   <Image src={s.images[0] || 'https://placehold.co/50'} rounded style={{width: 50, height: 50, objectFit: 'cover'}} />
                </td>
                <td className="fw-bold">{s.title}</td>
                <td className="text-muted small text-truncate" style={{maxWidth: '300px'}}>{s.description}</td>
                <td className="text-end">
                  <Button variant="outline-dark" size="sm" className="me-2" onClick={() => openEdit(s)}><Edit size={16}/></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(s.id)}><Trash2 size={16}/></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {services.length === 0 && <p className="text-center py-3 text-muted">No hay servicios creados.</p>}
      </div>

      {/* MODAL PARA CREAR/EDITAR EN LA MISMA PÁGINA */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
            <Modal.Title>{editingService ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ServiceForm initialData={editingService} onSubmit={handleSave} isSubmitting={isSubmitting} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};