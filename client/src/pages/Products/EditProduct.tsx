import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
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
import { ToastContainer, toast } from "react-toastify";
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
  const { data: categoriesData } = useGetCategoriesQuery({});
  const { data: product, isLoading, isError } = useGetProductByIdQuery(id!);
  const navigate = useNavigate();
  const [isFormsubmitting, setIsFormsubmitting] = useState(false);

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: "all",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      categoryId: "",
      sku: "",
      description: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "",
      unit: "pcs",
      barcode: "",
    },
  });

  useEffect(() => {
    if (product) {
      const productData = product.data || product; // Handle both wrapped and unwrapped responses
      reset({
        name: productData.name || "",
        categoryId: productData.categoryId || productData.category?.id || "",
        sku: productData.sku || "",
        description: productData.description || "",
        price: productData.price ? String(productData.price) : "",
        cost: productData.cost ? String(productData.cost) : "",
        stock: productData.stock ? String(productData.stock) : "",
        minStock: productData.minStock ? String(productData.minStock) : "",
        unit: productData.unit || "pcs",
        barcode: productData.barcode || "",
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsFormsubmitting(true);
    
    try {
      const productData = {
        id: id!,
        name: data.name,
        categoryId: data.categoryId,
        sku: data.sku || "",
        description: data.description || "",
        price: parseFloat(data.price) || 0,
        cost: parseFloat(data.cost) || 0,
        stock: parseInt(data.stock) || 0,
        minStock: parseInt(data.minStock) || 0,
        unit: data.unit || "pcs",
        barcode: data.barcode || "",
      };

      console.log("Submitting product update:", productData);

      const response = await updateProduct(productData);
      console.log("Update response:", response);

      if (!response.error) {
        toast.success("Product updated successfully", toastConfig.success);
        setTimeout(() => {
          setIsFormsubmitting(false);
          navigate("/products");
        }, 1500);
      } else {
        setIsFormsubmitting(false);
        const errorMsg = (response.error as any)?.data?.message || (response.error as any)?.message || "Error updating product";
        console.error("Update error:", response.error);
        toast.error(errorMsg, toastConfig.error);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setIsFormsubmitting(false);
      toast.error("Error updating product", toastConfig.error);
    }
  };

  useEffect(() => {
    setPageTitle("Edit Product");
  }, [setPageTitle]);

  // Debug: Log product data
  useEffect(() => {
    if (product) {
      console.log("Product data loaded:", product);
    }
  }, [product]);

  if (isLoading) {
    return <div className="text-center py-8">Loading product...</div>;
  }

  if (isError || !product) {
    console.error("Product loading error:", isError, product);
    return <div className="text-center py-8 text-red-600">Product not found</div>;
  }

  // Extract categories array from API response
  const categories = categoriesData?.data || [];
  const categoryOptions = categories.map((cat: any) => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <div>
      <div className="flex justify-end gap-2 action_container">
        <Button onClick={() => navigate("/products")}>
          <ArrowLeft className="w-6 h-6" />
          Back
        </Button>
      </div>

      <div className="mt-6 p-5">
        <form
          action="#"
          method="POST"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-10"
        >
          <div className="flex flex-col gap-2 space-y-4">
            <Input
              label="Product Name"
              required
              error={errors.name?.message as string}
              {...register("name")}
            />
            
            <Input
              label="SKU"
              error={errors.sku?.message as string}
              {...register("sku")}
            />

            <Controller
              name="categoryId"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <Select
                  label="Category"
                  required
                  error={errors.categoryId?.message as string}
                  options={categoryOptions}
                  {...field}
                />
              )}
            />

            <Input
              label="Unit"
              error={errors.unit?.message as string}
              placeholder="e.g., pcs, kg, ltr"
              {...register("unit")}
            />

            <Input
              label="Price"
              type="number"
              step="0.01"
              required
              error={errors.price?.message as string}
              placeholder="Enter selling price"
              {...register("price")}
            />

            <Input
              label="Cost"
              type="number"
              step="0.01"
              error={errors.cost?.message as string}
              placeholder="Enter cost price"
              {...register("cost")}
            />

            <Input
              label="Stock Quantity"
              type="number"
              required
              error={errors.stock?.message as string}
              placeholder="Enter stock quantity"
              {...register("stock")}
            />

            <Input
              label="Min Stock Level"
              type="number"
              error={errors.minStock?.message as string}
              placeholder="Minimum stock level"
              {...register("minStock")}
            />

            <Input
              label="Barcode"
              error={errors.barcode?.message as string}
              placeholder="Enter barcode"
              {...register("barcode")}
            />

            <Textarea
              label="Description"
              labelClassName="text-gray-900"
              inputClassName="text-gray-900"
              rows={5}
              error={errors.description?.message as string}
              {...register("description")}
            />
          </div>
          
          <div className="flex justify-start gap-5 sm:max-w-[80%]">
            <Button
              type="submit"
              className="mt-4 min-w-[150px]"
              disabled={isFormsubmitting || isSubmitting || !isValid}
            >
              {isFormsubmitting || isSubmitting ? "Updating..." : "Update"}
            </Button>
            <Button
              type="button"
              className="mt-4 min-w-[150px] bg-gray-500 text-white"
              disabled={isFormsubmitting || isSubmitting}
              onClick={() => navigate("/products")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default EditProduct;
