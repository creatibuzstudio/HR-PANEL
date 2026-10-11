import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/services/role/roleApiSlice.js";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
});

const RoleForm = ({ role = null, onSuccess, onCancel }) => {
  const [addRole, { isLoading: addRoleLoading }] = useCreateRoleMutation();

  const [updateRole, { isLoading: updateRoleLoading }] =
    useUpdateRoleMutation();

  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
  ];

  // Transform roles into options for the dropdown

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
      status: 1, // Default to active
      isEditing, // helper for conditional validation
    },
  });

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || "",
        status: role.status,
        isEditing: true,
      });
    }
  }, [role, reset]);

  const onSubmit = async (data) => {
    try {
      // Prepare payload, possibly omit password if empty in edit mode
      const payload = { ...data };
      delete payload.isEditing;
      if (!isEditing) {
        delete payload.status;
      }

      if (isEditing) {
        const result = await updateRole({ id: role.id, ...payload });

        if (result?.error) {
          toast.error(result?.error?.data?.message);
        } else {
          toast.success("Role updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await addRole(payload);

        if (result?.error) {
          toast.error(result?.error?.data?.message);
        } else {
          toast.success("Role created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (err) {
      console.error("Failed to save role:", err);
      toast.error(err.message || "Failed to save role");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <TextField
        register={register}
        label="Name"
        name={"name"}
        type="text"
        error={errors.name?.message}
        required
      />

      {isEditing && (
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
              required
            />
          )}
        />
      )}

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
          isLoading={addRoleLoading || updateRoleLoading}
          type="submit"
        >
          {isEditing ? "Update Role" : "Add Role"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default RoleForm;
