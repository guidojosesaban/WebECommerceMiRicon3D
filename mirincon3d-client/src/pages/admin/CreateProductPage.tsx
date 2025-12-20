import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Definimos los campos del formulario
type ProductForm = {
  title: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  imageUrl: string; // Por ahora usaremos una URL directa para simplificar
};

export const CreateProductPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductForm>();
  const [serverMsg, setServerMsg] = useState<{type: 'error'|'success', text: string} | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: ProductForm) => {
    try {
      setServerMsg(null);
      // El backend espera 'images' como array de strings
      const payload = {
        ...data,
        images: [data.imageUrl], // Convertimos la URL única en un array
        is_on_offer: false,
        is_featured: true
      };

      await api.post('/products', payload);
      
      setServerMsg({ type: 'success', text: '¡Producto creado exitosamente!' });
      // Opcional: navegar al home después de 2 segundos
      setTimeout(() => navigate('/'), 2000);

    } catch (error: any) {
      console.error(error);
      setServerMsg({ type: 'error', text: error.response?.data?.msg || 'Error al crear producto' });
    }
  };

  return (
    <Container className="py-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="mb-4 fw-bold text-primary">Panel de Administración: Nuevo Producto</h2>
        
        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            {serverMsg && <Alert variant={serverMsg.type === 'error' ? 'danger' : 'success'}>{serverMsg.text}</Alert>}

            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre del Producto</Form.Label>
                    <Form.Control 
                      {...register("title", { required: "El título es obligatorio" })} 
                      placeholder="Ej: Ender 3 V3 SE"
                      isInvalid={!!errors.title}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Precio ($)</Form.Label>
                    <Form.Control 
                      type="number" 
                      step="0.01"
                      {...register("price", { required: "Precio requerido", min: 1 })} 
                      isInvalid={!!errors.price}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock Inicial</Form.Label>
                    <Form.Control 
                      type="number"
                      {...register("stock", { required: true, min: 0 })} 
                      defaultValue={10}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select {...register("category")}>
                      <option value="Impresoras">Impresoras</option>
                      <option value="Insumos">Insumos</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Repuestos">Repuestos</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>URL de Imagen</Form.Label>
                    <Form.Control 
                      {...register("imageUrl", { required: "Necesitamos una foto" })} 
                      placeholder="https://..."
                      isInvalid={!!errors.imageUrl}
                    />
                    <Form.Text className="text-muted">
                      Puedes usar una URL de Google Images o Imgur por ahora.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Descripción Técnica</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  {...register("description", { required: true })}
                  placeholder="Detalles técnicos, volumen de impresión, material..." 
                />
              </Form.Group>

              <Button variant="primary" type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : '💾 Guardar Producto en Neon'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};