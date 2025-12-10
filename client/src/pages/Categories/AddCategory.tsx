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
import { useAddCategoryMutation } from "../../state/categories/categorySlice";
import Checkbox from "../../elements/Checkbox";
import { Bounce, ToastContainer, toast } from 'react-toastify';

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
  parent_category: z.string().trim(),
  category_image: z.preprocess(
    (val) => {
      console.log("category_image", val);
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
    },
    z
      .instanceof(File)
      .nullable()
      .refine((file) => file !== null, { message: "Required" })
  ),
  //category_image: z.instanceof(File).optional().nullable(), //required for edit
  // Treat empty string / null as "no value" so the field can truly be optional
  // gender: z.preprocess(
  //   (val) => (val === "" || val === null ? undefined : val),
  //   z.string().optional()
  // ),
  // gender: z.preprocess(
  //   (val) => (val === "" || val === null ? "" : val),
  //   z.string().min(1, { message: "Required" })
  // ),
  // terms: z.boolean().optional(),
});

function AddCategory() {

  const [
    addCategory,
    isAddCategoryLoading,
    isAddCategoryError,
    addCategoryError,
  ] = useAddCategoryMutation({});

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
      parent_category: "",
      category_image: null,
      gender: "",
      terms: false,
    },
    mode: "all",
    criteriaMode: "all",
    resolver: async (data: any, context: any, options: any) => {
      return zodResolver(baseSchema)(data, context, options);
    },
  });

  console.log("isSubmitting: ", isSubmitting);


  const navigate = useNavigate();

  const [isFormsubmitting, setIsFormsubmitting] = useState(false);


  useEffect(() => {
       
    setPageTitle("Add Category");
  }, []);

  const onSubmit = async (data: any) => {
    console.log("isSubmitting>>>>BEFORE SUBMIT", isSubmitting);

    setIsFormsubmitting(true);
    console.log("===========form submitted============");

    
    const response = await addCategory({
      name: data.category_name,
      description: data.category_description,
      parent_category: data.parent_category,
      file: data.category_image,
    });
    console.log("response", response);

   
    if(!response.error){
      toast.success('Category added successfully', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
     return setTimeout(() => {
         setIsFormsubmitting(false);
        navigate("/categories");
      }, 1500);
    }else{
      setIsFormsubmitting(false);
      return toast.error('Something went wrong', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
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
              options={[
                { value: "1", label: "Category 1" },
                { value: "2", label: "Category 2" },
                { value: "3", label: "Category 3" },
              ]}
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
            <Button type="submit" className="mt-4 min-w-[150px]" disabled={isFormsubmitting || isSubmitting || !isValid}>
              {isFormsubmitting || isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button
              type="button"
              className="mt-4 min-w-[150px] bg-gray-500 text-white"
              disabled={isFormsubmitting || isSubmitting  }
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
