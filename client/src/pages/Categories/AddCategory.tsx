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
  category_image: z.string().optional(),
  // Treat empty string / null as "no value" so the field can truly be optional
  // gender: z.preprocess(
  //   (val) => (val === "" || val === null ? undefined : val),
  //   z.string().optional()
  // ),
  gender: z.preprocess(
    (val) => (val === "" || val === null ? "" : val),
    z.string().min(1, { message: "Required" })
  ),
  // Checkbox is stored as boolean by react-hook-form
  terms: z.boolean().optional(),
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
      category_image: "",
      gender: "",
      terms: false,
    },
    mode: "onBlur",
    criteriaMode: "all",
    //resolver: zodResolver(baseSchema),
    resolver: async (data: any, context: any, options: any) => {
      return zodResolver(baseSchema)(data, context, options);
    },
  });

  const [isFormSubmit, setFormSubmit] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("Add Category");
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files?.[0]);
    setFile(e.target.files?.[0]);
  };

  const onSubmit = async (data: any) => {
    console.log("===========form submitted============");
    console.log(data);
    setFormSubmit(true);
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    // setFormSubmit(false);
    // try {
    //   const response = await addCategory({
    //     name: data.category_name,
    //     description: data.category_description,
    //     parent_category: data.parent_category,
    //     file: file as unknown as File,
    //   });
    //   console.log(response);
    //   navigate("/categories");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  //   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     console.log("Form submitted");
  //     navigate("/categories");
  //   };

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



        <FileInput
              accept="image/*"
              label="Category Image"
              onBlur={(e) => {
                const file = e.target.files?.[0];
                console.log(file);
                if (file) {
                  setValue("category_image", file?.name as unknown as string);
                  trigger();
                }
              }}
              onChange={(e) => {
                handleFileChange(e);
              }}
              error={errors.category_image?.message}
            />
             


            <Input
              label="Category Name"
              required
              error={errors.category_name?.message}
              {...register("category_name")}
            />
            <Textarea
              label="Category Description"
              required
              labelClassName="text-gray-900"
              inputClassName="text-gray-900"
              rows={5}
              error={errors.category_description?.message}
              {...register("category_description")}
            />
            <Select
              label="Parent Category"
              required
              error={errors.parent_category?.message}
              options={[
                { value: "1", label: "Category 1" },
                { value: "2", label: "Category 2" },
                { value: "3", label: "Category 3" },
              ]}
               {...register("parent_category")}
            />
           

            <RadioGroup
              label="Gender"
              {...register("gender")}
              defaultCheckedValue=""
              options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
              ]}
              error={errors.gender?.message}
              required
              />

              <Checkbox
                label="Terms and Conditions"
                {...register("terms")}
                defaultChecked={false}
                error={errors.terms?.message}
                required
              />
           

            {/* <RadioGroup 
            label="Gender"
            defaultCheckedValue=""
            name="gender"
            onChange={(val) => console.log(val)}
            options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
            ]}
            error="Gender is required"
            />
            <FileInput    accept="image/*" label="Category Image" required error="Category Image is required" onChange={handleFileChange}/>           
            <Input label="Category Name" required />
            <Select
              
              label="Parent Category"
              options={[
                { value: "1", label: "Option 1" },
                { value: "2", label: "Option 2" },
                { value: "3", label: "Option 3" },
              ]}
            />
            <Textarea label="Category Description" required rows={5} /> */}
          </div>
          <div className="flex justify-start gap-5 sm:max-w-[80%]">
            <Button type="submit" className="mt-4 min-w-[150px]">
              Submit
            </Button>
            <Button
              type="button"
              className="mt-4 min-w-[150px] bg-gray-500 text-white"
              onClick={() => navigate("/categories")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCategory;
