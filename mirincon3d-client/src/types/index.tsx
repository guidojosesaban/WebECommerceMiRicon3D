export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string; // <--- ASEGURATE DE QUE ESTA LÍNEA EXISTA
  phone?: string;
  address?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  is_on_offer: boolean;
  stock: number;
  images: string[];
  category: string;
  is_featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}