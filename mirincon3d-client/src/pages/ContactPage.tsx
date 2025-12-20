import { useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const serviceName = searchParams.get('service'); // Captura "?service=Nombre"
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (serviceName) {
      setValue('subject', `Consulta sobre: ${serviceName}`);
    }
  }, [serviceName, setValue]);

  const onSubmit = (data: any) => {
    console.log("Enviando formulario:", data);
    alert("¡Mensaje enviado! (Pronto conectaremos esto al backend de correo)");
  };

  return (
    <Container className="py-5">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-center fw-bold mb-5 display-5">Contáctanos</h1>
        
        <Row className="g-5">
          {/* INFORMACIÓN DE CONTACTO */}
          <Col lg={5}>
            <div className="pe-lg-5">
              <h3 className="fw-bold mb-4">Hablemos de tu proyecto</h3>
              <p className="text-muted mb-4 fs-5">
                ¿Tienes una idea en mente? En MIRINCON3D hacemos realidad tus prototipos y piezas técnicas.
              </p>
              
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary text-white p-3 rounded-circle me-3">
                  <Phone size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">WhatsApp / Teléfono</h6>
                  <p className="text-muted mb-0">+54 11 1234 5678</p>
                </div>
              </div>

              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary text-white p-3 rounded-circle me-3">
                  <Mail size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Email</h6>
                  <p className="text-muted mb-0">ventas@mirincon3d.com</p>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-primary text-white p-3 rounded-circle me-3">
                  <MapPin size={24} />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Ubicación</h6>
                  <p className="text-muted mb-0">Buenos Aires, Argentina</p>
                </div>
              </div>
            </div>
          </Col>

          {/* FORMULARIO */}
          <Col lg={7}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              <Card.Body className="p-5">
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control {...register("name", { required: true })} placeholder="Tu nombre" />
                        {errors.name && <span className="text-danger small">Campo requerido</span>}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control {...register("email", { required: true })} type="email" placeholder="tucorreo@ejemplo.com" />
                        {errors.email && <span className="text-danger small">Campo requerido</span>}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Asunto</Form.Label>
                    <Form.Control {...register("subject", { required: true })} placeholder="Motivo de consulta" />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Mensaje</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={5} 
                      {...register("message", { required: true })} 
                      placeholder="Cuéntanos sobre tu proyecto, medidas, materiales..." 
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="dark" size="lg" type="submit" className="fw-bold">
                      <Send size={18} className="me-2" /> Enviar Mensaje
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};