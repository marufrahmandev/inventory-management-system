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
import { useAddProductMutation } from "../../state/products/productSlice";
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

function AddProduct() {
  const [addProduct] = useAddProductMutation();
  const { data: categories = [] } = useGetCategoriesQuery({});
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      categoryId: "",
      sku: "",
      description: "",
      price: "0",
      cost: "0",
      stock: "0",
      minStock: "0",
      unit: "pcs",
      barcode: "",
    },
    resolver: zodResolver(productSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      const productData = {
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

      const response = await addProduct(productData);

      if (response.error) {
        toast.error("Error adding product", toastConfig.error);
      } else {
        toast.success("Product added successfully", toastConfig.success);
        setTimeout(() => {
          navigate("/products");
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product", toastConfig.error);
    }
  };

  useEffect(() => {
    setPageTitle("Add Product");
  }, []);

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
          <h2 className="form_title">Add New Product</h2>
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
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AddProduct;

