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
  useGetSupplierQuery,
  useUpdateSupplierMutation,
} from "../../state/suppliers/supplierSlice";
import { ToastContainer, toast } from "react-toastify";
import { toastConfig } from "../../configs/toast";

const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .min(2, { message: "Minimum 2 characters required" }),
  email: z.string().trim().email({ message: "Invalid email" }).optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  paymentTerms: z.string().trim().optional(),
  bankDetails: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  status: z.string().trim().min(1, { message: "Required" }),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

function EditSupplier() {
  const { id } = useParams<{ id: string }>();
  const [updateSupplier] = useUpdateSupplierMutation();
  const { data: supplier, isLoading, isError } = useGetSupplierQuery(id!);
  const navigate = useNavigate();

  const { setPageTitle } = useOutletContext<{
    setPageTitle: (title: string) => void;
  }>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });

  useEffect(() => {
    setPageTitle("Edit Supplier");
  }, [setPageTitle]);

  useEffect(() => {
    if (supplier) {
      const supplierData = (supplier as any).data || supplier;
      reset({
        name: supplierData.name || "",
        email: supplierData.email || "",
        phone: supplierData.phone || "",
        address: supplierData.address || "",
        city: supplierData.city || "",
        state: supplierData.state || "",
        zipCode: supplierData.zipCode || "",
        country: supplierData.country || "",
        taxId: supplierData.taxId || "",
        paymentTerms: supplierData.paymentTerms || "",
        bankDetails: supplierData.bankDetails || "",
        notes: supplierData.notes || "",
        status: supplierData.status || "active",
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      const response = await updateSupplier({ id, ...data });
      if (!response.error) {
        toast.success("Supplier updated successfully!", toastConfig.success);
        setTimeout(() => navigate("/suppliers"), 1500);
      } else {
        const errorMsg = (response.error as any)?.data?.message || "Failed to update supplier";
        toast.error(errorMsg, toastConfig.error);
      }
    } catch (error: any) {
      console.error("Failed to update supplier:", error);
      toast.error(
        error?.data?.message || "Failed to update supplier",
        toastConfig.error
      );
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading supplier...</div>;
  }

  if (isError || !supplier) {
    return <div className="text-center py-10 text-red-600">Supplier not found</div>;
  }

  return (
    <div className="max-w-4xl">
      <ToastContainer />
      <div className="mb-6">
        <button
          onClick={() => navigate("/suppliers")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Suppliers
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Supplier</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supplier Name"
                {...register("name")}
                error={errors.name?.message}
                required
                placeholder="Enter supplier name"
              />

              <Select
                label="Status"
                required
                error={errors.status?.message as string}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                placeholder="Select Status"
                {...register("status")}
              />

              <Input
                type="email"
                label="Email"
                {...register("email")}
                error={errors.email?.message}
                placeholder="supplier@example.com"
              />

              <Input
                label="Phone"
                {...register("phone")}
                error={errors.phone?.message}
                placeholder="+1234567890"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <Textarea
                label="Address"
                {...register("address")}
                error={errors.address?.message}
                rows={2}
                placeholder="Street address"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="City"
                  {...register("city")}
                  error={errors.city?.message}
                  placeholder="City"
                />

                <Input
                  label="State/Province"
                  {...register("state")}
                  error={errors.state?.message}
                  placeholder="State"
                />

                <Input
                  label="ZIP/Postal Code"
                  {...register("zipCode")}
                  error={errors.zipCode?.message}
                  placeholder="12345"
                />
              </div>

              <Input
                label="Country"
                {...register("country")}
                error={errors.country?.message}
                placeholder="Country"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Tax ID"
                {...register("taxId")}
                error={errors.taxId?.message}
                placeholder="Tax identification number"
              />

              <Input
                label="Payment Terms"
                {...register("paymentTerms")}
                error={errors.paymentTerms?.message}
                placeholder="e.g., Net 30, Net 60"
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Bank Details"
                  {...register("bankDetails")}
                  error={errors.bankDetails?.message}
                  rows={2}
                  placeholder="Bank name, account number, routing number, etc."
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="border-t pt-6">
            <Textarea
              label="Notes (Optional)"
              {...register("notes")}
              error={errors.notes?.message}
              rows={3}
              placeholder="Additional notes about this supplier"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/suppliers")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSupplier;

