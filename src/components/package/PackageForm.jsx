import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import Checkbox from "@/components/ui/input/Checkbox.jsx";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import MultiSelectDropdown from "@/components/ui/dropdown/multiSelectDropdown.jsx";
import {
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useGetAllPackagesQuery,
} from "@/services/package/packageApiSlice.js";
import { useGetAllServicesQuery } from "@/services/service/serviceApiSlice.js";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string().nullable().optional(),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required"),
  includedCredits: yup
    .number()
    .typeError("Included Credits must be a number")
    .required("Included Credits is required")
    .min(0, "Minimum is 0"),
  validityDays: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
    .nullable()
    .min(1, "Minimum is 1"),
  isPublic: yup.boolean().default(true),
  parentId: yup.number().nullable().optional(),
  serviceIds: yup
    .array()
    .of(yup.number())
    .optional(),
  status: yup.number().optional(),
});

const PackageForm = ({ packageData = null, onSuccess, onCancel }) => {
  const [createPackage, { isLoading: createLoading }] =
    useCreatePackageMutation();
  const [updatePackage, { isLoading: updateLoading }] =
    useUpdatePackageMutation();

  const { data: packagesData } = useGetAllPackagesQuery();
  const { data: servicesData } = useGetAllServicesQuery();

  const isEditing = !!packageData;
  const isLoading = createLoading || updateLoading;

  const packageOptions = packagesData?.filter(p => p.id !== packageData?.id)?.map(p => ({
    value: p.id,
    label: p.name,
  })) || [];

  const serviceOptions = servicesData?.map(s => ({
    value: s.id,
    label: s.name,
  })) || [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      includedCredits: "",
      validityDays: "",
      isPublic: true,
      parentId: null,
      serviceIds: [],
      status: 1,
    },
  });

  useEffect(() => {
    if (packageData) {
      reset({
        name: packageData.name || "",
        description: packageData.description || "",
        price: packageData.price || "",
        includedCredits: packageData.includedCredits || "",
        validityDays: packageData.validityDays || "",
        isPublic: packageData.isPublic ?? true,
        parentId: packageData.parentId || null,
        serviceIds: packageData.services?.map(s => s.id) || [],
        status: packageData.status ?? 1,
      });
    }
  }, [packageData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        price: Number(data.price),
        includedCredits: Number(data.includedCredits),
        validityDays: data.validityDays ? Number(data.validityDays) : undefined,
        isPublic: data.isPublic,
        parentId: data.parentId || null,
        serviceIds: data.serviceIds,
        ...(isEditing && { status: data.status }),
      };

      if (isEditing) {
        const result = await updatePackage({
          id: packageData.id,
          data: payload,
        });

        if (result?.error) {
          const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") || "Failed to update package");
        } else {
          toast.success("Package updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createPackage(payload);

        if (result?.error) {
          const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") || "Failed to create package");
        } else {
          toast.success("Package created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const booleanOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="-mt-1">
          <TextField
            label="Package Name *"
            type="text"
            placeholder="Enter package name"
            register={register}
            name="name"
            error={errors.name?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Price *"
            type="number"
            step="0.01"
            placeholder="Enter price"
            register={register}
            name="price"
            error={errors.price?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Included Credits *"
            type="number"
            placeholder="Enter included credits"
            register={register}
            name="includedCredits"
            error={errors.includedCredits?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Validity Days"
            type="number"
            placeholder="Enter validity days (optional)"
            register={register}
            name="validityDays"
            error={errors.validityDays?.message}
          />
        </div>

        <div className="md:col-span-2 -mt-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Section (Optional)
          </label>
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={[{ value: null, label: "None" }, ...packageOptions]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Section"
              />
            )}
          />
          {errors.parentId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.parentId.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2 -mt-1">
          <Controller
            control={control}
            name="serviceIds"
            render={({ field, fieldState }) => (
              <MultiSelectDropdown
                options={serviceOptions}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                LabelName="Services Included"
                placeholder="Select services"
              />
            )}
          />
        </div>
        
        <div className="md:col-span-2 -mt-1">
          <TextField
            label="Description"
            type="text"
            placeholder="Enter package description"
            register={register}
            name="description"
            error={errors.description?.message}
          />
        </div>

        {isEditing && (
          <div className="md:col-span-2 -mt-1">
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Dropdown
                  {...field}
                  LabelName="Status"
                  options={statusOptions}
                  placeholder="Select status"
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        )}
        
        <div className="md:col-span-2 flex items-center pt-2">
          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <Checkbox
                name="isPublic"
                value={field.value}
                setValue={field.onChange}
              >
                Is Public?
              </Checkbox>
            )}
          />
          {errors.isPublic && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 ml-3">
              {errors.isPublic.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <PrimaryButton type="button" onClick={onCancel} variant="secondary">
          Cancel
        </PrimaryButton>
        <PrimaryButton type="submit" disabled={isLoading} className="px-4 py-2">
          {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default PackageForm;
