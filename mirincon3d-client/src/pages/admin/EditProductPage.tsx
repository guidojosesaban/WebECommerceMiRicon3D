import { useEffect, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ProductForm } from '../../components/admin/ProductForm';
import type { Product } from '../../types';

export const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error cargando producto", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await api.put(`/products/${id}`, formData);
      alert("¡Producto actualizado correctamente!");
      navigate('/admin/products');
    } catch (error) {
      alert("Error al actualizar");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if (!product) return <Container className="py-5"><Alert variant="danger">Producto no encontrado</Alert></Container>;

  return (
    <Container className="py-5">
      <h2 className="mb-4 fw-bold text-primary">Editar Producto #{id}</h2>
      <ProductForm initialData={product} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
    </Container>
  );
};