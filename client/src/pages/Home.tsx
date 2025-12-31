import { useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Users,
  FileText,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useGetDashboardSummaryQuery } from "../state/reports/reportSlice";
import { useGetProductsQuery } from "../state/products/productSlice";

function Home() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();
  const navigate = useNavigate();

  // Don't block rendering if queries fail
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardSummaryQuery();
  const { data: products, error: productsError } = useGetProductsQuery({});

  useEffect(() => {
    setPageTitle("Dashboard");
  }, [setPageTitle]);

  // Calculate values with fallbacks
  const totalProducts = products?.data?.length || 0;
  const totalRevenue = dashboardData?.totalRevenue || 0;
  const lowStockCount = dashboardData?.lowStockCount || 0;
  const pendingRevenue = dashboardData?.pendingRevenue || 0;

  const stats = [
    {
      name: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "bg-blue-500",
      change: "+12%",
      changeType: "increase",
      link: "/products",
    },
    {
      name: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      change: "+23%",
      changeType: "increase",
      link: "/reports",
    },
    {
      name: "Total Invoices",
      value: dashboardData?.totalInvoices || 0,
      icon: FileText,
      color: "bg-purple-500",
      change: "+8%",
      changeType: "increase",
      link: "/invoices",
    },
    {
      name: "Low Stock Items",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "bg-red-500",
      change: lowStockCount > 0 ? "Alert" : "OK",
      changeType: lowStockCount > 0 ? "increase" : "decrease",
      link: "/stocks",
    },
  ];

  const quickActions = [
    { name: "Add Product", icon: Package, link: "/products/add", color: "blue" },
    { name: "New Sales Order", icon: ShoppingCart, link: "/sales-orders/add", color: "green" },
    { name: "New Purchase Order", icon: Boxes, link: "/purchase-orders/add", color: "purple" },
    { name: "Create Invoice", icon: FileText, link: "/invoices/add", color: "orange" },
  ];

  const recentActivity = [
    {
      type: "sale",
      title: "New Sales Order",
      description: "Order #SO-2025-0001 created",
      time: "2 hours ago",
      icon: ShoppingCart,
      color: "text-green-600 bg-green-50",
    },
    {
      type: "product",
      title: "Product Added",
      description: "New product 'Office Chair' added",
      time: "5 hours ago",
      icon: Package,
      color: "text-blue-600 bg-blue-50",
    },
    {
      type: "stock",
      title: "Stock Alert",
      description: "5 products below minimum stock",
      time: "1 day ago",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
    },
    {
      type: "invoice",
      title: "Invoice Paid",
      description: "Invoice #INV-2025-0003 paid",
      time: "2 days ago",
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {dashboardLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {(dashboardError || productsError) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-semibold">Unable to load some data</p>
              <p className="text-yellow-700 text-sm">
                Make sure the backend server is running on http://localhost:3000
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Inventory Dashboard</h1>
        <p className="text-blue-100">
          Here's an overview of your business performance and quick access to common tasks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center">
                  {stat.changeType === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-semibold ml-1 ${
                      stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.name}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
                green: "bg-green-50 text-green-600 hover:bg-green-100",
                purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
                orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
              };

              return (
                <button
                  key={index}
                  onClick={() => navigate(action.link)}
                  className={`${
                    colorClasses[action.color as keyof typeof colorClasses]
                  } p-4 rounded-lg transition-colors text-left`}
                >
                  <Icon className="w-8 h-8 mb-2" />
                  <p className="font-semibold text-sm">{action.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start">
                  <div className={`${activity.color} p-2 rounded-lg mr-3`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-gray-600 text-xs">{activity.description}</p>
                    <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Revenue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Revenue</h3>
            <FileText className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 mb-2">
            ${pendingRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">From unpaid invoices</p>
          <button
            onClick={() => navigate("/invoices")}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            View Invoices →
          </button>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
            <ShoppingCart className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">
            {dashboardData?.totalSalesOrders || 0}
          </p>
          <p className="text-sm text-gray-600">Total sales orders</p>
          <button
            onClick={() => navigate("/sales-orders")}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            View Orders →
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Products</span>
              <span className="text-sm font-semibold text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Orders</span>
              <span className="text-sm font-semibold text-green-600">Processing</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inventory</span>
              <span className="text-sm font-semibold text-yellow-600">Low Stock Alert</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/reports")}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold"
          >
            View Reports →
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Low Stock Alert!</h3>
              <p className="text-red-700 mb-4">
                You have {lowStockCount} product(s) running low on stock. Review and reorder to avoid
                stockouts.
              </p>
              <button
                onClick={() => navigate("/stocks")}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Manage Stock Levels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
