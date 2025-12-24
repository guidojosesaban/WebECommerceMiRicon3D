import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Trash2, Plus, Image as ImageIcon, Palette, Layers, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product, ProductColor } from '../../types';

type ProductFormProps = {
  initialData?: Product; // Opcional: Si viene, es edición
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
};

// Categorías base para ayudar al admin
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
  
  // Inputs temporales
  const [tempImg, setTempImg] = useState('');
  const [tempColorName, setTempColorName] = useState('');
  const [tempColorHex, setTempColorHex] = useState('#000000');

  // Observar cambios para lógica visual
  const isOnOffer = watch('is_on_offer');

  // Precargar datos al editar
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImages(initialData.images || []);
      
      // Parsear colores si vienen como string desde base de datos vieja
      let parsedColors: ProductColor[] = [];
      if (Array.isArray(initialData.colors)) {
          parsedColors = initialData.colors.map(c => typeof c === 'string' ? JSON.parse(c) : c);
      }
      setColors(parsedColors);

      // Detectar si la categoría guardada NO está en la lista predefinida (es custom)
      if (initialData.category && !PREDEFINED_CATEGORIES.includes(initialData.category)) {
          setIsCustomCategory(true);
      }
    }
  }, [initialData, reset]);

  // --- HANDLERS LISTAS ---
  const addImage = () => { if (tempImg.trim()) { setImages([...images, tempImg]); setTempImg(''); } };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const addColor = () => {
    if (tempColorName.trim()) {
      setColors([...colors, { name: tempColorName, hex: tempColorHex }]);
      setTempColorName(''); setTempColorHex('#000000');
    }
  };
  const removeColor = (index: number) => setColors(colors.filter((_, i) => i !== index));

  // --- PREPARAR ENVÍO ---
  const onFormSubmit = (data: any) => {
    const finalData = { ...data, images, colors };
    
    // Limpieza de datos: Si no está en oferta, el precio descuento debe ser 0
    if (!data.is_on_offer) {
        finalData.discount_price = 0;
    }

    onSubmit(finalData);
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <Row>
        <Col md={8}>
          {/* INFO BÁSICA */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold">Información Básica</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Título del Producto</Form.Label>
                <Form.Control {...register("title", { required: true })} placeholder="Ej: Ender 3 V3 SE" />
              </Form.Group>
              
              <Row>
                {/* LÓGICA DE CATEGORÍA PERSONALIZADA */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><Layers size={16}/> Categoría</Form.Label>
                    {!isCustomCategory ? (
                        <Form.Select 
                            {...register("category")} 
                            onChange={(e) => {
                                if(e.target.value === 'custom') {
                                    setIsCustomCategory(true);
                                    setValue('category', ''); // Limpiar valor para que escriba
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
                             <Button variant="outline-secondary" onClick={() => setIsCustomCategory(false)}>
                                Cancelar
                             </Button>
                        </InputGroup>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock Real</Form.Label>
                    <Form.Control type="number" {...register("stock", { required: true })} />
                  </Form.Group>
                </Col>
              </Row>

              {/* SECCIÓN DE PRECIOS Y OFERTAS */}
              <div className="bg-light p-3 rounded border mb-3">
                  <Row className="align-items-center">
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label>Precio Regular ($)</Form.Label>
                            <Form.Control type="number" {...register("price", { required: true })} />
                        </Form.Group>
                    </Col>
                    
                    <Col md={2} className="text-center pt-4">
                        <Form.Check 
                            type="switch"
                            id="offer-switch"
                            label="¿Oferta?"
                            {...register("is_on_offer")}
                            className="fw-bold text-danger"
                        />
                    </Col>
                    
                    <Col md={5}>
                        {isOnOffer && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                                <Form.Group>
                                    <Form.Label className="text-danger fw-bold"><Tag size={16}/> Precio Oferta ($)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        {...register("discount_price", { required: isOnOffer })} 
                                        className="border-danger bg-white"
                                    />
                                    <Form.Text className="text-muted small">Debe ser menor al regular</Form.Text>
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

          {/* GALERÍA DE IMÁGENES */}
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
                 {images.length === 0 && <span className="text-muted small">Sin imágenes.</span>}
               </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* COLORES */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white fw-bold d-flex align-items-center gap-2">
               <Palette size={18}/> Variantes de Color
            </Card.Header>
            <Card.Body>
              <Row className="g-2 mb-2">
                <Col xs={3}>
                  <Form.Control type="color" value={tempColorHex} onChange={(e) => setTempColorHex(e.target.value)} className="p-1 h-100" />
                </Col>
                <Col xs={6}>
                  <Form.Control placeholder="Nombre" value={tempColorName} onChange={(e) => setTempColorName(e.target.value)} />
                </Col>
                <Col xs={3}>
                  <Button variant="outline-primary" className="w-100" onClick={addColor}>Add</Button>
                </Col>
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