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
  useGetPurchaseOrderByIdQuery,
  useUpdatePurchaseOrderMutation,
} from "../../state/purchaseOrders/purchaseOrderSlice";
import { useGetProductsQuery } from "../../state/products/productSlice";
import { useGetSuppliersQuery } from "../../state/suppliers/supplierSlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const purchaseOrderSchema = z.object({
  orderNumber: z.string().trim().min(1, { message: "Order number is required" }),
  supplierId: z.string().trim().optional(),
  supplierName: z.string().trim().min(1, { message: "Supplier name is required" }),
  supplierEmail: z.string().trim().email({ message: "Invalid email" }).optional().or(z.literal("")),
  supplierPhone: z.string().trim().optional(),
  supplierAddress: z.string().trim().optional(),
  orderDate: z.string().trim().min(1, { message: "Order date is required" }),
  expectedDate: z.string().trim().optional(),
  status: z.string().trim().min(1, { message: "Status is required" }),
  taxRate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(z.object({
    productId: z.string().trim().min(1, { message: "Product is required" }),
    quantity: z.string().trim().min(1, { message: "Quantity is required" }),
    price: z.string().trim().min(1, { message: "Price is required" }),
  })).min(1, { message: "At least one item is required" }),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

function EditPurchaseOrder() {
  const { id } = useParams<{ id: string }>();
  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();
  const { data: purchaseOrderData, isLoading, isError } = useGetPurchaseOrderByIdQuery(id!);
  const { data: productsData } = useGetProductsQuery({});
  const { data: suppliersData } = useGetSuppliersQuery();
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
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items") || [];
  const taxRate = watch("taxRate");
  const selectedSupplierId = watch("supplierId");

  useEffect(() => {
    setPageTitle("Edit Purchase Order");
  }, [setPageTitle]);

  const products = productsData?.data || [];
  const suppliers = suppliersData?.data || [];
  const purchaseOrder = (purchaseOrderData as any)?.data || purchaseOrderData;

  useEffect(() => {
    if (purchaseOrder && purchaseOrder.id) {
      const initialTaxRate = purchaseOrder.subtotal > 0 ? ((purchaseOrder.tax / purchaseOrder.subtotal) * 100).toFixed(2) : "0";
      reset({
        orderNumber: purchaseOrder.orderNumber || "",
        supplierId: purchaseOrder.supplierId || "",
        supplierName: purchaseOrder.supplierName || "",
        supplierEmail: purchaseOrder.supplierEmail || "",
        supplierPhone: purchaseOrder.supplierPhone || "",
        supplierAddress: purchaseOrder.supplierAddress || "",
        orderDate: purchaseOrder.orderDate ? purchaseOrder.orderDate.split('T')[0] : "",
        expectedDate: purchaseOrder.expectedDate ? purchaseOrder.expectedDate.split('T')[0] : "",
        status: purchaseOrder.status || "pending",
        taxRate: initialTaxRate,
        notes: purchaseOrder.notes || "",
        items: purchaseOrder.items?.map((item: any) => ({
          productId: item.productId || "",
          quantity: item.quantity ? String(item.quantity) : "",
          price: item.price ? String(item.price) : "",
        })) || [{ productId: "", quantity: "", price: "" }],
      });
    }
  }, [purchaseOrder, reset]);

  // Auto-fill supplier details when supplier is selected
  useEffect(() => {
    if (selectedSupplierId && suppliers) {
      const supplier = suppliers.find((s: any) => s.id === selectedSupplierId);
      if (supplier) {
        setValue("supplierName", supplier.name);
        setValue("supplierEmail", supplier.email || "");
        setValue("supplierPhone", supplier.phone || "");
        setValue("supplierAddress", supplier.address || "");
      }
    }
  }, [selectedSupplierId, suppliers, setValue]);

  // Auto-fill price when product is selected
  const handleProductChange = (index: number, productId: string) => {
    if (productId && products) {
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        setValue(`items.${index}.price`, (product.cost || product.price).toString());
      }
    }
  };

  // Calculate totals reactively
  const subtotal = items.reduce((sum, item) => {
    const quantity = parseFloat(item?.quantity || "0") || 0;
    const price = parseFloat(item?.price || "0") || 0;
    return sum + (quantity * price);
  }, 0);

  const calculatedTax = subtotal * (parseFloat(taxRate || "0") / 100);
  const total = subtotal + calculatedTax;

  const onSubmit = async (data: PurchaseOrderFormData) => {
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
        tax: calculatedTax,
        discount: 0,
        total,
        taxRate: parseFloat(data.taxRate || "0"),
      };

      const response = await updatePurchaseOrder(payload);
      if (!response.error) {
        toast.success("Purchase order updated successfully!", toastConfig.success);
        setTimeout(() => navigate("/purchase-orders"), 1500);
      } else {
        const errorMsg = (response.error as any)?.data?.message || "Failed to update purchase order";
        toast.error(errorMsg, toastConfig.error);
      }
    } catch (error: any) {
      console.error("Failed to update purchase order:", error);
      toast.error(error?.data?.message || "Failed to update purchase order", toastConfig.error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading purchase order...</div>;
  }

  if (isError || !purchaseOrder || !purchaseOrder.id) {
    return <div className="text-center py-10 text-red-600">Purchase order not found</div>;
  }

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "ordered", label: "Ordered" },
    { value: "received", label: "Received" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="max-w-5xl">
      <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate("/purchase-orders")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Purchase Orders
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Purchase Order</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Order Number"
              {...register("orderNumber")}
              error={errors.orderNumber?.message}
              required
              readOnly
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={statusOptions}
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
              label="Expected Date"
              {...register("expectedDate")}
              error={errors.expectedDate?.message}
            />
          </div>

          {/* Supplier Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Select Supplier (Optional)"
                    options={[
                      { value: "", label: "-- Select Supplier --" },
                      ...suppliers.map((supplier: any) => ({
                        value: supplier.id,
                        label: supplier.name,
                      })),
                    ]}
                    {...field}
                  />
                )}
              />

              <Input
                label="Supplier Name"
                {...register("supplierName")}
                error={errors.supplierName?.message}
                required
                readOnly={!!selectedSupplierId}
                disabled={!!selectedSupplierId}
              />

              <Input
                label="Supplier Email"
                type="email"
                {...register("supplierEmail")}
                error={errors.supplierEmail?.message}
                readOnly={!!selectedSupplierId}
                disabled={!!selectedSupplierId}
              />

              <Input
                label="Supplier Phone"
                {...register("supplierPhone")}
                error={errors.supplierPhone?.message}
                readOnly={!!selectedSupplierId}
                disabled={!!selectedSupplierId}
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Supplier Address"
                  {...register("supplierAddress")}
                  error={errors.supplierAddress?.message}
                  rows={2}
                  readOnly={!!selectedSupplierId}
                  disabled={!!selectedSupplierId}
                />
              </div>
            </div>
            {selectedSupplierId && (
              <p className="text-sm text-gray-500 mt-2">
                Supplier details are read-only. To update, edit the supplier in the Suppliers page.
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
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <Controller
                        name={`items.${index}.productId`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Product"
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

                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        label="Quantity"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: false,
                        })}
                        error={errors.items?.[index]?.quantity?.message}
                        required
                        min="1"
                        placeholder="0"
                        layout="stacked"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        label="Cost Price"
                        {...register(`items.${index}.price`, {
                          valueAsNumber: false,
                        })}
                        error={errors.items?.[index]?.price?.message}
                        required
                        min="0"
                        placeholder="0.00"
                        layout="stacked"
                        inputClassName="min-w-[140px] px-3 py-2 text-base"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <div className="text-lg font-semibold text-gray-900 py-2">
                        ${((parseFloat(items[index]?.quantity || "0") || 0) * (parseFloat(items[index]?.price || "0") || 0)).toFixed(2)}
                      </div>
                    </div>

                    <div className="md:col-span-1 flex justify-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => remove(index)}
                          className="mt-6"
                          title="Remove item"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.items && typeof errors.items.message === 'string' && (
              <p className="text-red-500 text-sm mt-2">{errors.items.message}</p>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <Input
                  label="Tax (%)"
                  type="number"
                  step="0.01"
                  {...register("taxRate")}
                  error={errors.taxRate?.message}
                  min="0"
                  max="100"
                  placeholder="0"
                  layout="inline"
                  labelClassName="min-w-[100px]"
                  inputClassName="max-w-[100px] text-right"
                />
                <span className="font-semibold">${calculatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
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
              onClick={() => navigate("/purchase-orders")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Purchase Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPurchaseOrder;
