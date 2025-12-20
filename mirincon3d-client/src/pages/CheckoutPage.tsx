import { useForm } from 'react-hook-form';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useState } from 'react';
import { CreditCard, Truck } from 'lucide-react';

export const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // Preparamos el payload como lo espera el backend
      const orderData = {
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity })),
        shipping_address: {
            country: data.country,
            province: data.province,
            city: data.city,
            zip: data.zip,
            address: data.address, // Calle y número
            cross_streets: data.cross_streets,
            reference: data.reference
        }
      };

      await api.post('/orders', orderData);
      clearCart();
      // Redirigimos a Mis Pedidos para que vea la barra de progreso
      navigate('/orders'); 
      alert("¡Pedido creado! Revisa tu correo para los datos de transferencia.");
      
    } catch (err: any) {
      setError(err.response?.data?.msg || "Error al procesar el pedido");
    }
  };

  if (cart.length === 0) return <Container className="py-5 text-center"><h2>Tu carrito está vacío</h2></Container>;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">Finalizar Compra</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          {/* COLUMNA DATOS DE ENVÍO */}
          <Col lg={8}>
            <Card className="shadow-sm mb-4 border-0">
              <Card.Header className="bg-white py-3 fw-bold"><Truck size={18} className="me-2"/> Datos de Entrega</Card.Header>
              <Card.Body>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>País</Form.Label>
                            <Form.Control {...register("country", { required: true })} defaultValue="Argentina" />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Provincia</Form.Label>
                            <Form.Control {...register("province", { required: true })} placeholder="Ej: Buenos Aires" />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Ciudad / Localidad</Form.Label>
                            <Form.Control {...register("city", { required: true })} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Código Postal</Form.Label>
                            <Form.Control {...register("zip", { required: true })} />
                        </Form.Group>
                    </Col>
                </Row>
                
                <Form.Group className="mb-3">
                    <Form.Label>Dirección (Calle y Altura)</Form.Label>
                    <Form.Control {...register("address", { required: true })} placeholder="Ej: Av. Siempreviva 742" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Entre Calles (Opcional)</Form.Label>
                    <Form.Control {...register("cross_streets")} placeholder="Ej: Entre calle A y calle B" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Referencias (Clave para el delivery)</Form.Label>
                    <Form.Control as="textarea" rows={2} {...register("reference")} placeholder="Ej: Portón negro, enfrente del kiosco..." />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3 fw-bold"><CreditCard size={18} className="me-2"/> Forma de Pago</Card.Header>
                <Card.Body>
                    <Form.Check 
                        type="radio" 
                        label="Transferencia Bancaria (Datos al finalizar)" 
                        checked 
                        readOnly 
                    />
                    <Alert variant="info" className="mt-3 small">
                        Al confirmar, recibirás un correo con el CBU/Alias para transferir. Tu pedido se procesará una vez recibido el comprobante.
                    </Alert>
                </Card.Body>
            </Card>
          </Col>

          {/* COLUMNA RESUMEN */}
          <Col lg={4}>
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <h5 className="fw-bold mb-4">Resumen del Pedido</h5>
                    {cart.map(item => (
                        <div key={item.id} className="d-flex justify-content-between mb-2 small">
                            <span>{item.quantity}x {item.title}</span>
                            <span>${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                        <span>Total</span>
                        <span>${totalPrice.toLocaleString()}</span>
                    </div>
                    <Button variant="primary" type="submit" size="lg" className="w-100 mt-4" disabled={isSubmitting}>
                        {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                    </Button>
                </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};