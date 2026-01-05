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
} from "lucide-react";

function Reports() {
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const { data: dashboardData, isLoading: dashboardLoading } =
    useGetDashboardSummaryQuery();
  const { data: salesReport } = useGetSalesReportQuery(dateRange);
  const { data: purchaseReport } = useGetPurchaseReportQuery(dateRange);
  const { data: inventoryReport } = useGetInventoryReportQuery();
  const { data: invoiceReport } = useGetInvoiceReportQuery(dateRange);

  useEffect(() => {
    setPageTitle("Reports & Analytics");
  }, []);

  if (dashboardLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.totalProducts || 0}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${dashboardData?.totalRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${dashboardData?.pendingRevenue?.toFixed(2) || "0.00"}
              </p>
            </div>
            <FileText className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {dashboardData?.lowStockCount || 0}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filter Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
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
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Sales Report */}
      {salesReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Sales Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold">{salesReport.totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">
                ${salesReport.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-blue-600">
                {salesReport.completedOrders}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-red-600">
                {salesReport.cancelledOrders}
              </p>
            </div>
          </div>

          {salesReport.topProducts && salesReport.topProducts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-3">Top Products</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
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
                    {salesReport.topProducts.slice(0, 5).map((product, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap">
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
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Purchase Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold">{purchaseReport.totalOrders}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expense</p>
              <p className="text-xl font-bold text-red-600">
                ${purchaseReport.totalExpense.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-xl font-bold text-green-600">
                {purchaseReport.receivedOrders}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-red-600">
                {purchaseReport.cancelledOrders}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {inventoryReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-semibold">Inventory Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-xl font-bold">
                {inventoryReport.totalProducts}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Stock Qty</p>
              <p className="text-xl font-bold">
                {inventoryReport.totalStockQuantity}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-bold text-green-600">
                ${inventoryReport.totalValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-xl font-bold text-red-600">
                {inventoryReport.lowStockCount}
              </p>
            </div>
          </div>

          {inventoryReport.lowStockProducts &&
            inventoryReport.lowStockProducts.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3 text-red-600">
                  Low Stock Alert
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryReport.lowStockProducts
                        .slice(0, 5)
                        .map((product, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.sku}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.minStock}
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

      {/* Invoice Report */}
      {invoiceReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold">Invoice Report</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-xl font-bold">{invoiceReport.totalInvoices}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold">
                ${invoiceReport.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-xl font-bold text-green-600">
                ${invoiceReport.paidAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-xl font-bold text-red-600">
                ${invoiceReport.unpaidAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {invoiceReport.overdueInvoices &&
            invoiceReport.overdueInvoices.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3 text-red-600">
                  Overdue Invoices ({invoiceReport.overdueCount})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
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
                          Amount Due
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoiceReport.overdueInvoices
                        .slice(0, 5)
                        .map((invoice, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {invoice.customerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-red-600">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                              $
                              {(invoice.total - invoice.paidAmount).toFixed(2)}
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
    </div>
  );
}

export default Reports;

