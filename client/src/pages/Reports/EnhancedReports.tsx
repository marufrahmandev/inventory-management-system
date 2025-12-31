import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import {
  useGetDashboardSummaryQuery,
  useGetSalesReportQuery,
  useGetPurchaseReportQuery,
  useGetInventoryReportQuery,
  useGetInvoiceReportQuery,
} from "../../state/reports/reportSlice";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  FileText,
  AlertTriangle,
  DollarSign,
  Download,
  Printer,
  Users,
  Calendar,
} from "lucide-react";
import Button from "../../elements/Button";

function EnhancedReports() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useGetDashboardSummaryQuery();
  const { data: salesReport } = useGetSalesReportQuery(dateRange);
  const { data: purchaseReport } = useGetPurchaseReportQuery(dateRange);
  const { data: inventoryReport } = useGetInventoryReportQuery();
  const { data: invoiceReport } = useGetInvoiceReportQuery(dateRange);

  useEffect(() => {
    setPageTitle("Reports & Analytics");
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (reportType: string) => {
    let data: any = null;
    let filename = "";

    switch (reportType) {
      case "sales":
        data = salesReport;
        filename = `sales-report-${dateRange.startDate}-${dateRange.endDate}.json`;
        break;
      case "purchase":
        data = purchaseReport;
        filename = `purchase-report-${dateRange.startDate}-${dateRange.endDate}.json`;
        break;
      case "inventory":
        data = inventoryReport;
        filename = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case "invoice":
        data = invoiceReport;
        filename = `invoice-report-${dateRange.startDate}-${dateRange.endDate}.json`;
        break;
      default:
        return;
    }

    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const setQuickDateRange = (days: number) => {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setDateRange({ startDate, endDate });
  };

  if (dashboardLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const profitMargin = salesReport && purchaseReport
    ? ((salesReport.totalRevenue - purchaseReport.totalExpense) / salesReport.totalRevenue * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Products</p>
              <p className="text-3xl font-bold">{dashboardData?.totalProducts || 0}</p>
              <p className="text-xs mt-2 opacity-75">Active inventory items</p>
            </div>
            <Package className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-3xl font-bold">${dashboardData?.totalRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs mt-2 opacity-75">Lifetime earnings</p>
            </div>
            <DollarSign className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Revenue</p>
              <p className="text-3xl font-bold">${dashboardData?.pendingRevenue?.toFixed(2) || "0.00"}</p>
              <p className="text-xs mt-2 opacity-75">Unpaid invoices</p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Low Stock Alert</p>
              <p className="text-3xl font-bold">{dashboardData?.lowStockCount || 0}</p>
              <p className="text-xs mt-2 opacity-75">Items need reorder</p>
            </div>
            <AlertTriangle className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Profit Margin Card */}
      {salesReport && purchaseReport && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Profit Margin (Current Period)</p>
              <p className="text-4xl font-bold">{profitMargin}%</p>
              <p className="text-sm mt-2">
                Revenue: ${salesReport.totalRevenue.toFixed(2)} | Expenses: ${purchaseReport.totalExpense.toFixed(2)}
              </p>
            </div>
            <BarChart3 className="w-16 h-16 opacity-80" />
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow print:hidden">
        <h3 className="text-lg font-semibold mb-4">Date Range Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="col-span-2 flex items-end gap-2">
            <Button variant="secondary" onClick={() => setQuickDateRange(7)}>
              Last 7 Days
            </Button>
            <Button variant="secondary" onClick={() => setQuickDateRange(30)}>
              Last 30 Days
            </Button>
            <Button variant="secondary" onClick={() => setQuickDateRange(90)}>
              Last 90 Days
            </Button>
          </div>
        </div>
      </div>

      {/* Sales Report */}
      {salesReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Sales Report</h3>
            </div>
            <button
              onClick={() => handleExport("sales")}
              className="text-blue-600 hover:text-blue-800 print:hidden"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{salesReport.totalOrders}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${salesReport.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {salesReport.completedOrders}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">
                {salesReport.cancelledOrders}
              </p>
            </div>
          </div>

          {salesReport.topProducts && salesReport.topProducts.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mb-3">Top Selling Products</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salesReport.topProducts.slice(0, 10).map((product, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                            idx === 1 ? 'bg-gray-100 text-gray-800' :
                            idx === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-50 text-blue-600'
                          } font-semibold`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                          ${product.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase Report */}
      {purchaseReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Purchase Report</h3>
            </div>
            <button
              onClick={() => handleExport("purchase")}
              className="text-blue-600 hover:text-blue-800 print:hidden"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{purchaseReport.totalOrders}</p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">
                ${purchaseReport.totalExpense.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-green-600">
                {purchaseReport.receivedOrders}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">
                {purchaseReport.cancelledOrders}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {inventoryReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Inventory Report</h3>
            </div>
            <button
              onClick={() => handleExport("inventory")}
              className="text-blue-600 hover:text-blue-800 print:hidden"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{inventoryReport.totalProducts}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Stock Qty</p>
              <p className="text-2xl font-bold">{inventoryReport.totalStockQuantity}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${inventoryReport.totalValue.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {inventoryReport.lowStockCount}
              </p>
            </div>
          </div>

          {inventoryReport.lowStockProducts && inventoryReport.lowStockProducts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3 text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Low Stock Alert ({inventoryReport.lowStockCount} items)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Min Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryReport.lowStockProducts.map((product, idx) => {
                      const percentage = (product.stock / product.minStock) * 100;
                      return (
                        <tr key={idx} className={percentage < 50 ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {product.sku}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">
                            {product.stock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.minStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              percentage < 25 ? 'bg-red-100 text-red-800' :
                              percentage < 50 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {percentage < 25 ? 'Critical' : percentage < 50 ? 'Very Low' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invoice Report */}
      {invoiceReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Invoice Report</h3>
            </div>
            <button
              onClick={() => handleExport("invoice")}
              className="text-blue-600 hover:text-blue-800 print:hidden"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold">{invoiceReport.totalInvoices}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">
                ${invoiceReport.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${invoiceReport.paidAmount.toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-2xl font-bold text-red-600">
                ${invoiceReport.unpaidAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {invoiceReport.overdueInvoices && invoiceReport.overdueInvoices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3 text-red-600 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Overdue Invoices ({invoiceReport.overdueCount})
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Days Overdue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount Due
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceReport.overdueInvoices.map((invoice, idx) => {
                      const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {invoice.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-red-600">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              daysOverdue > 30 ? 'bg-red-100 text-red-800' :
                              daysOverdue > 15 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {daysOverdue} days
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                            ${(invoice.total - invoice.paidAmount).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Footer */}
      <div className="bg-gray-50 p-6 rounded-lg text-center text-sm text-gray-600 print:block">
        <p>Report generated on {new Date().toLocaleString()}</p>
        <p className="mt-2">© 2025 Inventory Management System - All Rights Reserved</p>
      </div>
    </div>
  );
}

export default EnhancedReports;

