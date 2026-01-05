import { ArrowLeft, Printer, DollarSign, ExternalLink, FileText } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Button from "../../elements/Button";
import { useGetInvoiceByIdQuery } from "../../state/invoices/invoiceSlice";
import { useGetSalesOrderByIdQuery } from "../../state/salesOrders/salesOrderSlice";

function ViewInvoice() {
  const { id } = useParams<{ id: string }>();
  const { data: invoiceData, isLoading, isError } = useGetInvoiceByIdQuery(id!);
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  useEffect(() => {
    setPageTitle("View Invoice");
  }, [setPageTitle]);
  
  // Handle wrapped response from API
  const invoice = (invoiceData as any)?.data || invoiceData;
  
  // Fetch sales order if invoice has salesOrderId
  const { data: salesOrderData } = useGetSalesOrderByIdQuery(invoice?.salesOrderId || "", {
    skip: !invoice?.salesOrderId,
  });
  const salesOrder = (salesOrderData as any)?.data || salesOrderData;

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading invoice...</div>;
  }

  if (isError || !invoice || !invoice.id) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Invoice not found</p>
        <Button onClick={() => navigate("/invoices")} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    );
  }

  const inv = invoice;
  const paidAmount = parseFloat(inv.paidAmount || "0");
  const total = parseFloat(inv.total || "0");
  const balanceDue = total - paidAmount;

  const getStatusColor = (status: string) => {
    const colors: any = {
      unpaid: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-5xl print:max-w-full">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate("/invoices")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Invoices
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/invoices/edit/${id}`)}>
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
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <p className="text-2xl text-gray-600">#{inv.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(inv.status)}`}>
                {inv.status.toUpperCase()}
              </span>
              {paidAmount > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <DollarSign className="inline h-4 w-4" />
                  Paid: ${paidAmount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice & Customer Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Invoice Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Invoice Date:</dt>
                <dd className="font-medium">{new Date(inv.invoiceDate).toLocaleDateString()}</dd>
              </div>
              {inv.dueDate && (
                <div>
                  <dt className="text-sm text-gray-600">Due Date:</dt>
                  <dd className="font-medium">{new Date(inv.dueDate).toLocaleDateString()}</dd>
                </div>
              )}
              {inv.salesOrderId && salesOrder && (
                <div>
                  <dt className="text-sm text-gray-600">Sales Order:</dt>
                  <dd className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{salesOrder.orderNumber}</span>
                    <button
                      onClick={() => navigate(`/sales-orders/view/${inv.salesOrderId}`)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Bill To</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Customer:</dt>
                <dd className="font-medium">{inv.customerName}</dd>
              </div>
              {inv.customerEmail && (
                <div>
                  <dt className="text-sm text-gray-600">Email:</dt>
                  <dd className="font-medium">{inv.customerEmail}</dd>
                </div>
              )}
              {inv.customerPhone && (
                <div>
                  <dt className="text-sm text-gray-600">Phone:</dt>
                  <dd className="font-medium">{inv.customerPhone}</dd>
                </div>
              )}
              {inv.customerAddress && (
                <div>
                  <dt className="text-sm text-gray-600">Address:</dt>
                  <dd className="font-medium">{inv.customerAddress}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Items</h3>
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
                {inv.items?.map((item: any, index: number) => (
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

        {/* Invoice Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${parseFloat(inv.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span className="font-semibold">${parseFloat(inv.tax || 0).toFixed(2)}</span>
              </div>
              {inv.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-${parseFloat(inv.discount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              {paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600 border-t pt-2">
                    <span>Amount Paid:</span>
                    <span className="font-semibold">${paidAmount.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-xl font-bold border-t pt-2 ${
                    balanceDue > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    <span>Balance Due:</span>
                    <span>${balanceDue.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {inv.status === "paid" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-semibold">This invoice has been paid in full.</span>
            </div>
          </div>
        )}

        {inv.status === "partial" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-semibold">
                Partially paid: ${paidAmount.toFixed(2)} of ${total.toFixed(2)}. 
                Balance due: ${balanceDue.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {inv.status === "overdue" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-semibold">This invoice is overdue. Please remit payment immediately.</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {inv.notes && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-600">{inv.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          <p>Created on {new Date(inv.createdAt).toLocaleString()}</p>
          {inv.updatedAt && inv.updatedAt !== inv.createdAt && (
            <p>Last updated on {new Date(inv.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewInvoice;

