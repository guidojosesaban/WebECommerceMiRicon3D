import { Navbar as BSNavbar, Container, Nav, Button, Dropdown, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, Printer, PlusCircle, Package, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const navigate = useNavigate();

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm sticky-top py-3">
      <Container>
        {/* Logo */}
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold text-primary">
          <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }} className="me-2">
            <Printer size={28} />
          </motion.div>
          MIRINCON3D
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-nav" />
        <BSNavbar.Collapse id="main-nav">
          {/* Navegación central */}
          <Nav className="mx-auto fw-medium">
            <Nav.Link as={Link} to="/">Tienda</Nav.Link>
            <Nav.Link as={Link} to="/servicios">Servicios 3D</Nav.Link>
            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
          </Nav>

          {/* Área derecha: carrito + usuario */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            
            {/* Mostrar rol (temporal) */}
            {isAuthenticated && (
              <small className="text-danger fw-bold border border-danger px-2 rounded">
                Rol: {user?.role || 'Sin rol'}
              </small>
            )}

            {/* Carrito */}
            <Button variant="light" className="position-relative border-0 rounded-circle p-2" onClick={toggleCart}>
              <ShoppingCart size={22} className="text-secondary" />
              {cartCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* Usuario autenticado */}
            {isAuthenticated && user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 border-0 bg-transparent p-0 hide-caret">
                  <div className="text-end d-none d-lg-block">
                    <div className="small fw-bold">{user.full_name}</div>
                  </div>
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 38, height: 38 }}>
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 rounded-3 p-2 mt-2" style={{ minWidth: '220px' }}>
                  
                  {/* ADMIN */}
                  {user.role === 'admin' && (
                    <>
                      <Dropdown.Header className="fw-bold text-primary small">ADMINISTRACIÓN</Dropdown.Header>

                      <Dropdown.Item as={Link} to="/admin/create-product" className="d-flex align-items-center gap-2">
                        <PlusCircle size={16} className="text-primary" /> Crear Producto
                      </Dropdown.Item>

                      <Dropdown.Item as={Link} to="/admin/orders" className="d-flex align-items-center gap-2">
                        <Package size={16} className="text-primary" /> Gestionar Pedidos
                      </Dropdown.Item>

                      <Dropdown.Divider />
                    </>
                  )}

                  {/* Perfil */}
                  <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center gap-2">
                    <UserIcon size={16}/> Mi Perfil
                  </Dropdown.Item>

                  <Dropdown.Divider />

                  {/* Logout */}
                  <Dropdown.Item onClick={logout} className="text-danger d-flex align-items-center gap-2">
                    <LogOut size={16} /> Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              /* Botones de login / registro */
              <div className="d-flex gap-2">
                <Button variant="outline-primary" className="fw-bold rounded-pill px-4" onClick={() => navigate('/login')}>
                  Ingresar
                </Button>
                <Button variant="primary" className="fw-bold rounded-pill px-4" onClick={() => navigate('/register')}>
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
