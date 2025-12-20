import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, Button, Badge, Spinner } from 'react-bootstrap';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import type{ Product } from '../types';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error cargando producto", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  if (!product) return (
    <Container className="text-center py-5">
      <h3>Producto no encontrado</h3>
      <Button onClick={() => navigate('/')}>Volver a la tienda</Button>
    </Container>
  );

  return (
    <Container className="py-5">
      <Button variant="link" className="text-decoration-none text-muted mb-4 ps-0" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} className="me-1" /> Volver atrás
      </Button>

      <Row className="g-5">
        {/* COLUMNA IMAGEN */}
        <Col md={6}>
          <div className="border rounded-4 overflow-hidden shadow-sm bg-white">
             {/* Usamos la primera imagen del array */}
            <Image src={product.images[0]} fluid className="w-100 object-fit-cover" />
          </div>
        </Col>

        {/* COLUMNA DETALLES */}
        <Col md={6}>
          <div className="ps-lg-4">
            <Badge bg="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="fw-bold display-5 mb-3">{product.title}</h1>
            
            <h2 className="text-primary fw-bold mb-4">
              ${Number(product.price).toLocaleString()}
            </h2>

            <p className="text-muted lead mb-4">
              {product.description || "Sin descripción disponible para este producto."}
            </p>

            {/* Specs o Características (simuladas si no existen en DB aun) */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <Check size={18} className="text-success me-2" />
                <span>Stock disponible: <strong>{product.stock} unidades</strong></span>
              </div>
              <div className="d-flex align-items-center mb-2">
                 <Check size={18} className="text-success me-2" />
                 <span>Envío a todo el país</span>
              </div>
            </div>

            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                size="lg" 
                className="fw-bold py-3"
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="me-2" /> Añadir al Carrito
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};