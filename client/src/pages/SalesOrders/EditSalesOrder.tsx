import { ArrowLeft, Plus, Trash } from "lucide-react";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import {
  useGetSalesOrderByIdQuery,
  useUpdateSalesOrderMutation,
} from "../../state/salesOrders/salesOrderSlice";
import { useGetProductsQuery } from "../../state/products/productSlice";
import { useGetCustomersQuery } from "../../state/customers/customerSlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const salesOrderSchema = z.object({
  orderNumber: z.string().trim().min(1, { message: "Order number is required" }),
  customerId: z.string().trim().optional(),
  customerName: z.string().trim().min(1, { message: "Customer name is required" }),
  customerEmail: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  customerAddress: z.string().trim().optional(),
  orderDate: z.string().trim().min(1, { message: "Order date is required" }),
  deliveryDate: z.string().trim().optional(),
  status: z.string().trim().min(1, { message: "Status is required" }),
  taxRate: z.string().trim().optional(),
  discount: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(z.object({
    productId: z.string().trim().min(1, { message: "Product is required" }),
    quantity: z.string().trim().min(1, { message: "Quantity is required" }),
    price: z.string().trim().min(1, { message: "Price is required" }),
  })).min(1, { message: "At least one item is required" }),
});

type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

function EditSalesOrder() {
  const { id } = useParams<{ id: string }>();
  const [updateSalesOrder] = useUpdateSalesOrderMutation();
  const { data: salesOrderData, isLoading, isError } = useGetSalesOrderByIdQuery(id!);
  const { data: productsData } = useGetProductsQuery({});
  const { data: customersData } = useGetCustomersQuery();
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      taxRate: "0",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items") || [];
  const products = productsData?.data || [];
  const customers = customersData?.data || [];
  const salesOrder = (salesOrderData as any)?.data || salesOrderData;

  useEffect(() => {
    setPageTitle("Edit Sales Order");
  }, [setPageTitle]);

  useEffect(() => {
    if (salesOrder && salesOrder.id) {
      const existingSubtotal =
        typeof salesOrder.subtotal === "number"
          ? salesOrder.subtotal
          : parseFloat(String(salesOrder.subtotal || "0")) || 0;
      const existingTax =
        typeof salesOrder.tax === "number"
          ? salesOrder.tax
          : parseFloat(String(salesOrder.tax || "0")) || 0;

      const inferredTaxRate =
        existingSubtotal > 0 ? ((existingTax / existingSubtotal) * 100).toFixed(2) : "0";

      reset({
        orderNumber: salesOrder.orderNumber || "",
        customerId: salesOrder.customerId || "",
        customerName: salesOrder.customerName || "",
        customerEmail: salesOrder.customerEmail || "",
        customerPhone: salesOrder.customerPhone || "",
        customerAddress: salesOrder.customerAddress || "",
        orderDate: salesOrder.orderDate ? salesOrder.orderDate.split('T')[0] : "",
        deliveryDate: salesOrder.deliveryDate ? salesOrder.deliveryDate.split('T')[0] : "",
        status: salesOrder.status || "pending",
        taxRate: inferredTaxRate,
        discount: salesOrder.discount ? String(salesOrder.discount) : "0",
        notes: salesOrder.notes || "",
        items: salesOrder.items?.map((item: any) => ({
          productId: item.productId || "",
          quantity: item.quantity ? String(item.quantity) : "",
          price: item.price ? String(item.price) : "",
        })) || [{ productId: "", quantity: "", price: "" }],
      });
    }
  }, [salesOrder, reset]);

  const selectedCustomerId = watch("customerId");
  const discount = watch("discount");

  // Auto-fill customer details when customer is selected
  useEffect(() => {
    if (selectedCustomerId && customers) {
      const customer = customers.find((c: any) => c.id === selectedCustomerId);
      if (customer) {
        setValue("customerName", customer.name);
        setValue("customerEmail", customer.email || "");
        setValue("customerPhone", customer.phone || "");
        setValue("customerAddress", customer.address || "");
      }
    }
  }, [selectedCustomerId, customers, setValue]);

  // Auto-fill price when product is selected
  const handleProductChange = (index: number, productId: string) => {
    if (productId && products) {
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        setValue(`items.${index}.price`, product.price?.toString?.() || String(product.price || ""));
      }
    }
  };

  // Calculate totals (compute every render; avoids stale memos with field arrays)
  const subtotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item?.quantity || "0") || 0;
    const price = parseFloat(item?.price || "0") || 0;
    return sum + quantity * price;
  }, 0);

  const taxRate = watch("taxRate") || "0";
  const taxPercent = Math.max(0, parseFloat(taxRate || "0") || 0);
  const tax = subtotal * (taxPercent / 100);
  const discountAmount = Math.max(0, parseFloat(discount || "0") || 0);
  const total = Math.max(0, subtotal + tax - discountAmount);

  const onSubmit = async (data: SalesOrderFormData) => {
    try {

      const payload = {
        id,
        ...data,
        items: data.items.map((item: any) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        subtotal,
        tax,
        discount: discountAmount,
        total,
      };

      const response = await updateSalesOrder(payload);
      if (!response.error) {
        toast.success("Sales order updated successfully!", toastConfig.success);
        setTimeout(() => navigate("/sales-orders"), 1500);
      } else {
        const errorMsg = (response.error as any)?.data?.message || "Failed to update sales order";
        toast.error(errorMsg, toastConfig.error);
      }
    } catch (error: any) {
      console.error("Failed to update sales order:", error);
      toast.error(error?.data?.message || "Failed to update sales order", toastConfig.error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading sales order...</div>;
  }

  if (isError || !salesOrder || !salesOrder.id) {
    return <div className="text-center py-10 text-red-600">Sales order not found</div>;
  }

  return (
    <div className="max-w-5xl">
      <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate("/sales-orders")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Sales Orders
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Sales Order</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order Number"
              {...register("orderNumber")}
              error={errors.orderNumber?.message}
              required
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "processing", label: "Processing" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                  error={errors.status?.message}
                  required
                  {...field}
                />
              )}
            />

            <Input
              type="date"
              label="Order Date"
              {...register("orderDate")}
              error={errors.orderDate?.message}
              required
            />

            <Input
              type="date"
              label="Delivery Date"
              {...register("deliveryDate")}
              error={errors.deliveryDate?.message}
            />
          </div>

          {/* Customer Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Select Customer (Optional)"
                    options={[
                      { value: "", label: "-- Select Customer --" },
                      ...customers.map((customer: any) => ({
                        value: customer.id,
                        label: customer.name,
                      })),
                    ]}
                    {...field}
                  />
                )}
              />

              <Input
                label="Customer Name"
                {...register("customerName")}
                error={errors.customerName?.message}
                required
                readOnly={!!selectedCustomerId}
                disabled={!!selectedCustomerId}
              />

              <Input
                label="Customer Email"
                type="email"
                {...register("customerEmail")}
                error={errors.customerEmail?.message}
                readOnly={!!selectedCustomerId}
                disabled={!!selectedCustomerId}
              />

              <Input
                label="Customer Phone"
                {...register("customerPhone")}
                error={errors.customerPhone?.message}
                readOnly={!!selectedCustomerId}
                disabled={!!selectedCustomerId}
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Customer Address"
                  {...register("customerAddress")}
                  error={errors.customerAddress?.message}
                  rows={2}
                  readOnly={!!selectedCustomerId}
                  disabled={!!selectedCustomerId}
                />
              </div>
            </div>
            {selectedCustomerId && (
              <p className="text-sm text-gray-500 mt-2">
                Customer details are read-only. To update, edit the customer in the Customers page.
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ productId: "", quantity: "", price: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Product Field */}
                    <div>
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Product"
                            layout="stacked"
                            containerClassName="w-full"
                            inputClassName="py-2 text-base"
                            options={[
                              { value: "", label: "-- Select Product --" },
                              ...products.map((product: any) => ({
                                value: product.id,
                                label: `${product.name} (Stock: ${product.stock || 0})`,
                              })),
                            ]}
                            error={errors.items?.[index]?.productId?.message}
                            required
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleProductChange(index, e.target.value);
                            }}
                          />
                        )}
                      />
                    </div>

                    {/* Quantity, Price, Total Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Input
                          type="number"
                          label="Quantity"
                          layout="stacked"
                          containerClassName="w-full"
                          inputClassName="py-2 text-base"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: false,
                          })}
                          error={errors.items?.[index]?.quantity?.message}
                          required
                          min="1"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          label="Price"
                          layout="stacked"
                          containerClassName="w-full"
                          inputClassName="py-2 text-base min-w-[140px]"
                          {...register(`items.${index}.price`, {
                            valueAsNumber: false,
                          })}
                          error={errors.items?.[index]?.price?.message}
                          required
                          min="0"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total
                        </label>
                        <div className="text-xl font-bold text-gray-900 py-2">
                          $
                          {(
                            (parseFloat(items[index]?.quantity || "0") || 0) *
                            (parseFloat(items[index]?.price || "0") || 0)
                          ).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => remove(index)}
                            title="Remove item"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="max-w-md ml-auto">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Tax (%):</span>
                    <div className="w-28">
                      <Input
                        type="number"
                        step="0.01"
                        label=""
                        layout="stacked"
                        containerClassName="w-full"
                        inputClassName="py-2 text-sm"
                        placeholder="0"
                        {...register("taxRate")}
                      />
                    </div>
                  </div>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Discount:</span>
                    <div className="w-28">
                      <Input
                        type="number"
                        step="0.01"
                        label=""
                        layout="stacked"
                        containerClassName="w-full"
                        inputClassName="py-2 text-sm"
                        placeholder="0.00"
                        min="0"
                        {...register("discount")}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-orange-600">${discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <Textarea
              label="Notes (Optional)"
              {...register("notes")}
              error={errors.notes?.message}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/sales-orders")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Sales Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSalesOrder;

