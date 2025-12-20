import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

// Validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [captchaVal, setCaptchaVal] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    if (!captchaVal) {
      setError('Por favor completa el captcha');
      return;
    }

    try {
      setError('');
      await login(data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Error al iniciar sesión');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: 450, width: '100%' }}
      >
        <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-primary p-4 text-center text-white">
            <h3 className="fw-bold mb-0">¡Hola de nuevo!</h3>
            <p className="small opacity-75 mb-0">
              Ingresa a tu cuenta en MIRINCON3D
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
              {/* EMAIL */}
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">
                  Email
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={18} />
                  </span>
                  <Form.Control
                    {...register('email')}
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    className={`border-start-0 ${
                      errors.email ? 'is-invalid' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <div className="text-danger small">
                    {errors.email.message}
                  </div>
                )}
              </Form.Group>

              {/* PASSWORD */}
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted">
                  Contraseña
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={18} />
                  </span>
                  <Form.Control
                    {...register('password')}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`border-start-0 ${
                      errors.password ? 'is-invalid' : ''
                    }`}
                  />
                  <Button
                    variant="light"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {errors.password && (
                  <div className="text-danger small">
                    {errors.password.message}
                  </div>
                )}
              </Form.Group>

              {/* CAPTCHA */}
              <div className="d-flex justify-content-center mb-3">
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={setCaptchaVal}
                />
              </div>

              {/* LOGIN */}
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
                      <LogIn size={20} className="me-2" />
                      Iniciar Sesión
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

              {/* GOOGLE LOGIN */}
              <div className="d-flex justify-content-center mb-4">
                <GoogleLogin
                  onSuccess={googleLogin}
                  onError={() =>
                    setError('Falló el inicio de sesión con Google')
                  }
                  useOneTap
                  shape="pill"
                  theme="outline"
                  width="300"
                />
              </div>

              <div className="text-center text-muted small">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="fw-bold">
                  Regístrate gratis
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};
