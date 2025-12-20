import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { ContactPage } from "./pages/ContactPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CreateProductPage } from "./pages/admin/CreateProductPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AdminRoute } from "./components/common/AdminRoute";

interface RouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Home */}
            <Route index element={<HomePage />} />

            {/* Páginas públicas */}
            <Route path="servicios" element={<ServicesPage />} />
            <Route path="contacto" element={<ContactPage />} />

            {/* Detalle de producto */}
            <Route path="product/:id" element={<ProductDetailPage />} />

            {/* Rutas protegidas para clientes */}
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="orders"
              element={
                <ProtectedRoute>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas protegidas para admin */}
            <Route
              path="admin/create-product"
              element={
                <AdminRoute>
                  <CreateProductPage />
                </AdminRoute>
              }
            />
            <Route
              path="admin/orders"
              element={
                <AdminRoute>
                  <AdminOrdersPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* Rutas de login / register */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
