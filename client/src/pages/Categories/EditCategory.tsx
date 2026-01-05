import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import FileInput from "../../elements/FileInput";
import {
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useGetCategoriesQuery,
} from "../../state/categories/categorySlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const baseSchema = z
  .object({
    category_name: z
      .string()
      .trim()
      .min(1, { message: "Required" })
      .min(2, { message: "Minimum 2 characters required" }),
    category_description: z
      .string()
      .trim()
      .min(1, { message: "Required" })
      .min(2, { message: "Minimum 2 characters required" }),
    parent_category: z.string().trim().optional(),
    category_image: z.preprocess((val) => {
      if (!val) return null;
      if (val instanceof FileList) {
        console.log("Instancs of FileList");
        const file = val.item(0);
        return file ?? null;
      }
      if (val instanceof File) {
        console.log("Instancs of File");
        return val;
      }
      return null;
    }, z.instanceof(File).optional().nullable()),
    optimizedImageUrl: z.string().optional(),
  })
  .superRefine((values: any, ctx: any): void => {
    if (!values.category_image && !values.optimizedImageUrl) {
      ctx.addIssue({
        path: ["category_image"],
        message: "Image is required",
        code: z.ZodIssueCode.custom,
      });
    }
  });

function EditCategory() {
  const { id } = useParams();

  const [updateCategory] = useUpdateCategoryMutation({});
  const { data: category } = useGetCategoryByIdQuery(id!);
  
  // Fetch existing categories for parent dropdown
  const { data: categoriesData } = useGetCategoriesQuery({});
  const categories = (categoriesData?.data || []).filter((cat: any) => cat.id !== id); // Exclude current category
  
  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      category_name: "",
      category_description: "",
      parent_category: "",
      category_image: null,
      optimizedImageUrl: "",
    },
    mode: "all",
    criteriaMode: "all",
    resolver: zodResolver(baseSchema),
  });

  // Watch form values to check if form is ready to submit
  const categoryName = watch("category_name");
  const categoryDescription = watch("category_description");
  const optimizedImageUrl = watch("optimizedImageUrl");
  const categoryImage = watch("category_image");
  
  // Check if form can be submitted
  const canSubmit = 
    categoryName && 
    categoryName.trim().length >= 2 && 
    categoryDescription && 
    categoryDescription.trim().length >= 2 && 
    (categoryImage || optimizedImageUrl);

  useEffect(() => {
    if (category) {
      const categoryData = category.data || category; // Handle both wrapped and unwrapped responses
      reset({
        category_name: categoryData.name || "",
        category_description: categoryData.description || "",
        parent_category: categoryData.parent_category || "",
        category_image: null,
        optimizedImageUrl: categoryData.optimizedImageUrl || "",
      }, {
        keepDefaultValues: false
      });

      // Trigger validation after reset to update isValid
      setTimeout(() => {
        trigger();
      }, 100);
    }
  }, [category, reset, trigger]);

  const navigate = useNavigate();

  const [isFormsubmitting, setIsFormsubmitting] = useState(false);

  useEffect(() => {
    setPageTitle("Edit Category");
  }, []);

  const onSubmit = async (data: any) => {
    setIsFormsubmitting(true);
    // Build payload, only include parent_category if it has a value
    const payload: any = {
      id: id as string,
      name: data.category_name,
      description: data.category_description,
      file: data.category_image,
      category_image: category?.category_image || null,
    };

    // Add parent_category only if selected
    if (data.parent_category && data.parent_category !== "") {
      payload.parent_category = data.parent_category;
    }

    const response = await updateCategory(payload);
    console.log("response", response);

    if (!response.error) {
      toast.success("Category updated successfully", toastConfig.success);
      return setTimeout(() => {
        setIsFormsubmitting(false);
        navigate("/categories");
      }, 1500);
    } else {
      setIsFormsubmitting(false);
      const errorMsg = (response.error as any)?.data?.message || "Something went wrong";
      return toast.error(errorMsg, toastConfig.error);
    }
  };

  return (
    <div>
      <div className="flex justify-end gap-2 action_container">
        <Button onClick={() => navigate("/categories")}>
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
          encType="multipart/form-data"
        >
          <div className="flex flex-col gap-2 space-y-4">
            <Input
              label="Category Name"
              required
              error={errors.category_name?.message as string}
              {...register("category_name")}
            />
            <Textarea
              label="Category Description"
              required
              labelClassName="text-gray-900"
              inputClassName="text-gray-900"
              rows={5}
              error={errors.category_description?.message as string}
              {...register("category_description")}
            />
            <Select
              label="Parent Category"
              error={errors.parent_category?.message as string}
              options={categories.map((cat: any) => ({
                value: cat.id,
                label: cat.name,
              }))}
              {...register("parent_category")}
            />

            <FileInput
              accept="image/*"
              label="Category Image"
              {...register("category_image")}
              imageUrl={optimizedImageUrl || category?.category_image_url || category?.secureUrl || category?.optimizedImageUrl || category?.imageUrl || ""}
              required
              error={errors.category_image?.message as string}
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
              onClick={() => navigate("/categories")}
            >
              Cancel
            </Button>
          </div>
          <ToastContainer />
        </form>
      </div>
    </div>
  );
}

export default EditCategory;
