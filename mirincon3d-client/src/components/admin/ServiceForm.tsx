import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Plus, Image as ImageIcon } from 'lucide-react';
import type { Product } from '../../types';

type ServiceFormProps = {
  initialData?: Product;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
};

export const ServiceForm = ({ initialData, onSubmit, isSubmitting }: ServiceFormProps) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialData || {
      title: '', description: ''
    }
  });

  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [tempImg, setTempImg] = useState('');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImages(initialData.images || []);
    }
  }, [initialData, reset]);

  const addImage = () => { if (tempImg.trim()) { setImages([...images, tempImg]); setTempImg(''); } };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const onFormSubmit = (data: any) => {
    // Datos forzados para que sea un Servicio válido en la DB
    const servicePayload = {
        ...data,
        images,
        category: 'Servicios', // Categoría fija
        price: 0,             // Precio 0
        stock: 999,           // Stock infinito
        is_on_offer: false,
        discount_price: 0,
        colors: []            // Servicios usualmente no tienen selector de color
    };
    onSubmit(servicePayload);
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <Row>
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold">Información del Servicio</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Título del Servicio</Form.Label>
                <Form.Control {...register("title", { required: true })} placeholder="Ej: Impresión 3D a Medida" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción Detallada</Form.Label>
                <Form.Control 
                    as="textarea" 
                    rows={6} 
                    {...register("description", { required: true })} 
                    placeholder="Describe en qué consiste el servicio, materiales, tiempos estimados, etc."
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold d-flex align-items-center gap-2">
               <ImageIcon size={18}/> Galería / Portafolio
            </Card.Header>
            <Card.Body>
               <InputGroup className="mb-3">
                 <Form.Control placeholder="URL de imagen..." value={tempImg} onChange={(e) => setTempImg(e.target.value)} />
                 <Button variant="outline-primary" onClick={addImage}><Plus size={18}/></Button>
               </InputGroup>
               <div className="d-flex flex-wrap gap-2">
                 {images.map((img, idx) => (
                   <div key={idx} className="position-relative border rounded overflow-hidden" style={{width: 80, height: 80}}>
                     <img src={img} alt="preview" className="w-100 h-100 object-fit-cover" />
                     <button type="button" className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0" onClick={() => removeImage(idx)}>&times;</button>
                   </div>
                 ))}
               </div>
               <small className="text-muted mt-2 d-block">Agrega fotos de trabajos realizados.</small>
            </Card.Body>
          </Card>

          <div className="d-grid">
             <Button variant="dark" size="lg" type="submit" disabled={isSubmitting}>
               {isSubmitting ? 'Guardando...' : '💾 GUARDAR SERVICIO'}
             </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};