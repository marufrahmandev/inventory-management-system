import { createBrowserRouter, useOutletContext } from "react-router";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";    

const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Home },
    ]
  }
]);

export default router;
