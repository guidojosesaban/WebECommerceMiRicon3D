import { Offcanvas, Button, Image } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { cart, isCartOpen, toggleCart, removeFromCart, addToCart, decreaseQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <Offcanvas show={isCartOpen} onHide={toggleCart} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-bold d-flex align-items-center gap-2">
          <ShoppingBag size={20} /> Tu Carrito
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {cart.length === 0 ? (
          <div className="text-center my-auto opacity-50">
            <ShoppingBag size={48} className="mb-3" />
            <p>Tu carrito está vacío</p>
            <Button variant="outline-primary" size="sm" onClick={toggleCart}>
              Seguir comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-grow-1 overflow-auto">
              {cart.map((item) => (
                <div key={item.id} className="d-flex gap-3 mb-3 border-bottom pb-3">
                  <Image 
                    src={item.images[0]} 
                    rounded 
                    style={{ width: 70, height: 70, objectFit: 'cover' }} 
                  />
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-truncate" style={{maxWidth: '180px'}}>
                      {item.title}
                    </div>
                    <div className="text-muted small mb-2">
                      ${item.price.toLocaleString()}
                    </div>
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center border rounded px-1">
                        <Button variant="link" size="sm" className="p-0 text-dark" onClick={() => decreaseQuantity(item.id)}>
                          <Minus size={14} />
                        </Button>
                        <span className="mx-2 small fw-bold">{item.quantity}</span>
                        <Button variant="link" size="sm" className="p-0 text-dark" onClick={() => addToCart(item)}>
                          <Plus size={14} />
                        </Button>
                      </div>
                      <Button variant="link" className="text-danger p-0" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-top pt-3">
              <div className="d-flex justify-content-between align-items-end mb-3">
                <span className="text-muted">Total estimado:</span>
                <span className="h4 fw-bold mb-0">${totalPrice.toLocaleString()}</span>
              </div>
              <Button variant="primary" size="lg" className="w-100 fw-bold" onClick={handleCheckout}>
                Finalizar Compra
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};