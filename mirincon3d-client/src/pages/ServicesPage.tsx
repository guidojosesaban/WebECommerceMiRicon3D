import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MessageCircle } from 'lucide-react';
import type { Product } from '../types';

export const ServicesPage = () => {
  const [services, setServices] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/products');
        // Filtramos solo los que son categoría 'Servicios'
        const servicesData = (Array.isArray(data) ? data : []).filter((p: any) => p.category === 'Servicios');
        setServices(servicesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold display-5">Nuestros Servicios 3D</h1>
        <p className="text-muted lead">Soluciones personalizadas para tus ideas y proyectos.</p>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {services.map(service => (
            <Col key={service.id}>
                <Card className="h-100 border-0 shadow-sm hover-card overflow-hidden">
                    <div style={{ height: '250px', overflow: 'hidden' }}>
                        <Card.Img 
                            variant="top" 
                            src={service.images[0] || 'https://placehold.co/400'} 
                            className="h-100 w-100 object-fit-cover transition-transform"
                        />
                    </div>
                    <Card.Body className="d-flex flex-column p-4">
                        <Card.Title className="fw-bold fs-4 mb-3">{service.title}</Card.Title>
                        <Card.Text className="text-muted flex-grow-1">
                            {service.description?.substring(0, 120)}...
                        </Card.Text>
                        
                        <div className="d-grid mt-4">
                            <Button 
                                variant="outline-primary" 
                                className="fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                                onClick={() => navigate(`/contacto?service=${encodeURIComponent(service.title)}`)}
                            >
                                <MessageCircle size={18} /> Solicitar Presupuesto
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        ))}
      </Row>

      {services.length === 0 && (
        <div className="text-center py-5 text-muted">
            <h3>Próximamente agregaremos nuestros servicios.</h3>
        </div>
      )}
    </Container>
  );
};