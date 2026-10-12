import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import {
  useCreatePackageCategoryMutation,
  useUpdatePackageCategoryMutation,
} from "@/services/package/packageApiSlice.js";

const schema = yup.object({
  name: yup.string().required("Category name is required"),
  description: yup.string().required("Description is required"),
});

const PackageCategoryForm = ({ categoryData = null, onSuccess, onCancel }) => {
  const [createCategory, { isLoading: createLoading }] =
    useCreatePackageCategoryMutation();
  const [updateCategory, { isLoading: updateLoading }] =
    useUpdatePackageCategoryMutation();

  const isEditing = !!categoryData;
  const isLoading = createLoading || updateLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (categoryData) {
      reset({
        name: categoryData.name || "",
        description: categoryData.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [categoryData, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        const result = await updateCategory({
          id: categoryData.id,
          data: {
            name: data.name,
            description: data.description,
          },
        });

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to update package category"
          );
        } else {
          toast.success("Package category updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createCategory({
          name: data.name,
          description: data.description,
        });

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to create package category"
          );
        } else {
          toast.success("Package category created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        label="Category Name *"
        type="text"
        placeholder="e.g. Web Development, Branding"
        register={register}
        name="name"
        error={errors.name?.message}
        required
      />

      <TextField
        label="Description *"
        type="text"
        placeholder="Brief description of this category"
        register={register}
        name="description"
        error={errors.description?.message}
        required
      />

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-800">
        <PrimaryButton type="button" onClick={onCancel} variant="secondary">
          Cancel
        </PrimaryButton>
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Update Category"
            : "Create Category"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default PackageCategoryForm;
