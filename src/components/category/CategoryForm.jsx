import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import toast from "react-hot-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUploadCategoryImageMutation,
} from "@/services/category/categoryApiSlice.js";

const schema = yup.object({
  name: yup.string().required("Category name is required"),
  order: yup.number().typeError("Order must be a number").default(0),
  isActive: yup.boolean().default(true),
});

const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

const CategoryForm = ({ categoryData = null, onSuccess, onCancel }) => {
  const [createCategory, { isLoading: createLoading }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: updateLoading }] =
    useUpdateCategoryMutation();
  const [uploadImage, { isLoading: uploadLoading }] =
    useUploadCategoryImageMutation();

  const [iconUrl, setIconUrl] = useState("");

  const isEditing = !!categoryData;
  const isLoading = createLoading || updateLoading || uploadLoading;

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
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (categoryData) {
      reset({
        name: categoryData.name || "",
        order: categoryData.order ?? 0,
        isActive: categoryData.isActive !== false,
      });
      setIconUrl(categoryData.icon || "");
    } else {
      reset({
        name: "",
        order: 0,
        isActive: true,
      });
      setIconUrl("");
    }
  }, [categoryData, reset]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadImage(formData).unwrap();
      if (res?.url) {
        setIconUrl(res.url);
        toast.success("Icon uploaded successfully");
      } else {
        toast.error("Failed to upload icon");
      }
    } catch (err) {
      toast.error(err?.data?.message || "Failed to upload image");
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        icon: iconUrl || undefined,
        order: Number(data.order) || 0,
        isActive: data.isActive,
      };

      if (isEditing) {
        const result = await updateCategory({
          id: categoryData.id,
          data: payload,
        });

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to update category"
          );
        } else {
          toast.success("Category updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createCategory(payload);

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to create category"
          );
        } else {
          toast.success("Category created successfully");
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
        placeholder="e.g. Design, Web App, Marketing"
        register={register}
        name="name"
        error={errors.name?.message}
        required
      />

      <TextField
        label="Display Order"
        type="number"
        placeholder="e.g. 1"
        register={register}
        name="order"
        error={errors.order?.message}
      />

      {/* Icon / Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category Icon (Optional)
        </label>
        <div className="flex items-center gap-4">
          {iconUrl ? (
            <div className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <img
                src={iconUrl}
                alt="Icon"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setIconUrl("")}
                className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white hover:bg-black"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-28 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-primary transition bg-gray-50/50 dark:bg-gray-800/50">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadLoading}
                className="hidden"
              />
            </label>
          )}

          <div className="flex-1">
            <input
              type="text"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="Or paste icon image URL"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <Controller
        name="isActive"
        control={control}
        render={({ field, fieldState }) => (
          <Dropdown
            {...field}
            LabelName="Status"
            options={statusOptions}
            placeholder="Select Status"
            error={fieldState.error?.message}
            required
          />
        )}
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

export default CategoryForm;
