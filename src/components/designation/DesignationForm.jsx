import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import {
  useAddDesignationMutation,
  useUpdateDesignationMutation,
} from "@/services/designation/designationApiSlice.js";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";

const schema = yup.object({
  title: yup.string().required("Designation title is required"),
  level: yup.string().optional(),
  description: yup.string().optional(),
});

const LEVEL_OPTIONS = [
  { value: "Intern", label: "Intern" },
  { value: "Junior", label: "Junior" },
  { value: "Mid", label: "Mid" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
  { value: "Manager", label: "Manager" },
  { value: "Director", label: "Director" },
  { value: "Executive", label: "Executive" },
];

const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

const DesignationForm = ({ designation = null, onSuccess, onCancel }) => {
  const [addDesignation, { isLoading: addLoading }] =
    useAddDesignationMutation();
  const [updateDesignation, { isLoading: updateLoading }] =
    useUpdateDesignationMutation();

  const isEditing = !!designation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      level: "Mid",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (designation) {
      reset({
        title: designation.title || "",
        level: designation.level || "Mid",
        description: designation.description || "",
        isActive: designation.isActive !== undefined ? designation.isActive : true,
      });
    }
  }, [designation, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        title: data.title,
        level: data.level || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
      };

      if (isEditing) {
        const result = await updateDesignation({
          id: designation.id,
          ...payload,
        });

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to update designation"
          );
        } else {
          toast.success("Designation updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await addDesignation(payload);

        if (result?.error) {
          toast.error(
            result?.error?.data?.message || "Failed to create designation"
          );
        } else {
          toast.success("Designation created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (err) {
      console.error("Failed to save designation:", err);
      toast.error(err.message || "Failed to save designation");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        register={register}
        label="Designation Title"
        name="title"
        type="text"
        error={errors.title?.message}
        placeholder="e.g. Senior Software Engineer"
        required
      />

      <Controller
        name="level"
        control={control}
        render={({ field, fieldState }) => (
          <Dropdown
            {...field}
            LabelName="Level"
            options={LEVEL_OPTIONS}
            placeholder="Select Level"
            error={fieldState.error?.message}
          />
        )}
      />

      <TextField
        register={register}
        label="Description"
        name="description"
        type="text"
        error={errors.description?.message}
        placeholder="e.g. Leads technical projects and software architecture"
      />

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

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            reset();
            onCancel?.();
          }}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <PrimaryButton
          isLoading={addLoading || updateLoading}
          type="submit"
        >
          {isEditing ? "Update Designation" : "Add Designation"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default DesignationForm;
