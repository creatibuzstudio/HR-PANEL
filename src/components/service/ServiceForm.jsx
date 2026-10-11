import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import toast from "react-hot-toast";
import {
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from "@/services/service/serviceApiSlice.js";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  slug: yup.string().required("Slug is required"),
  description: yup.string().nullable().optional(),
  creditCost: yup
    .number()
    .typeError("Credit Cost must be a number")
    .required("Credit Cost is required")
    .min(0, "Minimum is 0"),
  checkType: yup.string().required("Check type is required"),
  status: yup.number().optional(),
});

const ServiceForm = ({ serviceData = null, onSuccess, onCancel }) => {
  const [createService, { isLoading: createLoading }] =
    useCreateServiceMutation();
  const [updateService, { isLoading: updateLoading }] =
    useUpdateServiceMutation();

  const isEditing = !!serviceData;
  const isLoading = createLoading || updateLoading;

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
      slug: "",
      description: "",
      creditCost: "",
      checkType: "",
      status: 1,
    },
  });

  useEffect(() => {
    if (serviceData) {
      reset({
        name: serviceData.name || "",
        slug: serviceData.slug || "",
        description: serviceData.description || "",
        creditCost: serviceData.creditCost || "",
        checkType: serviceData.checkType || "",
        status: serviceData.status ?? 1,
      });
    }
  }, [serviceData, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        creditCost: Number(data.creditCost),
        checkType: data.checkType,
        ...(isEditing && { status: data.status }),
      };

      if (isEditing) {
        const result = await updateService({
          id: serviceData.id,
          data: payload,
        });

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to update service",
          );
        } else {
          toast.success("Service updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createService(payload);

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to create service",
          );
        } else {
          toast.success("Service created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const checkTypeOptions = [
    { value: "basic_information", label: "Basic Information" },
    { value: "barcode", label: "Barcode" },
    { value: "in_person", label: "In Person" },
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
            label="Service Name *"
            type="text"
            placeholder="Enter service name"
            register={register}
            name="name"
            error={errors.name?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Slug *"
            type="text"
            placeholder="Enter slug"
            register={register}
            name="slug"
            error={errors.slug?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Credit Cost *"
            type="number"
            placeholder="Enter credit cost"
            register={register}
            name="creditCost"
            error={errors.creditCost?.message}
          />
        </div>

        <div className="-mt-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Check Type *
          </label>
          <Controller
            name="checkType"
            control={control}
            render={({ field }) => (
              <Dropdown
                options={checkTypeOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Check Type"
              />
            )}
          />
          {errors.checkType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.checkType.message}
            </p>
          )}
        </div>
        
        <div className="md:col-span-2 -mt-1">
          <TextField
            label="Description"
            type="text"
            placeholder="Enter service description"
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

export default ServiceForm;
