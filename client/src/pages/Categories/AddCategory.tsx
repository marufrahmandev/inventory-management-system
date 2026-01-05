import { ArrowLeft } from "lucide-react";
import React, { useEffect, useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router";
import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import Select from "../../elements/Select";
import FileInput from "../../elements/FileInput";
import RadioGroup from "../../elements/RadioGroup";
import { useAddCategoryMutation, useGetCategoriesQuery } from "../../state/categories/categorySlice";
import Checkbox from "../../elements/Checkbox";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const baseSchema = z.object({
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
  parent_category: z.string().trim().optional(), // Make optional
  category_image: z.preprocess((val) => {
    if (!val) return null;
    if (val instanceof FileList) {
     
      const file = val.item(0);
      return file ?? null;
    }
    return val;
  }, z.instanceof(File).nullable().refine((file) => file !== null, { message: "Required" })),
});

function AddCategory() {
  const [
    addCategory,
    isAddCategoryLoading,
    isAddCategoryError,
    addCategoryError,
  ] = useAddCategoryMutation({});

  // Fetch existing categories for parent dropdown
  const { data: categoriesData } = useGetCategoriesQuery({});
  const categories = categoriesData?.data || [];

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getFieldState,
    watch,
    control,
    formState: {
      errors,
      isDirty,
      dirtyFields,
      isValid,
      isValidating,
      isLoading,
      isSubmitted,
      isSubmitting,
      validatingFields,
    },
  } = useForm({
    defaultValues: {
      category_name: "",
      category_description: "",
      parent_category: ""
    },
    mode: "all",
    criteriaMode: "all",
    resolver: async (data: any, context: any, options: any) => {
      return zodResolver(baseSchema)(data, context, options);
    },
  });

  const navigate = useNavigate();

  const [isFormsubmitting, setIsFormsubmitting] = useState(false);

  useEffect(() => {
    setPageTitle("Add Category");
  }, []);

  const onSubmit = async (data: any) => {
    console.log("data", data); 
    setIsFormsubmitting(true);
    
    // Only send parent_category if it has a value
    const payload: any = {
      name: data.category_name,
      description: data.category_description,
      file: data.category_image,
    };
    
    // Add parent_category only if selected
    if (data.parent_category && data.parent_category !== "") {
      payload.parent_category = data.parent_category;
    }
    
    const response = await addCategory(payload);
    console.log("response", response);

    if (!response.error) {
      toast.success("Category added successfully", toastConfig.success);
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
              required
              error={errors.category_image?.message as string}
            />

             
          </div>
          <div className="flex justify-start gap-5 sm:max-w-[80%]">
            <Button
              type="submit"
              className="mt-4 min-w-[150px]"
              disabled={isFormsubmitting || isSubmitting || !isValid}
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

export default AddCategory;
