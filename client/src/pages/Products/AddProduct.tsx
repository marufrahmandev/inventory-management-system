import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import FileInput from "../../elements/FileInput";
import GalleryInput from "../../elements/GalleryInput";
import { useAddProductMutation } from "../../state/products/productSlice";
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
  product_image: z.preprocess((val) => {
    if (!val) return null;
    if (val instanceof FileList) {
      const file = val.item(0);
      return file ?? null;
    }
    return val;
  }, z.instanceof(File).nullable().refine((file) => file !== null, { message: "Product image is required" })),
  product_gallery: z.preprocess((val) => {
    if (!val) return null;
    if (val instanceof FileList) {
      return Array.from(val);
    }
    return val;
  }, z.array(z.instanceof(File)).optional().nullable()),
});

type ProductFormData = z.infer<typeof productSchema>;

function AddProduct() {
  const [addProduct] = useAddProductMutation();
  const { data: categoriesData } = useGetCategoriesQuery({});
  const navigate = useNavigate();
  const [isFormsubmitting, setIsFormsubmitting] = useState(false);

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProductFormData>({
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
      product_image: null,
      product_gallery: null,
    },
    resolver: zodResolver(productSchema),
    mode: "all",
    criteriaMode: "all",
  });

  // Watch form values to check if form is ready to submit
  const productImage = watch("product_image");
  const productGallery = watch("product_gallery");
  
  // Check if form can be submitted
  const canSubmit = 
    isValid && 
    productImage !== null;

  const onSubmit = async (data: ProductFormData) => {
    setIsFormsubmitting(true);
    
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("categoryId", data.categoryId);
      formData.append("sku", data.sku || "");
      formData.append("description", data.description || "");
      formData.append("price", String(parseFloat(data.price) || 0));
      formData.append("cost", String(parseFloat(data.cost) || 0));
      formData.append("stock", String(parseInt(data.stock) || 0));
      formData.append("minStock", String(parseInt(data.minStock) || 0));
      formData.append("unit", data.unit || "pcs");
      formData.append("barcode", data.barcode || "");

      // Append main product image (required)
      if (data.product_image) {
        formData.append("product_image", data.product_image);
      }

      // Append gallery images (optional)
      if (data.product_gallery && Array.isArray(data.product_gallery)) {
        data.product_gallery.forEach((file) => {
          formData.append("product_gallery", file);
        });
      }

      const response = await addProduct(formData);

      if (!response.error) {
        toast.success("Product added successfully", toastConfig.success);
        setTimeout(() => {
          setIsFormsubmitting(false);
          navigate("/products");
        }, 1500);
      } else {
        setIsFormsubmitting(false);
        const errorMsg = (response.error as any)?.data?.message || "Error adding product";
        toast.error(errorMsg, toastConfig.error);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setIsFormsubmitting(false);
      toast.error("Error adding product", toastConfig.error);
    }
  };

  useEffect(() => {
    setPageTitle("Add Product");
  }, [setPageTitle]);

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

            <Select
              label="Category"
              required
              error={errors.categoryId?.message as string}
              options={categoryOptions}
              {...register("categoryId")}
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

            <FileInput
              accept="image/*"
              label="Product Image"
              required
              error={errors.product_image?.message as string}
              {...register("product_image")}
            />

            <Controller
              name="product_gallery"
              control={control}
              render={({ field }) => (
                <GalleryInput
                  accept="image/*"
                  label="Product Gallery"
                  error={errors.product_gallery?.message as string}
                  {...field}
                />
              )}
            />
          </div>
          
          <div className="flex justify-start gap-5 sm:max-w-[80%]">
            <Button
              type="submit"
              className="mt-4 min-w-[150px]"
              disabled={isFormsubmitting || isSubmitting || !canSubmit}
            >
              {isFormsubmitting || isSubmitting ? "Submitting..." : "Submit"}
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

export default AddProduct;
