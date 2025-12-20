import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Container } from 'react-bootstrap';
import { CartDrawer } from '../components/layout/CartDrawer'; // <--- IMPORTANTE: Importar el Drawer

export const MainLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      
      {/* AGREGAMOS EL COMPONENTE VISUAL DEL CARRITO AQUÍ */}
      <CartDrawer /> 
      
      <main className="flex-grow-1">
        <Outlet />
      </main>

      <footer className="bg-dark text-white py-4 mt-auto">
        <Container className="text-center small opacity-75">
          &copy; {new Date().getFullYear()} MIRINCON3D. Todos los derechos reservados.
        </Container>
      </footer>
    </div>
  );
};