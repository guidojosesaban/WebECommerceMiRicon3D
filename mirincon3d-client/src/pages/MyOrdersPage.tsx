import { useEffect, useState } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { OrderProgress } from '../components/common/OrderProgress';

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(res => {
        // El backend devuelve { success: true, orders: [...] }
        setOrders(res.data.orders || res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Mis Pedidos</h2>
      {orders.length === 0 ? (
        <p>No tienes pedidos aún.</p>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="shadow-sm border-0">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <strong>Pedido #{order.id}</strong>
                <span className="text-muted small">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </Card.Header>
              <Card.Body>
                {/* BARRA DE PROGRESO */}
                <OrderProgress status={order.status} />
                
                <hr />
                <div className="d-flex justify-content-between">
                  <span>
                    Total: <strong>${Number(order.total_amount).toLocaleString()}</strong>
                  </span>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};