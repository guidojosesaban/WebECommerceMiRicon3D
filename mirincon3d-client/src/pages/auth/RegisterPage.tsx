import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

// Validación
const registerSchema = z
  .object({
    full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const { register: registerAuth, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerAuth({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al registrarse');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 500, width: '100%' }}
      >
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-primary p-4 text-center text-white">
            <h3 className="fw-bold mb-0">Crear Cuenta</h3>
            <p className="small opacity-75 mb-0">
              Únete a la comunidad de MIRINCON3D
            </p>
          </div>

          <Card.Body className="p-4 p-md-5">
            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
              {/* NOMBRE */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">
                  Nombre Completo
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <User size={18} />
                  </span>
                  <Form.Control
                    {...register('full_name')}
                    placeholder="Tu nombre"
                    isInvalid={!!errors.full_name}
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.full_name?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* EMAIL */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Email</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Mail size={18} />
                  </span>
                  <Form.Control
                    {...register('email')}
                    type="email"
                    placeholder="email@ejemplo.com"
                    isInvalid={!!errors.email}
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* PASSWORD */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Contraseña</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Lock size={18} />
                  </span>
                  <Form.Control
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    isInvalid={!!errors.password}
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* CONFIRM PASSWORD */}
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold">
                  Confirmar Contraseña
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <Lock size={18} />
                  </span>
                  <Form.Control
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    isInvalid={!!errors.confirmPassword}
                  />
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword?.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* REGISTER BUTTON */}
              <div className="d-grid mb-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="fw-bold"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <UserPlus size={20} className="me-2" />
                      Registrarse
                    </>
                  )}
                </Button>
              </div>

              {/* DIVIDER */}
              <div className="d-flex align-items-center mb-4">
                <hr className="flex-grow-1" />
                <span className="px-3 text-muted small">
                  O continúa con
                </span>
                <hr className="flex-grow-1" />
              </div>

              {/* GOOGLE REGISTER / LOGIN */}
              <div className="d-flex justify-content-center mb-4">
                <GoogleLogin
                  onSuccess={googleLogin}
                  onError={() =>
                    setError('Falló el registro con Google')
                  }
                  shape="pill"
                  theme="outline"
                  width="300"
                />
              </div>

              <div className="text-center text-muted small">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="fw-bold">
                  Inicia sesión
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};
