import React from 'react'; // <--- IMPORTANTE: Importar React
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from 'react-bootstrap';

// Definimos la interfaz de las propiedades
interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

  // Si no está logueado O si su rol no es admin, lo echamos al inicio
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Renderizamos los hijos dentro de un fragmento para cumplir con el tipo ReactNode
  return <>{children}</>;
};