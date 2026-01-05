import { ArrowLeft, Plus, Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import { useAddInvoiceMutation, useGetNextInvoiceNumberQuery } from "../../state/invoices/invoiceSlice";
import { useGetProductsQuery } from "../../state/products/productSlice";
import { useGetCustomersQuery } from "../../state/customers/customerSlice";
import { useGetSalesOrdersQuery } from "../../state/salesOrders/salesOrderSlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, { message: "Invoice number is required" }),
  salesOrderId: z.string().trim().optional(),
  customerId: z.string().trim().optional(),
  customerName: z.string().trim().min(1, { message: "Customer name is required" }),
  customerEmail: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  customerAddress: z.string().trim().optional(),
  invoiceDate: z.string().trim().min(1, { message: "Invoice date is required" }),
  dueDate: z.string().trim().optional(),
  status: z.string().trim().min(1, { message: "Status is required" }),
  taxRate: z.string().trim().optional(),
  paidAmount: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(z.object({
    productId: z.string().trim().min(1, { message: "Product is required" }),
    quantity: z.string().trim().min(1, { message: "Quantity is required" }),
    price: z.string().trim().min(1, { message: "Price is required" }),
  })).min(1, { message: "At least one item is required" }),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

function AddInvoice() {
  const [addInvoice] = useAddInvoiceMutation();
  const { data: products, isLoading: productsLoading } = useGetProductsQuery({});
  const { data: customers, isLoading: customersLoading } = useGetCustomersQuery({});
  const { data: salesOrders, isLoading: salesOrdersLoading } = useGetSalesOrdersQuery({});
  const { data: nextNumberData } = useGetNextInvoiceNumberQuery({});
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
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      salesOrderId: "",
      customerId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      status: "unpaid",
      taxRate: "0",
      paidAmount: "0",
      notes: "",
      items: [{ productId: "", quantity: "", price: "" }],
    },
  });

  // Auto-fill invoice number from backend
  useEffect(() => {
    if (nextNumberData?.data?.invoiceNumber) {
      setValue("invoiceNumber", nextNumberData.data.invoiceNumber);
    }
  }, [nextNumberData, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedCustomerId = watch("customerId");
  const items = watch("items");
  const taxRate = watch("taxRate");
  const paidAmount = watch("paidAmount");
  
  const manuallyEditedRef = useRef(false);
  const previousTotalRef = useRef(0);

  useEffect(() => {
    setPageTitle("Add Invoice");
  }, [setPageTitle]);

  // Auto-fill customer details when customer is selected
  useEffect(() => {
    if (selectedCustomerId && customers?.data) {
      const customer = customers.data.find((c: any) => c.id === selectedCustomerId);
      if (customer) {
        setValue("customerName", customer.name);
        setValue("customerEmail", customer.email || "");
        setValue("customerPhone", customer.phone || "");
        setValue("customerAddress", customer.address || "");
      }
    } else if (!selectedCustomerId) {
      // Clear fields when no customer is selected
      setValue("customerName", "");
      setValue("customerEmail", "");
      setValue("customerPhone", "");
      setValue("customerAddress", "");
    }
  }, [selectedCustomerId, customers, setValue]);

  // Auto-fill price when product is selected
  const handleProductChange = (index: number, productId: string) => {
    if (productId && products?.data) {
      const product = products.data.find((p: any) => p.id === productId);
      if (product) {
        setValue(`items.${index}.price`, product.price.toString());
      }
    }
  };

  // Calculate totals - make reactive by not using useMemo
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const taxRateValue = parseFloat(taxRate) || 0;
  const tax = (subtotal * taxRateValue) / 100;
  const total = subtotal + tax;
  const paid = parseFloat(paidAmount) || 0;
  // Fix negative zero issue with Math.abs check
  const balanceDue = Math.abs(total - paid) < 0.01 ? 0 : total - paid;

  // Auto-update Amount Paid to match Total when total changes
  useEffect(() => {
    if (total > 0) {
      // Only auto-update if user hasn't manually edited the field
      // OR if the total changed (items/tax modified)
      if (!manuallyEditedRef.current || Math.abs(previousTotalRef.current - total) > 0.01) {
        setValue("paidAmount", total.toFixed(2));
        previousTotalRef.current = total;
      }
    }
  }, [total, setValue]);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const finalSubtotal = calculateSubtotal();
      const finalTaxRate = parseFloat(data.taxRate || "0");
      const finalTax = (finalSubtotal * finalTaxRate) / 100;
      const finalTotal = finalSubtotal + finalTax;
      const finalPaidAmount = parseFloat(data.paidAmount || "0");

      const payload = {
        ...data,
        salesOrderId: data.salesOrderId || null,
        customerId: data.customerId || null,
        items: data.items.map((item: any) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        subtotal: finalSubtotal,
        tax: finalTax,
        discount: 0,
        total: finalTotal,
        paidAmount: finalPaidAmount,
      };

      await addInvoice(payload).unwrap();
      toast.success("Invoice created successfully!", toastConfig.success);
      setTimeout(() => navigate("/invoices"), 1500);
    } catch (error: any) {
      console.error("Failed to create invoice:", error);
      toast.error(error?.data?.message || "Failed to create invoice", toastConfig.error);
    }
  };

  return (
    <div className="max-w-5xl">
      <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate("/invoices")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Invoices
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Add Invoice</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Invoice Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Invoice Number"
              {...register("invoiceNumber")}
              error={errors.invoiceNumber?.message}
              required
            />

            <Controller
              name="salesOrderId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Sales Order (Optional)"
                  options={[
                    { value: "", label: "-- Select Sales Order --" },
                    ...(salesOrdersLoading ? [] : (salesOrders?.data || []).map((order: any) => ({
                      value: order.id,
                      label: `${order.orderNumber} - ${order.customerName} ($${parseFloat(order.total || 0).toFixed(2)})`,
                    }))),
                  ]}
                  {...field}
                />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  options={[
                    { value: "unpaid", label: "Unpaid" },
                    { value: "partial", label: "Partially Paid" },
                    { value: "paid", label: "Paid" },
                    { value: "overdue", label: "Overdue" },
                  ]}
                  error={errors.status?.message}
                  required
                  {...field}
                />
              )}
            />

            <Input
              type="date"
              label="Invoice Date"
              {...register("invoiceDate")}
              error={errors.invoiceDate?.message}
              required
            />

            <Input
              type="date"
              label="Due Date"
              {...register("dueDate")}
              error={errors.dueDate?.message}
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
                      ...(customersLoading ? [] : (customers?.data || []).map((customer: any) => ({
                        value: customer.id,
                        label: customer.name,
                      }))),
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
              {!!selectedCustomerId && (
                <p className="text-sm text-gray-500 md:col-span-2 mt-2">
                  Customer details are read-only. To update, edit the customer in the Customers page.
                </p>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
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
                        render={({ field: selectField }) => (
                          <Select
                            label="Product"
                            layout="stacked"
                            containerClassName="w-full"
                            inputClassName="py-2 text-base"
                            options={[
                              { value: "", label: "-- Select Product --" },
                              ...(productsLoading ? [] : (products?.data || []).map((product: any) => ({
                                value: product.id,
                                label: `${product.name} (Stock: ${product.stock || 0})`,
                              }))),
                            ]}
                            error={errors.items?.[index]?.productId?.message}
                            required
                            {...selectField}
                            onChange={(e) => {
                              selectField.onChange(e);
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
            {errors.items && typeof errors.items.message === 'string' && (
              <p className="text-red-500 text-sm mt-2">{errors.items.message}</p>
            )}
          </div>

          {/* Invoice Summary */}
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
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Amount Paid:</span>
                    <div className="w-32">
                      <Input
                        type="number"
                        step="0.01"
                        label=""
                        layout="stacked"
                        containerClassName="w-full"
                        inputClassName="py-2 text-sm"
                        placeholder="0.00"
                        min="0"
                        {...register("paidAmount", {
                          onChange: () => {
                            manuallyEditedRef.current = true;
                          },
                        })}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">${paid.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between text-lg font-bold border-t pt-2 ${
                  balanceDue > 0 ? 'text-red-600' : balanceDue < 0 ? 'text-blue-600' : 'text-green-600'
                }`}>
                  <span>Balance Due:</span>
                  <span>{balanceDue < 0 ? '-' : ''}${Math.abs(balanceDue).toFixed(2)}</span>
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
              onClick={() => navigate("/invoices")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddInvoice;

