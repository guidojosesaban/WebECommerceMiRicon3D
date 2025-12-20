import { ProgressBar } from 'react-bootstrap';

interface Props {
  status: string;
}

export const OrderProgress = ({ status }: Props) => {
  let progress = 0;
  let variant = 'info';

  // Mapeo de estados a porcentaje
  switch (status) {
    case 'pending': 
      progress = 25; 
      break;
    case 'processing': 
      progress = 50; 
      break;
    case 'shipped': 
      progress = 75; 
      break;
    case 'delivered': 
      progress = 100; 
      variant = 'success';
      break;
    default: 
      progress = 0;
  }

  const getLabel = () => {
    if (status === 'pending') return 'Solicitud Recibida';
    if (status === 'processing') return 'En Construcción / Preparación';
    if (status === 'shipped') return 'Enviado / Listo para retirar';
    if (status === 'delivered') return 'Entregado';
    return 'Desconocido';
  };

  return (
    <div className="my-3">
      <div className="d-flex justify-content-between small mb-1 text-muted fw-bold">
         <span>Solicitud</span>
         <span>Construcción</span>
         <span>Envío</span>
         <span>Entregado</span>
      </div>
      <ProgressBar animated={status !== 'delivered'} variant={variant} now={progress} />
      <div className="text-center mt-2 fw-bold text-primary">
         Estado Actual: {getLabel()}
      </div>
    </div>
  );
};