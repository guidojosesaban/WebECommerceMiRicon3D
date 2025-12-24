import { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2} from 'lucide-react';
import api from '../../api/axios';
import type { Product } from '../../types';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de ELIMINAR este producto? Esta acción no se puede deshacer.")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h2 className="fw-bold mb-0">Gestión de Productos</h2>
           <p className="text-muted">Administra tu inventario desde aquí</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/create-product')} className="fw-bold d-flex align-items-center gap-2">
           <Plus size={18}/> Nuevo Producto
        </Button>
      </div>

      <div className="table-responsive bg-white rounded shadow-sm p-3">
        <Table hover align="center">
          <thead className="bg-light">
            <tr>
              <th>Img</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{width: 80}}>
                   <Image src={p.images[0] || 'https://placehold.co/50'} rounded style={{width: 50, height: 50, objectFit: 'cover'}} />
                </td>
                <td className="fw-medium">{p.title}</td>
                <td>${Number(p.price).toLocaleString()}</td>
                <td>
                   {p.stock === 0 ? (
                      <Badge bg="danger">AGOTADO</Badge>
                   ) : p.stock < 5 ? (
                      <Badge bg="warning" text="dark">{p.stock} (Bajo)</Badge>
                   ) : (
                      <Badge bg="success">{p.stock}</Badge>
                   )}
                </td>
                <td><Badge bg="secondary">{p.category}</Badge></td>
                <td className="text-end">
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/admin/edit-product/${p.id}`)}>
                     <Edit size={16}/>
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(p.id)}>
                     <Trash2 size={16}/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};