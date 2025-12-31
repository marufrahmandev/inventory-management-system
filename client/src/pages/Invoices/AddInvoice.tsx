import { ArrowLeft, Plus, Trash } from "lucide-react";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import { useAddInvoiceMutation } from "../../state/invoices/invoiceSlice";
import { useGetProductsQuery } from "../../state/products/productSlice";
import { useGetCustomersQuery } from "../../state/customers/customerSlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1, { message: "Invoice number is required" }),
  customerId: z.string().trim().optional(),
  customerName: z.string().trim().min(1, { message: "Customer name is required" }),
  customerEmail: z.string().trim().optional(),
  customerPhone: z.string().trim().optional(),
  customerAddress: z.string().trim().optional(),
  invoiceDate: z.string().trim().min(1, { message: "Invoice date is required" }),
  dueDate: z.string().trim().optional(),
  status: z.string().trim().min(1, { message: "Status is required" }),
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
  const { data: products } = useGetProductsQuery({});
  const { data: customers } = useGetCustomersQuery();
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
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      status: "unpaid",
      notes: "",
      items: [{ productId: "", quantity: "", price: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedCustomerId = watch("customerId");
  const items = watch("items");

  useEffect(() => {
    setPageTitle("Add Invoice");
  }, []);

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

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);
  };

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const subtotal = calculateSubtotal();
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      const payload = {
        ...data,
        items: data.items.map((item: any) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        paidAmount: 0,
      };

      await addInvoice(payload).unwrap();
      toast.success("Invoice created successfully!", toastConfig);
      setTimeout(() => navigate("/invoices"), 1500);
    } catch (error: any) {
      console.error("Failed to create invoice:", error);
      toast.error(error?.data?.message || "Failed to create invoice", toastConfig);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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

            <Select
              label="Status"
              {...register("status")}
              error={errors.status?.message}
              required
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </Select>

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
              <Select
                label="Select Customer (Optional)"
                {...register("customerId")}
              >
                <option value="">-- Select Customer --</option>
                {customers?.data?.map((customer: any) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Customer Name"
                {...register("customerName")}
                error={errors.customerName?.message}
                required
              />

              <Input
                label="Customer Email"
                type="email"
                {...register("customerEmail")}
                error={errors.customerEmail?.message}
              />

              <Input
                label="Customer Phone"
                {...register("customerPhone")}
                error={errors.customerPhone?.message}
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Customer Address"
                  {...register("customerAddress")}
                  error={errors.customerAddress?.message}
                  rows={2}
                />
              </div>
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
                <div key={field.id} className="grid grid-cols-12 gap-4 items-start border p-4 rounded">
                  <div className="col-span-5">
                    <Select
                      label="Product"
                      {...register(`items.${index}.productId`)}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      error={errors.items?.[index]?.productId?.message}
                      required
                    >
                      <option value="">-- Select Product --</option>
                      {products?.data?.map((product: any) => (
                        <option key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      label="Quantity"
                      {...register(`items.${index}.quantity`)}
                      error={errors.items?.[index]?.quantity?.message}
                      required
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      type="number"
                      step="0.01"
                      label="Price"
                      {...register(`items.${index}.price`)}
                      error={errors.items?.[index]?.price?.message}
                      required
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                      <div className="text-lg font-semibold">
                        ${((parseFloat(items[index]?.quantity) || 0) * (parseFloat(items[index]?.price) || 0)).toFixed(2)}
                      </div>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => remove(index)}
                        className="ml-2"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Amount Paid:</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600">
                  <span>Balance Due:</span>
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

