import {
  Navbar as BSNavbar,
  Container,
  Nav,
  Button,
  Dropdown,
  Badge
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  LogOut,
  Printer,
  PlusCircle,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const navigate = useNavigate();

  // Valores seguros
  const displayName = user?.full_name || 'Usuario';
  const displayEmail = user?.email || '';
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm sticky-top py-3">
      <Container>
        {/* LOGO */}
        <BSNavbar.Brand
          as={Link}
          to="/"
          className="d-flex align-items-center fw-bold text-primary"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="me-2"
          >
            <Printer size={28} />
          </motion.div>
          MIRINCON3D
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-nav" />

        <BSNavbar.Collapse id="main-nav">
          {/* LINKS PÚBLICOS */}
          <Nav className="mx-auto fw-medium">
            <Nav.Link as={Link} to="/">Tienda</Nav.Link>
            <Nav.Link as={Link} to="/servicios" className="px-3">
              Servicios 3D
            </Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {/* CARRITO */}
            <Button
              variant="light"
              className="position-relative border-0 rounded-circle p-2"
              onClick={toggleCart}
            >
              <ShoppingCart size={22} className="text-secondary" />
              {cartCount > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="position-absolute top-0 start-100 translate-middle"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>

            {isAuthenticated && user ? (
              /* USUARIO LOGUEADO */
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  className="d-flex align-items-center gap-2 border-0 bg-transparent p-0 hide-caret"
                >
                  <div className="text-end d-none d-lg-block">
                    <div className="small fw-bold">{displayName}</div>
                    <div
                      className="text-muted"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {displayEmail}
                    </div>
                  </div>
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 38, height: 38 }}
                  >
                    {firstLetter}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className="shadow-lg border-0 rounded-3 p-2 mt-2"
                  style={{ minWidth: '230px' }}
                >
                  {/* ===== ADMIN ===== */}
                  {user.role === 'admin' && (
                    <>
                      <Dropdown.Header className="fw-bold text-primary small">
                        ADMINISTRACIÓN
                      </Dropdown.Header>

                      <Dropdown.Item
                        as={Link}
                        to="/admin/products"
                        className="d-flex align-items-center gap-2"
                      >
                        <Package size={16} className="text-primary" />
                        Productos (Tienda)
                      </Dropdown.Item>

                      <Dropdown.Item
                        as={Link}
                        to="/admin/services"
                        className="d-flex align-items-center gap-2"
                      >
                        <Package size={16} className="text-info" />
                        Servicios (Web)
                      </Dropdown.Item>

                      <Dropdown.Item
                        as={Link}
                        to="/admin/orders"
                        className="d-flex align-items-center gap-2"
                      >
                        <Package size={16} className="text-success" />
                        Gestionar Pedidos
                      </Dropdown.Item>

                      <Dropdown.Divider />
                    </>
                  )}

                  {/* ===== USUARIO ===== */}
                  <Dropdown.Header className="fw-bold small text-muted">
                    MI CUENTA
                  </Dropdown.Header>

                  <Dropdown.Item
                    as={Link}
                    to="/profile"
                    className="d-flex align-items-center gap-2"
                  >
                    <UserIconFallback />
                    Mi Perfil
                  </Dropdown.Item>

                  <Dropdown.Item
                    as={Link}
                    to="/orders"
                    className="d-flex align-items-center gap-2"
                  >
                    <Package size={16} />
                    Mis Pedidos
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  <Dropdown.Item
                    onClick={logout}
                    className="text-danger d-flex align-items-center gap-2"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              /* LOGIN / REGISTER */
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  className="fw-bold rounded-pill px-4"
                  onClick={() => navigate('/login')}
                >
                  Ingresar
                </Button>
                <Button
                  variant="primary"
                  className="fw-bold rounded-pill px-4"
                  onClick={() => navigate('/register')}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

// Icono usuario fallback
const UserIconFallback = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
