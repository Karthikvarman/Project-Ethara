export type Product = {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock: number;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  product: Product;
};

export type Order = {
  id: number;
  customer_id: number;
  total: string;
  created_at: string;
  customer: Customer;
  items: OrderItem[];
};
