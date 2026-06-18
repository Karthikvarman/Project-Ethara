import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Package, Plus, RefreshCcw, ShoppingCart, Trash2, Users } from "lucide-react";
import { api } from "./api";
import type { Customer, Order, Product } from "./types";

type Tab = "products" | "customers" | "orders";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [orderItems, setOrderItems] = useState([{ product_id: "", quantity: 1 }]);

  const lowStockCount = useMemo(() => products.filter((product) => product.stock <= 5).length, [products]);

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      const [productList, customerList, orderList] = await Promise.all([
        api.products.list(),
        api.customers.list(),
        api.orders.list(),
      ]);
      setProducts(productList);
      setCustomers(customerList);
      setOrders(orderList);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.products.create({
        name: String(form.get("name")),
        sku: String(form.get("sku")),
        price: String(form.get("price")),
        stock: Number(form.get("stock")),
      });
      event.currentTarget.reset();
      await loadData();
      setMessage("Product saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product");
    }
  }

  async function handleCustomerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.customers.create({
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")) || null,
      });
      event.currentTarget.reset();
      await loadData();
      setMessage("Customer saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save customer");
    }
  }

  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.orders.create({
        customer_id: Number(form.get("customer_id")),
        items: orderItems.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      });
      event.currentTarget.reset();
      setOrderItems([{ product_id: "", quantity: 1 }]);
      await loadData();
      setMessage("Order placed and stock updated");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to place order");
    }
  }

  async function removeProduct(id: number) {
    await api.products.remove(id);
    await loadData();
  }

  async function removeCustomer(id: number) {
    await api.customers.remove(id);
    await loadData();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventory operations</p>
          <h1>Ethara Orders</h1>
        </div>
        <button className="icon-button" onClick={loadData} aria-label="Refresh data" title="Refresh data">
          <RefreshCcw size={18} />
        </button>
      </header>

      <section className="metrics">
        <Metric icon={<Package size={20} />} label="Products" value={products.length} />
        <Metric icon={<Users size={20} />} label="Customers" value={customers.length} />
        <Metric icon={<ShoppingCart size={20} />} label="Orders" value={orders.length} />
        <Metric icon={<Package size={20} />} label="Low stock" value={lowStockCount} />
      </section>

      <nav className="tabs" aria-label="Management views">
        <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}>
          Products
        </button>
        <button className={activeTab === "customers" ? "active" : ""} onClick={() => setActiveTab("customers")}>
          Customers
        </button>
        <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
          Orders
        </button>
      </nav>

      {message && <p className="notice">{message}</p>}
      {loading && <p className="muted">Loading latest data...</p>}

      {activeTab === "products" && (
        <section className="workspace">
          <form className="panel form-grid" onSubmit={handleProductSubmit}>
            <h2>Add Product</h2>
            <input required name="name" placeholder="Name" />
            <input required name="sku" placeholder="SKU" />
            <input required name="price" type="number" min="0.01" step="0.01" placeholder="Price" />
            <input required name="stock" type="number" min="0" step="1" placeholder="Stock" />
            <button className="primary" type="submit">
              <Plus size={17} /> Save product
            </button>
          </form>
          <ProductTable products={products} onDelete={removeProduct} />
        </section>
      )}

      {activeTab === "customers" && (
        <section className="workspace">
          <form className="panel form-grid" onSubmit={handleCustomerSubmit}>
            <h2>Add Customer</h2>
            <input required name="name" placeholder="Name" />
            <input required name="email" type="email" placeholder="Email" />
            <input name="phone" placeholder="Phone" />
            <button className="primary" type="submit">
              <Plus size={17} /> Save customer
            </button>
          </form>
          <CustomerTable customers={customers} onDelete={removeCustomer} />
        </section>
      )}

      {activeTab === "orders" && (
        <section className="workspace">
          <form className="panel form-grid" onSubmit={handleOrderSubmit}>
            <h2>Create Order</h2>
            <select required name="customer_id" defaultValue="">
              <option value="" disabled>
                Select customer
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            <div className="line-items">
              {orderItems.map((item, index) => (
                <div className="line-item" key={index}>
                  <select
                    required
                    value={item.product_id}
                    onChange={(event) => {
                      const next = [...orderItems];
                      next[index] = { ...next[index], product_id: event.target.value };
                      setOrderItems(next);
                    }}
                  >
                    <option value="" disabled>
                      Select product
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.stock} in stock)
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    value={item.quantity}
                    onChange={(event) => {
                      const next = [...orderItems];
                      next[index] = { ...next[index], quantity: Number(event.target.value) };
                      setOrderItems(next);
                    }}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Qty"
                  />
                  <button
                    className="ghost"
                    type="button"
                    aria-label="Remove item"
                    disabled={orderItems.length === 1}
                    onClick={() => setOrderItems(orderItems.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="secondary"
              type="button"
              onClick={() => setOrderItems([...orderItems, { product_id: "", quantity: 1 }])}
            >
              <Plus size={17} /> Add line
            </button>
            <button className="primary" type="submit">
              <ShoppingCart size={17} /> Place order
            </button>
          </form>
          <OrderList orders={orders} />
        </section>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <article className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ProductTable({ products, onDelete }: { products: Product[]; onDelete: (id: number) => void }) {
  return (
    <div className="panel table-wrap">
      <h2>Products</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{money.format(Number(product.price))}</td>
              <td>{product.stock}</td>
              <td>
                <button className="ghost" onClick={() => onDelete(product.id)} aria-label={`Delete ${product.name}`}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerTable({ customers, onDelete }: { customers: Customer[]; onDelete: (id: number) => void }) {
  return (
    <div className="panel table-wrap">
      <h2>Customers</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone ?? "-"}</td>
              <td>
                <button className="ghost" onClick={() => onDelete(customer.id)} aria-label={`Delete ${customer.name}`}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderList({ orders }: { orders: Order[] }) {
  return (
    <div className="panel order-list">
      <h2>Orders</h2>
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div>
            <strong>Order #{order.id}</strong>
            <span>{order.customer.name}</span>
          </div>
          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product.name} x {item.quantity} · {money.format(Number(item.line_total))}
              </li>
            ))}
          </ul>
          <strong>{money.format(Number(order.total))}</strong>
        </article>
      ))}
    </div>
  );
}

export default App;
