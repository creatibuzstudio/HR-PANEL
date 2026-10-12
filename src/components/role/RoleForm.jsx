import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import {
  useAddDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/services/department/departmentApiSlice.js";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Department name is required"),
  description: yup.string().optional(),
});

const RoleForm = ({ role = null, onSuccess, onCancel }) => {
  const [addDepartment, { isLoading: addLoading }] = useAddDepartmentMutation();
  const [updateDepartment, { isLoading: updateLoading }] =
    useUpdateDepartmentMutation();

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  const isEditing = !!role;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || "",
        description: role.description || "",
        isActive: role.isActive !== undefined ? role.isActive : true,
      });
    }
  }, [role, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        isActive: data.isActive,
      };

      if (isEditing) {
        const result = await updateDepartment({ id: role.id, ...payload });

        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to update department");
        } else {
          toast.success("Department updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await addDepartment(payload);

        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to create department");
        } else {
          toast.success("Department created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (err) {
      console.error("Failed to save department:", err);
      toast.error(err.message || "Failed to save department");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        register={register}
        label="Department Name"
        name="name"
        type="text"
        error={errors.name?.message}
        placeholder="e.g. Information Technology"
        required
      />

      <TextField
        register={register}
        label="Description"
        name="description"
        type="text"
        error={errors.description?.message}
        placeholder="e.g. Software development and IT operations"
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
          {isEditing ? "Update Department" : "Add Department"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default RoleForm;
