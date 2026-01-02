import { ArrowLeft, Printer, FileText, ExternalLink } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Button from "../../elements/Button";
import { useGetSalesOrderByIdQuery } from "../../state/salesOrders/salesOrderSlice";
import { useGetInvoicesBySalesOrderIdQuery } from "../../state/invoices/invoiceSlice";

function ViewSalesOrder() {
  const { id } = useParams<{ id: string }>();
  const { data: salesOrderData, isLoading, isError } = useGetSalesOrderByIdQuery(id!);
  const { data: invoicesData } = useGetInvoicesBySalesOrderIdQuery(id!);
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  useEffect(() => {
    setPageTitle("View Sales Order");
  }, [setPageTitle]);

  const invoices = (invoicesData as any)?.data || invoicesData || [];

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading sales order...</div>;
  }

  const salesOrder = (salesOrderData as any)?.data || salesOrderData;

  if (isError || !salesOrder || !salesOrder.id) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Sales order not found</p>
        <Button onClick={() => navigate("/sales-orders")} className="mt-4">
          Back to Sales Orders
        </Button>
      </div>
    );
  }

  const order = salesOrder;

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-5xl print:max-w-full">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate("/sales-orders")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Sales Orders
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/sales-orders/edit/${id}`)}>
            Edit
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Sales Order</h1>
              <p className="text-2xl text-gray-600">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Order & Customer Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Order Date:</dt>
                <dd className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</dd>
              </div>
              {order.deliveryDate && (
                <div>
                  <dt className="text-sm text-gray-600">Delivery Date:</dt>
                  <dd className="font-medium">{new Date(order.deliveryDate).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Name:</dt>
                <dd className="font-medium">{order.customerName}</dd>
              </div>
              {order.customerEmail && (
                <div>
                  <dt className="text-sm text-gray-600">Email:</dt>
                  <dd className="font-medium">{order.customerEmail}</dd>
                </div>
              )}
              {order.customerPhone && (
                <div>
                  <dt className="text-sm text-gray-600">Phone:</dt>
                  <dd className="font-medium">{order.customerPhone}</dd>
                </div>
              )}
              {order.customerAddress && (
                <div>
                  <dt className="text-sm text-gray-600">Address:</dt>
                  <dd className="font-medium">{order.customerAddress}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      ${parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="flex justify-end">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span className="font-semibold">${parseFloat(order.tax || 0).toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-${parseFloat(order.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>${parseFloat(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Invoices */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Related Invoices</h3>
          </div>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.invoiceDate).toLocaleDateString()} • ${parseFloat(invoice.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : invoice.status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {invoice.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      View <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 border border-dashed rounded-lg text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No invoices generated for this sales order yet.</p>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p>Created on {new Date(order.createdAt).toLocaleString()}</p>
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <p>Last updated on {new Date(order.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewSalesOrder;

