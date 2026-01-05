import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import { useAddStockMutation } from "../../state/stocks/stockSlice";
import { useGetProductsQuery } from "../../state/products/productSlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const stockSchema = z.object({
  productId: z.string().trim().min(1, { message: "Product is required" }),
  quantity: z.string().trim().min(1, { message: "Quantity is required" }),
  location: z.string().trim().optional(),
  warehouseSection: z.string().trim().optional(),
  batchNumber: z.string().trim().optional(),
  expiryDate: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type StockFormData = z.infer<typeof stockSchema>;

function AddStock() {
  const [addStock] = useAddStockMutation();
  const { data: productsData } = useGetProductsQuery({});
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      productId: "",
      quantity: "",
      location: "",
      warehouseSection: "",
      batchNumber: "",
      expiryDate: "",
      notes: "",
    },
  });

  const selectedProductId = watch("productId");
  const products = productsData?.data || [];
  const selectedProduct = products.find((p: any) => p.id === selectedProductId);

  // Prepare product options for Select component
  const productOptions = products.map((product: any) => ({
    value: product.id,
    label: `${product.name} (Current Stock: ${product.stock || 0})`,
  }));

  useEffect(() => {
    setPageTitle("Add Stock");
  }, []);

  const onSubmit = async (data: StockFormData) => {
    try {
      const payload = {
        ...data,
        quantity: parseInt(data.quantity),
      };

      const response = await addStock(payload);
      if (!response.error) {
        toast.success("Stock added successfully!", toastConfig.success);
        setTimeout(() => navigate("/stocks"), 1500);
      } else {
        const errorMsg = (response.error as any)?.data?.message || "Failed to add stock";
        toast.error(errorMsg, toastConfig.error);
      }
    } catch (error: any) {
      console.error("Failed to add stock:", error);
      toast.error(error?.data?.message || "Failed to add stock", toastConfig.error);
    }
  };

  return (
    <div className="max-w-3xl">
      <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate("/stocks")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Stocks
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Add Stock</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Select
            label="Product"
            required
            error={errors.productId?.message as string}
            options={productOptions}
            placeholder="Select Product"
            {...register("productId")}
          />

          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Product Information</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-blue-600">Category:</dt>
                  <dd className="font-medium">{selectedProduct.categoryName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-blue-600">Current Stock:</dt>
                  <dd className="font-medium">{selectedProduct.stock}</dd>
                </div>
                <div>
                  <dt className="text-blue-600">Min Stock:</dt>
                  <dd className="font-medium">{selectedProduct.minStock || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-blue-600">Unit:</dt>
                  <dd className="font-medium">{selectedProduct.unit || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}

          <Input
            type="number"
            label="Quantity to Add"
            {...register("quantity")}
            error={errors.quantity?.message}
            placeholder="Enter quantity to add to stock"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location"
              {...register("location")}
              error={errors.location?.message}
              placeholder="e.g., Warehouse A"
            />

            <Input
              label="Warehouse Section"
              {...register("warehouseSection")}
              error={errors.warehouseSection?.message}
              placeholder="e.g., Aisle 3, Shelf B"
            />

            <Input
              label="Batch Number"
              {...register("batchNumber")}
              error={errors.batchNumber?.message}
              placeholder="e.g., BATCH-2025-001"
            />

            <Input
              type="date"
              label="Expiry Date"
              {...register("expiryDate")}
              error={errors.expiryDate?.message}
            />
          </div>

          <Textarea
            label="Notes (Optional)"
            {...register("notes")}
            error={errors.notes?.message}
            rows={3}
            placeholder="Add any additional notes about this stock entry"
          />

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/stocks")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStock;

