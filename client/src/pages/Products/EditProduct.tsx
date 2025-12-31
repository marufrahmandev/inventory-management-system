import { ArrowLeft } from "lucide-react";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "../../state/products/productSlice";
import { useGetCategoriesQuery } from "../../state/categories/categorySlice";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .min(2, { message: "Minimum 2 characters required" }),
  categoryId: z.string().trim().min(1, { message: "Required" }),
  sku: z.string().trim(),
  description: z.string().trim(),
  price: z.string().trim().min(1, { message: "Required" }),
  cost: z.string().trim(),
  stock: z.string().trim().min(1, { message: "Required" }),
  minStock: z.string().trim(),
  unit: z.string().trim(),
  barcode: z.string().trim(),
});

type ProductFormData = z.infer<typeof productSchema>;

function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const [updateProduct] = useUpdateProductMutation();
  const { data: categories = [] } = useGetCategoriesQuery({});
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id!);
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        categoryId: product.categoryId || "",
        sku: product.sku || "",
        description: product.description || "",
        price: String(product.price || 0),
        cost: String(product.cost || 0),
        stock: String(product.stock || 0),
        minStock: String(product.minStock || 0),
        unit: product.unit || "pcs",
        barcode: product.barcode || "",
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
        id: id!,
        name: data.name,
        categoryId: data.categoryId,
        sku: data.sku,
        description: data.description,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost || "0"),
        stock: parseInt(data.stock),
        minStock: parseInt(data.minStock || "0"),
        unit: data.unit || "pcs",
        barcode: data.barcode,
      };

      const response = await updateProduct(productData);

      if (response.error) {
        toast.error("Error updating product", toastConfig.error);
      } else {
        toast.success("Product updated successfully", toastConfig.success);
        setTimeout(() => {
          navigate("/products");
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product", toastConfig.error);
    }
  };

  useEffect(() => {
    setPageTitle("Edit Product");
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading product...</div>;
  }

  if (isError || !product) {
    return <div className="text-center py-8 text-red-600">Product not found</div>;
  }

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div>
      <div className="form_container">
        <div className="form_header">
          <button
            type="button"
            className="back_btn"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="form_title">Edit Product</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              name="name"
              register={register}
              errors={errors}
              placeholder="Enter product name"
              required
            />

            <Input
              label="SKU"
              name="sku"
              register={register}
              errors={errors}
              placeholder="Enter SKU"
            />

            <Select
              label="Category"
              name="categoryId"
              register={register}
              errors={errors}
              options={categoryOptions}
              required
            />

            <Input
              label="Unit"
              name="unit"
              register={register}
              errors={errors}
              placeholder="e.g., pcs, kg, ltr"
            />

            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              placeholder="Enter selling price"
              required
            />

            <Input
              label="Cost"
              name="cost"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              placeholder="Enter cost price"
            />

            <Input
              label="Stock Quantity"
              name="stock"
              type="number"
              register={register}
              errors={errors}
              placeholder="Enter stock quantity"
              required
            />

            <Input
              label="Min Stock Level"
              name="minStock"
              type="number"
              register={register}
              errors={errors}
              placeholder="Minimum stock level"
            />

            <Input
              label="Barcode"
              name="barcode"
              register={register}
              errors={errors}
              placeholder="Enter barcode"
            />
          </div>

          <div className="mt-6">
            <Textarea
              label="Description"
              name="description"
              register={register}
              errors={errors}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="form_actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default EditProduct;

