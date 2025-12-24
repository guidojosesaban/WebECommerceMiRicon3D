import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge, Spinner, Carousel, Alert } from 'react-bootstrap';
import { ShoppingCart, ArrowLeft, Check, AlertTriangle, Tag } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import type { Product, ProductColor } from '../types';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        // Parsear colores si vienen como string (compatibilidad)
        if (data.colors && data.colors.length > 0 && typeof data.colors[0] === 'string') {
            data.colors = data.colors.map((c: string) => JSON.parse(c));
        }
        setProduct(data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!product) return <Container className="text-center py-5"><h3>No encontrado</h3></Container>;

  const hasStock = product.stock > 0;
  const isService = product.category === 'Servicios';
  
  // Calcular porcentaje de ahorro
  const discountPercent = product.is_on_offer && product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <Container className="py-5">
      <Button variant="link" className="text-decoration-none text-muted mb-4 ps-0" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} className="me-1" /> Volver atrás
      </Button>

      <Row className="g-5">
        {/* COLUMNA 1: GALERÍA / CARRUSEL */}
        <Col md={6}>
          <div className="border rounded-4 overflow-hidden shadow-sm bg-white">
            {product.images && product.images.length > 1 ? (
                <Carousel>
                    {product.images.map((img, idx) => (
                        <Carousel.Item key={idx}>
                            <div style={{ height: '500px', backgroundColor: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
                                <Image src={img} className="mw-100 mh-100 object-fit-contain" />
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            ) : (
                <div style={{ height: '500px', backgroundColor: '#f8f9fa' }} className="d-flex align-items-center justify-content-center">
                    <Image src={product.images[0] || 'https://placehold.co/500'} className="mw-100 mh-100 object-fit-contain" />
                </div>
            )}
          </div>
        </Col>

        {/* COLUMNA 2: DETALLES */}
        <Col md={6}>
          <div className="ps-lg-4">
            <div className="d-flex justify-content-between align-items-start">
                <Badge bg={isService ? "info" : "secondary"} className="mb-2">{product.category}</Badge>
                {product.is_on_offer && <Badge bg="danger" className="py-2 px-3"><Tag size={14} className="me-1"/> OFERTA</Badge>}
            </div>
            
            <h1 className="fw-bold display-5 mb-3">{product.title}</h1>
            
            {!isService && (
                <div className="mb-4">
                    {product.is_on_offer && product.discount_price ? (
                        <div>
                            <span className="text-decoration-line-through text-muted fs-4 me-3">
                                ${Number(product.price).toLocaleString()}
                            </span>
                            <div className="d-flex align-items-center gap-2">
                                <span className="text-danger fw-bold display-4">
                                    ${Number(product.discount_price).toLocaleString()}
                                </span>
                                <Badge bg="success" className="fs-6">
                                    -{discountPercent}% OFF
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <h2 className="text-primary fw-bold display-5">
                            ${Number(product.price).toLocaleString()}
                        </h2>
                    )}
                </div>
            )}

            {/* SELECCIÓN DE COLOR */}
            {product.colors && product.colors.length > 0 && (
                <div className="mb-4">
                    <p className="fw-bold mb-2 text-muted small">COLOR DISPONIBLE:</p>
                    <div className="d-flex gap-2">
                        {product.colors.map((color, idx) => (
                            <div 
                                key={idx} 
                                className={`d-flex align-items-center border px-3 py-2 rounded cursor-pointer ${selectedColor?.name === color.name ? 'border-primary ring shadow-sm' : ''}`}
                                onClick={() => setSelectedColor(color)}
                                style={{cursor: 'pointer', backgroundColor: selectedColor?.name === color.name ? '#f0f9ff' : 'white'}}
                            >
                                <div className="rounded-circle border me-2 shadow-sm" style={{width: 24, height: 24, backgroundColor: color.hex}}></div>
                                <span className="small fw-semibold">{color.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-4">
                <h5 className="fw-bold">Descripción</h5>
                <p className="text-muted lead fs-6">
                    {product.description || "Sin descripción disponible."}
                </p>
            </div>

            {/* STOCK Y BOTONES */}
            <div className="mb-4">
              {isService ? (
                 <div className="d-flex align-items-center mb-2 text-info bg-info bg-opacity-10 p-3 rounded">
                    <Check size={24} className="me-2" /><span>Servicio personalizado a medida</span>
                 </div>
              ) : hasStock ? (
                 <div className="d-flex align-items-center mb-2 text-success bg-success bg-opacity-10 p-3 rounded">
                    <Check size={24} className="me-2" /><span>Stock disponible: <strong>{product.stock} unidades</strong></span>
                 </div>
              ) : (
                 <Alert variant="danger" className="d-flex align-items-center fw-bold">
                    <AlertTriangle size={24} className="me-2"/> PRODUCTO AGOTADO TEMPORALMENTE
                 </Alert>
              )}
            </div>

            <div className="d-grid gap-2">
               {isService ? (
                  <Button variant="dark" size="lg" className="fw-bold py-3" onClick={() => navigate(`/contacto?service=${encodeURIComponent(product.title)}`)}>
                      Solicitar Presupuesto
                  </Button>
               ) : (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="fw-bold py-3 shadow-sm"
                    onClick={() => addToCart(product)}
                    disabled={!hasStock}
                  >
                    <ShoppingCart className="me-2" /> {hasStock ? 'Añadir al Carrito' : 'Sin Stock'}
                  </Button>
               )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};