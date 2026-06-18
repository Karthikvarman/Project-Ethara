import type { Customer, Order, Product } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  products: {
    list: () => request<Product[]>("/products"),
    create: (payload: Pick<Product, "name" | "sku" | "price" | "stock">) =>
      request<Product>("/products", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: Partial<Pick<Product, "name" | "sku" | "price" | "stock">>) =>
      request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id: number) => request<void>(`/products/${id}`, { method: "DELETE" }),
  },
  customers: {
    list: () => request<Customer[]>("/customers"),
    create: (payload: Pick<Customer, "name" | "email" | "phone">) =>
      request<Customer>("/customers", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: number, payload: Partial<Pick<Customer, "name" | "email" | "phone">>) =>
      request<Customer>(`/customers/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id: number) => request<void>(`/customers/${id}`, { method: "DELETE" }),
  },
  orders: {
    list: () => request<Order[]>("/orders"),
    create: (payload: { customer_id: number; items: { product_id: number; quantity: number }[] }) =>
      request<Order>("/orders", { method: "POST", body: JSON.stringify(payload) }),
  },
};
