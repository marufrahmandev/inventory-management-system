import { ArrowLeft, Printer } from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Button from "../../elements/Button";
import { useGetPurchaseOrderByIdQuery } from "../../state/purchaseOrders/purchaseOrderSlice";

function ViewPurchaseOrder() {
  const { id } = useParams<{ id: string }>();
  const { data: purchaseOrder, isLoading } = useGetPurchaseOrderByIdQuery(id!);
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  useEffect(() => {
    setPageTitle("View Purchase Order");
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!purchaseOrder) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Purchase order not found</p>
        <Button onClick={() => navigate("/purchase-orders")} className="mt-4">
          Back to Purchase Orders
        </Button>
      </div>
    );
  }

  const order = purchaseOrder;

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      ordered: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-5xl print:max-w-full">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate("/purchase-orders")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Purchase Orders
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/purchase-orders/edit/${id}`)}>
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
              <h1 className="text-3xl font-bold mb-2">Purchase Order</h1>
              <p className="text-2xl text-gray-600">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Order & Supplier Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Order Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Order Date:</dt>
                <dd className="font-medium">{new Date(order.orderDate).toLocaleDateString()}</dd>
              </div>
              {order.expectedDate && (
                <div>
                  <dt className="text-sm text-gray-600">Expected Date:</dt>
                  <dd className="font-medium">{new Date(order.expectedDate).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Supplier Information</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-600">Name:</dt>
                <dd className="font-medium">{order.supplierName}</dd>
              </div>
              {order.supplierEmail && (
                <div>
                  <dt className="text-sm text-gray-600">Email:</dt>
                  <dd className="font-medium">{order.supplierEmail}</dd>
                </div>
              )}
              {order.supplierPhone && (
                <div>
                  <dt className="text-sm text-gray-600">Phone:</dt>
                  <dd className="font-medium">{order.supplierPhone}</dd>
                </div>
              )}
              {order.supplierAddress && (
                <div>
                  <dt className="text-sm text-gray-600">Address:</dt>
                  <dd className="font-medium">{order.supplierAddress}</dd>
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
                    Cost Price
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

export default ViewPurchaseOrder;

