import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Trash2, Plus, Image as ImageIcon, Palette, Layers, Tag, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product, ProductColor } from '../../types';

type ProductFormProps = {
  initialData?: Product; 
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
};

const PREDEFINED_CATEGORIES = ['Impresoras', 'Filamentos', 'Resinas', 'Repuestos', 'Servicios', 'Herramientas'];

export const ProductForm = ({ initialData, onSubmit, isSubmitting }: ProductFormProps) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: initialData || {
      title: '', price: 0, discount_price: 0, stock: 0, category: 'Impresoras', description: '', is_featured: false, is_on_offer: false
    }
  });

  // --- ESTADOS LOCALES ---
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [colors, setColors] = useState<ProductColor[]>(initialData?.colors || []);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  const [tempImg, setTempImg] = useState('');
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorHex, setTempColorHex] = useState('#000000');

  // --- VIGILANTES (WATCHERS) ---
  const isOnOffer = watch('is_on_offer');
  const selectedCategory = watch('category'); // <--- Vigilamos la categoría

  // Detectar si es servicio
  const isService = selectedCategory === 'Servicios';

  // EFECTO: Si selecciona Servicios, forzamos valores y limpiamos
  useEffect(() => {
    if (isService) {
        setValue('price', 0);
        setValue('stock', 999); // Stock infinito para que no salga "Agotado"
        setValue('is_on_offer', false);
        setValue('discount_price', 0);
    }
  }, [isService, setValue]);

  // Precargar datos al editar
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImages(initialData.images || []);
      
      let parsedColors: ProductColor[] = [];
      if (Array.isArray(initialData.colors)) {
          parsedColors = initialData.colors.map(c => typeof c === 'string' ? JSON.parse(c) : c);
      }
      setColors(parsedColors);

      if (initialData.category && !PREDEFINED_CATEGORIES.includes(initialData.category)) {
          setIsCustomCategory(true);
      }
    }
  }, [initialData, reset]);

  const addImage = () => { if (tempImg.trim()) { setImages([...images, tempImg]); setTempImg(''); } };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const addColor = () => {
    if (tempColorName.trim()) {
      setColors([...colors, { name: tempColorName, hex: tempColorHex }]);
      setTempColorName(''); setTempColorHex('#000000');
    }
  };
  const removeColor = (index: number) => setColors(colors.filter((_, i) => i !== index));

  const onFormSubmit = (data: any) => {
    const finalData = { ...data, images, colors };
    
    // Seguridad final antes de enviar
    if (!data.is_on_offer) finalData.discount_price = 0;
    
    // Si es servicio, aseguramos lógica de servicio
    if (data.category === 'Servicios') {
        finalData.price = 0;
        finalData.stock = 999;
    }

    onSubmit(finalData);
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <Row>
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold">Información Básica</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control {...register("title", { required: true })} placeholder="Ej: Impresión 3D a medida" />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><Layers size={16}/> Categoría</Form.Label>
                    {!isCustomCategory ? (
                        <Form.Select 
                            {...register("category")} 
                            onChange={(e) => {
                                if(e.target.value === 'custom') {
                                    setIsCustomCategory(true);
                                    setValue('category', ''); 
                                } else {
                                    setValue('category', e.target.value);
                                }
                            }}
                        >
                            {PREDEFINED_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="custom" className="fw-bold text-primary">+ Crear Nueva Categoría...</option>
                        </Form.Select>
                    ) : (
                        <InputGroup>
                             <Form.Control 
                                {...register("category", { required: true })} 
                                placeholder="Escribe la nueva categoría..." 
                                autoFocus
                             />
                             <Button variant="outline-secondary" onClick={() => setIsCustomCategory(false)}>Cancelar</Button>
                        </InputGroup>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock Real</Form.Label>
                    <Form.Control 
                        type="number" 
                        {...register("stock", { required: true })} 
                        disabled={isService} // <--- BLOQUEADO SI ES SERVICIO
                        className={isService ? 'bg-light text-muted' : ''}
                    />
                    {isService && <Form.Text className="text-info small">Stock infinito automático para servicios.</Form.Text>}
                  </Form.Group>
                </Col>
              </Row>

              {/* AVISO VISUAL SI ES SERVICIO */}
              {isService && (
                  <Alert variant="info" className="d-flex align-items-center py-2">
                      <Info size={18} className="me-2"/>
                      <span>Al ser un <strong>Servicio</strong>, el precio y stock se gestionan automáticamente (Se solicitará presupuesto).</span>
                  </Alert>
              )}

              {/* SECCIÓN DE PRECIOS Y OFERTAS */}
              <div className={`bg-light p-3 rounded border mb-3 ${isService ? 'opacity-50' : ''}`}>
                  <Row className="align-items-center">
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label>Precio Regular ($)</Form.Label>
                            <Form.Control 
                                type="number" 
                                {...register("price", { required: true })} 
                                disabled={isService} // <--- BLOQUEADO
                            />
                        </Form.Group>
                    </Col>
                    
                    <Col md={2} className="text-center pt-4">
                        <Form.Check 
                            type="switch"
                            id="offer-switch"
                            label="¿Oferta?"
                            {...register("is_on_offer")}
                            disabled={isService} // <--- BLOQUEADO
                            className="fw-bold text-danger"
                        />
                    </Col>
                    
                    <Col md={5}>
                        {isOnOffer && !isService && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                                <Form.Group>
                                    <Form.Label className="text-danger fw-bold"><Tag size={16}/> Precio Oferta ($)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        {...register("discount_price")} 
                                        className="border-danger bg-white"
                                    />
                                </Form.Group>
                            </motion.div>
                        )}
                    </Col>
                  </Row>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={4} {...register("description")} />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* GALERÍA */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold d-flex align-items-center gap-2">
               <ImageIcon size={18}/> Galería de Imágenes
            </Card.Header>
            <Card.Body>
               <InputGroup className="mb-3">
                 <Form.Control placeholder="Pegar URL de imagen..." value={tempImg} onChange={(e) => setTempImg(e.target.value)} />
                 <Button variant="outline-primary" onClick={addImage}><Plus size={18}/></Button>
               </InputGroup>
               <div className="d-flex flex-wrap gap-2">
                 {images.map((img, idx) => (
                   <div key={idx} className="position-relative border rounded overflow-hidden shadow-sm" style={{width: 80, height: 80}}>
                     <img src={img} alt="preview" className="w-100 h-100 object-fit-cover" />
                     <button type="button" className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0" style={{width: 20, height: 20, borderRadius: 0}} onClick={() => removeImage(idx)}>&times;</button>
                   </div>
                 ))}
               </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* COLORES (Ocultar si es servicio, opcional, pero mejor dejarlo por si acaso) */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold d-flex align-items-center gap-2">
               <Palette size={18}/> Variantes de Color
            </Card.Header>
            <Card.Body>
              <Row className="g-2 mb-2">
                <Col xs={3}><Form.Control type="color" value={tempColorHex} onChange={(e) => setTempColorHex(e.target.value)} className="p-1 h-100" /></Col>
                <Col xs={6}><Form.Control placeholder="Nombre" value={tempColorName} onChange={(e) => setTempColorName(e.target.value)} /></Col>
                <Col xs={3}><Button variant="outline-primary" className="w-100" onClick={addColor}>Add</Button></Col>
              </Row>
              <div className="d-flex flex-column gap-2 mt-3">
                {colors.map((c, idx) => (
                   <div key={idx} className="d-flex justify-content-between align-items-center border p-2 rounded bg-light">
                      <div className="d-flex align-items-center gap-2">
                         <div className="rounded-circle border" style={{width: 20, height: 20, backgroundColor: c.hex}}></div>
                         <span className="small fw-bold">{c.name}</span>
                      </div>
                      <Trash2 size={16} className="text-danger cursor-pointer" onClick={() => removeColor(idx)} />
                   </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          <div className="d-grid">
             <Button variant="primary" size="lg" type="submit" disabled={isSubmitting}>
               {isSubmitting ? 'Guardando...' : '💾 GUARDAR PRODUCTO'}
             </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
};