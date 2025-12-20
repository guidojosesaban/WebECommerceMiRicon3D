import { useEffect, useState } from 'react';
import { Container, Table, Form, Badge, Spinner } from 'react-bootstrap';
import api from '../../api/axios';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/all');
      
      // ✅ El backend devuelve { success: true, orders: [...] }
      setOrders(data.orders || []); // Acceder a data.orders
      
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchOrders(); 
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    if (!confirm('¿Cambiar estado del pedido?')) return;
    
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      fetchOrders(); // Recargar tabla
    } catch (error) {
      console.error('Error actualizando:', error);
      alert("Error actualizando el estado");
    }
  };

  // ✅ Cambiar JSX.Element por ReactNode
  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      pending: <Badge bg="secondary">Solicitud</Badge>,
      processing: <Badge bg="warning" text="dark">Construcción</Badge>,
      shipped: <Badge bg="primary">Enviado</Badge>,
      delivered: <Badge bg="success">Entregado</Badge>,
      cancelled: <Badge bg="danger">Cancelado</Badge>
    };
    return badges[status] || <Badge bg="secondary">{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Cargando pedidos...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-5 px-4">
      <h2 className="mb-4 fw-bold">Gestión de Pedidos (Admin)</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No hay pedidos registrados aún.</p>
        </div>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm p-3">
          <Table hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>
                    <div className="fw-semibold">{order.full_name}</div>
                    <small className="text-muted">{order.email}</small>
                    {order.phone && (
                      <small className="d-block text-muted">📱 {order.phone}</small>
                    )}
                  </td>
                  <td>
                    <small>{new Date(order.created_at).toLocaleDateString('es-AR')}</small>
                  </td>
                  <td className="fw-semibold">
                    ${Number(order.total_amount).toLocaleString('es-AR')}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Form.Select 
                      size="sm" 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ maxWidth: '200px' }}
                    >
                      <option value="pending">📝 Solicitud</option>
                      <option value="processing">🔨 En Construcción</option>
                      <option value="shipped">📦 Listo / Enviado</option>
                      <option value="delivered">✅ Entregado</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};