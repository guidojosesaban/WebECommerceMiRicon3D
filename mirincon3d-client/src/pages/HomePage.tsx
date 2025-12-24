import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import type { Product, ProductColor } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Tag, Package } from 'lucide-react';

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [priceRange, setPriceRange] = useState(2000000); // Valor alto por defecto
  const [sortOrder, setSortOrder] = useState('defecto');

  // --- CARGAR PRODUCTOS ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        
        // 1. Asegurarnos que sea un array (por si la respuesta cambia)
        const rawProducts = Array.isArray(data) ? data : (data.products || []);

        // 2. Procesar datos (especialmente Colores que pueden venir como texto desde DB)
        const parsedProducts = rawProducts.map((p: any) => ({
            ...p,
            colors: p.colors?.map((c: string | ProductColor) => 
                typeof c === 'string' ? JSON.parse(c) : c
            ) || []
        }));

        setProducts(parsedProducts);
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredProducts = products
    .filter(product => {
        // 1. Buscador texto
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
        // 2. Categoría
        const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter;
        // 3. Precio (considerando oferta)
        const currentPrice = product.is_on_offer && product.discount_price ? product.discount_price : product.price;
        const matchesPrice = Number(currentPrice) <= priceRange;

        return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
        const priceA = a.is_on_offer && a.discount_price ? Number(a.discount_price) : Number(a.price);
        const priceB = b.is_on_offer && b.discount_price ? Number(b.discount_price) : Number(b.price);
        
        if (sortOrder === 'menor-mayor') return priceA - priceB;
        if (sortOrder === 'mayor-menor') return priceB - priceA;
        // Por defecto: orden de creación (IDs más altos primero, o como venga del backend)
        return 0; 
    });

  // --- OBTENER CATEGORÍAS DINÁMICAS ---
  // (Crea la lista de filtros basada en lo que existe en la base de datos)
  const uniqueCategories = ['Todas', ...new Set(products.map(p => p.category))];

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="py-5">
      {/* HEADER: BUSCADOR Y ORDEN */}
      <div className="mb-5">
        <h1 className="fw-bold mb-4">Catálogo de Productos</h1>
        <Card className="border-0 shadow-sm p-3">
          <Row className="g-3 align-items-center">
             <Col md={5}>
                <InputGroup>
                   <InputGroup.Text className="bg-white border-end-0"><Search size={18}/></InputGroup.Text>
                   <Form.Control 
                      placeholder="¿Qué estás buscando?" 
                      className="border-start-0 ps-0"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </InputGroup>
             </Col>
             <Col md={3}>
                <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                   {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Form.Select>
             </Col>
             <Col md={3}>
                <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                   <option value="defecto">Más recientes</option>
                   <option value="menor-mayor">Precio: Menor a Mayor</option>
                   <option value="mayor-menor">Precio: Mayor a Menor</option>
                </Form.Select>
             </Col>
          </Row>
        </Card>
      </div>

      <Row>
        {/* BARRA LATERAL (FILTROS) */}
        <Col lg={3} className="d-none d-lg-block">
           <Card className="border-0 shadow-sm p-4 sticky-top" style={{ top: '100px' }}>
              <h5 className="fw-bold mb-3 d-flex align-items-center"><SlidersHorizontal size={18} className="me-2"/> Filtros</h5>
              
              <div className="mb-4">
                 <label className="form-label small fw-bold text-muted">Precio Máximo: ${priceRange.toLocaleString()}</label>
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
                 {uniqueCategories.map(cat => (
                    <Form.Check 
                       key={`check-${cat}`}
                       type="radio"
                       name="category-radio"
                       label={`${cat} (${cat === 'Todas' ? products.length : products.filter(p => p.category === cat).length})`}
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
                onClick={() => { setPriceRange(2000000); setCategoryFilter('Todas'); setSearchTerm(''); }}
              >
                Limpiar Filtros
              </Button>
           </Card>
        </Col>

        {/* GRILLA DE PRODUCTOS */}
        <Col lg={9}>
           <Row xs={1} md={2} xl={3} className="g-4">
              {filteredProducts.map((product) => (
                <Col key={product.id}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <Card className="h-100 border-0 shadow-sm overflow-hidden hover-card">
                      
                      {/* IMAGEN DEL PRODUCTO */}
                      <div className="position-relative" style={{ height: 220 }}>
                        <Card.Img 
                            variant="top" 
                            src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/300'} 
                            className="h-100 object-fit-cover" 
                        />
                        
                        {/* BADGES (ETIQUETAS) */}
                        {product.is_on_offer && (
                            <Badge bg="danger" className="position-absolute top-0 end-0 m-2 shadow-sm animate__animated animate__pulse animate__infinite">
                                <Tag size={12} className="me-1"/> OFERTA
                            </Badge>
                        )}
                        {product.stock <= 0 && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center">
                                <Badge bg="dark" className="fs-6 px-3 py-2">AGOTADO</Badge>
                            </div>
                        )}
                      </div>
                      
                      <Card.Body className="d-flex flex-column">
                        <small className="text-muted mb-1">{product.category}</small>
                        <Card.Title className="fw-bold text-truncate mb-1" title={product.title}>
                            {product.title}
                        </Card.Title>
                        
                        {/* MUESTRA DE COLORES DISPONIBLES */}
                        <div className="d-flex gap-1 mb-2 align-items-center" style={{ minHeight: '24px' }}>
                            {product.colors && product.colors.length > 0 ? (
                                product.colors.map((c: any, idx: number) => {
                                     // Parche de seguridad por si el backend envía string JSON
                                     const colorObj = typeof c === 'string' ? JSON.parse(c) : c;
                                     return (
                                        <div 
                                            key={idx} 
                                            className="rounded-circle border shadow-sm" 
                                            style={{width: 18, height: 18, backgroundColor: colorObj.hex}} 
                                            title={colorObj.name}
                                        />
                                     );
                                })
                            ) : (
                                <small className="text-muted" style={{fontSize: '0.75rem'}}>Color único</small>
                            )}
                        </div>

                        {/* MUESTRA DE STOCK */}
                        <div className="mb-3">
                            {product.stock > 0 ? (
                                <small className="text-success fw-bold d-flex align-items-center">
                                    <Package size={14} className="me-1"/> {product.stock} disponibles
                                </small>
                            ) : (
                                <small className="text-danger fw-bold">Sin stock</small>
                            )}
                        </div>

                        <div className="mt-auto">
                          {/* PRECIO (Con lógica de oferta) */}
                          {product.is_on_offer && product.discount_price ? (
                              <div className="mb-2 lh-1">
                                  <span className="text-decoration-line-through text-muted small me-2">
                                      ${Number(product.price).toLocaleString()}
                                  </span>
                                  <span className="fw-bold text-danger fs-5">
                                      ${Number(product.discount_price).toLocaleString()}
                                  </span>
                              </div>
                          ) : (
                              <h4 className="fw-bold text-primary mb-3">
                                  ${Number(product.price).toLocaleString()}
                              </h4>
                          )}
                          
                          {/* BOTONES DE ACCIÓN */}
                          <div className="d-grid gap-2">
                             <Button 
                                variant="primary" 
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                             >
                                {product.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
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
           
           {/* MENSAJE SI NO HAY RESULTADOS */}
           {filteredProducts.length === 0 && (
              <div className="text-center py-5">
                 <h4>No encontramos productos con esos filtros 😔</h4>
                 <Button 
                    variant="link" 
                    onClick={() => { setCategoryFilter('Todas'); setSearchTerm(''); }}
                 >
                    Ver todo el catálogo
                 </Button>
              </div>
           )}
        </Col>
      </Row>
    </Container>
  );
};