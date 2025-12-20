import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import  type { Product } from '../types';
import { motion } from 'framer-motion';
import { ArrowRight, PenTool } from 'lucide-react';

export const ServicesPage = () => {
  const [services, setServices] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/products');
        // Filtramos solo lo que sea categoría Servicios
        const serviceItems = data.filter((p: Product) => p.category === 'Servicios');
        setServices(serviceItems);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <div className="text-center py-5"><Spinner animation="border"/></div>;

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold display-5">Soluciones a Medida</h1>
        <p className="text-muted fs-5">No solo vendemos impresoras, creamos soluciones.</p>
      </div>

      {services.length === 0 ? (
         <div className="text-center py-5 bg-light rounded">
            <h3>Aún no hay servicios cargados.</h3>
            <p>Ve al panel Admin y crea un producto con categoría "Servicios".</p>
         </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {services.map((service, idx) => (
            <Col key={service.id}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                  <div style={{ height: '220px', overflow: 'hidden' }}>
                     <Card.Img 
                        variant="top" 
                        src={service.images[0]} 
                        className="h-100 object-fit-cover"
                     />
                  </div>
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="mb-2 text-primary">
                        <PenTool size={24} />
                    </div>
                    <Card.Title className="fw-bold fs-4">{service.title}</Card.Title>
                    <Card.Text className="text-muted flex-grow-1">
                      {service.description}
                    </Card.Text>
                    
                    <Link to={`/contacto?service=${encodeURIComponent(service.title)}`}>
                        <Button variant="outline-dark" className="w-100 fw-bold mt-3">
                            Solicitar Presupuesto <ArrowRight size={18} className="ms-2" />
                        </Button>
                    </Link>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};