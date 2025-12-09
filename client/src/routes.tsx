import { createBrowserRouter, useOutletContext } from "react-router";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";    
import Categories from "./pages/Categories/Categories";
import Products from "./pages/Products/Products";
import PurchaseOrder from "./pages/PurchaseOrder";
import AddCategory from "./pages/Categories/AddCategory";
const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Home },
      { path: "categories", Component: Categories },
      { path: "categories/add", Component: AddCategory },
      { path: "products", Component: Products },
      { path: "purchase-orders", Component: PurchaseOrder },
    ]
  }
]);

export default router;
