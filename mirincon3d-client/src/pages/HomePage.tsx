import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // ESTADOS DE FILTRO
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priceRange, setPriceRange] = useState(1000000);
  const [sortOrder, setSortOrder] = useState('defecto');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');

        // 🔹 Seguridad: Asegurarse que data sea un array
        const productsArray: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];

        // Excluir "Servicios" si quieres
        const salesProducts = productsArray.filter((p: Product) => p.category !== 'Servicios');

        setProducts(salesProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // LÓGICA DE FILTRADO Y ORDEN
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
      const matchesPrice = Number(product.price) <= priceRange;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOrder === 'menor-mayor') return Number(a.price) - Number(b.price);
      if (sortOrder === 'mayor-menor') return Number(b.price) - Number(a.price);
      return 0;
    });

  // Categorías únicas dinámicas
  const uniqueCategories = ['Todas', ...new Set(products.map((p) => p.category))];

  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );

  return (
    <Container className="py-5">
      {/* HEADER DE BÚSQUEDA */}
      <div className="mb-5">
        <h1 className="fw-bold mb-4">Catálogo de Productos</h1>
        <Card className="border-0 shadow-sm p-3">
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0">
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar impresora, filamento..."
                  className="border-start-0 ps-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="defecto">Orden: Más recientes</option>
                <option value="menor-mayor">Precio: Menor a Mayor</option>
                <option value="mayor-menor">Precio: Mayor a Menor</option>
              </Form.Select>
            </Col>
          </Row>
        </Card>
      </div>

      <Row>
        {/* FILTROS LATERALES */}
        <Col lg={3} className="d-none d-lg-block">
          <Card className="border-0 shadow-sm p-4 sticky-top" style={{ top: '100px', zIndex: 1 }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <SlidersHorizontal size={18} className="me-2" /> Filtros
            </h5>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">
                Precio Máximo: ${priceRange.toLocaleString()}
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="2000000"
                step="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Categorías</label>
              {uniqueCategories.map((cat) => (
                <Form.Check
                  key={`check-${cat}`}
                  type="radio"
                  name="category-radio"
                  label={cat}
                  checked={categoryFilter === cat}
                  onChange={() => setCategoryFilter(cat)}
                  className="mb-2"
                />
              ))}
            </div>

            <Button
              variant="outline-secondary"
              size="sm"
              className="w-100"
              onClick={() => {
                setPriceRange(2000000);
                setCategoryFilter('Todas');
                setSearchTerm('');
                setSortOrder('defecto');
              }}
            >
              Limpiar Filtros
            </Button>
          </Card>
        </Col>

        {/* PRODUCTOS */}
        <Col lg={9}>
          <Row xs={1} md={2} xl={3} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product.id}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <Card className="h-100 border-0 shadow-sm overflow-hidden hover-card">
                    <div className="position-relative" style={{ height: 220 }}>
                      <Card.Img
                        variant="top"
                        src={product.images?.[0] || '/placeholder.png'}
                        className="h-100 object-fit-cover"
                      />
                      {product.is_on_offer && (
                        <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
                          OFERTA
                        </Badge>
                      )}
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <small className="text-muted mb-1">{product.category}</small>
                      <Card.Title className="fw-bold text-truncate">{product.title ?? 'Sin título'}</Card.Title>
                      <div className="mt-auto pt-3">
                        <h4 className="fw-bold text-primary mb-3">
                          ${Number(product.price).toLocaleString()}
                        </h4>
                        <div className="d-grid gap-2">
                          <Button variant="primary" onClick={() => addToCart(product)}>
                            Añadir
                          </Button>
                          <Link to={`/product/${product.id}`} className="btn btn-outline-secondary btn-sm">
                            Ver Detalle
                          </Link>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {filteredProducts.length === 0 && (
            <div className="text-center py-5">
              <h4>No encontramos productos con esos filtros 😔</h4>
              <Button
                variant="link"
                onClick={() => {
                  setCategoryFilter('Todas');
                  setSearchTerm('');
                }}
              >
                Ver todos
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};
