import { useState } from 'react';
import { Container } from 'react-bootstrap';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/admin/ProductForm';

export const CreateProductPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      // is_on_offer y is_featured por defecto
      await api.post('/products', { ...data, is_on_offer: false, is_featured: true });
      alert("¡Producto creado!");
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert("Error creando producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-success">Crear Nuevo Producto</h2>
      <ProductForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </Container>
  );
};