import { createBrowserRouter, useOutletContext, Navigate } from "react-router";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";    

// Categories
import Categories from "./pages/Categories/Categories";
import AddCategory from "./pages/Categories/AddCategory";
import EditCategory from "./pages/Categories/EditCategory";

// Products
import Products from "./pages/Products/Products";
import AddProduct from "./pages/Products/AddProduct";
import EditProduct from "./pages/Products/EditProduct";

// Customers
import Customers from "./pages/Customers/Customers";
import AddCustomer from "./pages/Customers/AddCustomer";
import EditCustomer from "./pages/Customers/EditCustomer";

// Suppliers
import Suppliers from "./pages/Suppliers/Suppliers";
import AddSupplier from "./pages/Suppliers/AddSupplier";
import EditSupplier from "./pages/Suppliers/EditSupplier";

// Sales Orders
import SalesOrders from "./pages/SalesOrders/SalesOrders";
import AddSalesOrder from "./pages/SalesOrders/AddSalesOrder";
import EditSalesOrder from "./pages/SalesOrders/EditSalesOrder";
import ViewSalesOrder from "./pages/SalesOrders/ViewSalesOrder";

// Purchase Orders
import PurchaseOrders from "./pages/PurchaseOrders/PurchaseOrders";
import AddPurchaseOrder from "./pages/PurchaseOrders/AddPurchaseOrder";
import EditPurchaseOrder from "./pages/PurchaseOrders/EditPurchaseOrder";
import ViewPurchaseOrder from "./pages/PurchaseOrders/ViewPurchaseOrder";

// Invoices
import Invoices from "./pages/Invoices/Invoices";
import AddInvoice from "./pages/Invoices/AddInvoice";
import EditInvoice from "./pages/Invoices/EditInvoice";
import ViewInvoice from "./pages/Invoices/ViewInvoice";

// Stocks
import Stocks from "./pages/Stocks/Stocks";
import AddStock from "./pages/Stocks/AddStock";
import EditStock from "./pages/Stocks/EditStock";

// Reports
import Reports from "./pages/Reports/Reports";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  // Auth routes (public)
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
  
  // Protected routes
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Home },
      
      // Category routes
      { path: "categories", Component: Categories },
      { path: "categories/add", Component: AddCategory },
      { path: "categories/edit/:id", Component: EditCategory },
      
      // Product routes
      { path: "products", Component: Products },
      { path: "products/add", Component: AddProduct },
      { path: "products/edit/:id", Component: EditProduct },
      
      // Customer routes
      { path: "customers", Component: Customers },
      { path: "customers/add", Component: AddCustomer },
      { path: "customers/edit/:id", Component: EditCustomer },
      
      // Supplier routes
      { path: "suppliers", Component: Suppliers },
      { path: "suppliers/add", Component: AddSupplier },
      { path: "suppliers/edit/:id", Component: EditSupplier },
      
      // Sales Order routes
      { path: "sales-orders", Component: SalesOrders },
      { path: "sales-orders/add", Component: AddSalesOrder },
      { path: "sales-orders/edit/:id", Component: EditSalesOrder },
      { path: "sales-orders/view/:id", Component: ViewSalesOrder },
      
      // Purchase Order routes
      { path: "purchase-orders", Component: PurchaseOrders },
      { path: "purchase-orders/add", Component: AddPurchaseOrder },
      { path: "purchase-orders/edit/:id", Component: EditPurchaseOrder },
      { path: "purchase-orders/view/:id", Component: ViewPurchaseOrder },
      
      // Invoice routes
      { path: "invoices", Component: Invoices },
      { path: "invoices/add", Component: AddInvoice },
      { path: "invoices/edit/:id", Component: EditInvoice },
      { path: "invoices/view/:id", Component: ViewInvoice },
      
      // Stock routes
      { path: "stocks", Component: Stocks },
      { path: "stocks/add", Component: AddStock },
      { path: "stocks/edit/:id", Component: EditStock },
      
      // Reports
      { path: "reports", Component: Reports },
    ]
  }
]);

export default router;
