import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import { Plus, X } from "lucide-react";
import {
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useGetPackageCategoriesQuery,
} from "@/services/package/packageApiSlice.js";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Package name is required"),
  description: yup.string().required("Description is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(0, "Price must be positive"),
  duration: yup.string().required("Duration is required"),
  isActive: yup.boolean().default(true),
  categoryId: yup.string().nullable().optional(),
});

const DURATION_OPTIONS = [
  { value: "Monthly", label: "Monthly" },
  { value: "3 Months", label: "3 Months" },
  { value: "6 Months", label: "6 Months" },
  { value: "Yearly", label: "Yearly" },
  { value: "Per Project", label: "Per Project" },
  { value: "One-Time", label: "One-Time" },
  { value: "Custom", label: "Custom" },
];

const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

const PackageForm = ({ packageData = null, onSuccess, onCancel }) => {
  const [createPackage, { isLoading: createLoading }] =
    useCreatePackageMutation();
  const [updatePackage, { isLoading: updateLoading }] =
    useUpdatePackageMutation();

  const { data: categories = [] } = useGetPackageCategoriesQuery();

  const [featuresList, setFeaturesList] = useState([]);
  const [featureInput, setFeatureInput] = useState("");

  const isEditing = !!packageData;
  const isLoading = createLoading || updateLoading;

  const categoryOptions = [
    { value: "", label: "None" },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

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
      duration: "Monthly",
      isActive: true,
      categoryId: "",
    },
  });

  useEffect(() => {
    if (packageData) {
      reset({
        name: packageData.name || "",
        description: packageData.description || "",
        price: packageData.price || "",
        duration: packageData.duration || "Monthly",
        isActive: packageData.isActive !== false,
        categoryId: packageData.category?.id || "",
      });

      // Populate features
      if (Array.isArray(packageData.features)) {
        setFeaturesList(packageData.features);
      } else if (typeof packageData.features === "string") {
        setFeaturesList(
          packageData.features.split(",").map((f) => f.trim()).filter(Boolean)
        );
      } else {
        setFeaturesList([]);
      }
    } else {
      setFeaturesList([]);
      setFeatureInput("");
    }
  }, [packageData, reset]);

  const handleAddFeature = (e) => {
    e?.preventDefault();
    const trimmed = featureInput.trim();
    if (trimmed) {
      if (!featuresList.includes(trimmed)) {
        setFeaturesList((prev) => [...prev, trimmed]);
      }
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    try {
      if (featuresList.length === 0) {
        toast.error("Please add at least one feature");
        return;
      }

      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        duration: data.duration,
        features: featuresList,
        isActive: data.isActive,
      };

      if (data.categoryId) {
        payload.category = { id: data.categoryId };
      }

      if (isEditing) {
        const result = await updatePackage({
          id: packageData.id,
          data: payload,
        });

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to update package"
          );
        } else {
          toast.success("Package updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createPackage(payload);

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to create package"
          );
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Package Name *"
          type="text"
          placeholder="e.g. Starter Brand Package"
          register={register}
          name="name"
          error={errors.name?.message}
          required
        />

        <TextField
          label="Price ($) *"
          type="number"
          step="0.01"
          placeholder="e.g. 299"
          register={register}
          name="price"
          error={errors.price?.message}
          required
        />

        <Controller
          name="duration"
          control={control}
          render={({ field, fieldState }) => (
            <Dropdown
              {...field}
              LabelName="Duration *"
              options={DURATION_OPTIONS}
              placeholder="Select Duration"
              error={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field, fieldState }) => (
            <Dropdown
              {...field}
              LabelName="Category (Optional)"
              options={categoryOptions}
              placeholder="Select Category"
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="md:col-span-2">
          <TextField
            label="Description *"
            type="text"
            placeholder="Brief description of the package"
            register={register}
            name="description"
            error={errors.description?.message}
            required
          />
        </div>

        {/* Dynamic Features List */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Package Features *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              placeholder="Add feature (e.g. 5 Revisions, Source Files Included)"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto">
            {featuresList.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {feat}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {featuresList.length === 0 && (
              <p className="text-xs text-gray-400 italic">No features added yet.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <Controller
            name="isActive"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Status"
                options={statusOptions}
                placeholder="Select status"
                error={fieldState.error?.message}
                required
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-800">
        <PrimaryButton type="button" onClick={onCancel} variant="secondary">
          Cancel
        </PrimaryButton>
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update Package" : "Create Package"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default PackageForm;
