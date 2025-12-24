export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  is_on_offer: boolean;
  stock: number;
  // Ahora images siempre será un array
  images: string[];
  // Colors ahora puede ser un array de objetos
  colors: ProductColor[]; 
  category: string;
  is_featured?: boolean;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}

export interface CartItem extends Product {
  quantity: number;
  // Opcional: Podrías guardar qué color eligió el usuario aquí
  selectedColor?: ProductColor; 
}