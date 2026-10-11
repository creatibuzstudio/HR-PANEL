import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import MultiSelectDropdown from "@/components/ui/dropdown/multiSelectDropdown.jsx";
import { useGetRolesQuery } from "@/services/role/roleApiSlice.js";
import {
  useAddUserMutation,
  useUpdateUserMutation,
} from "@/services/user/userApiSlice.js";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";

// Validation schema
const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().optional(),
  password: yup.string().when("isEditing", {
    is: (v) => v === false,
    then: () => yup.string().required("Password is required"),
    otherwise: () => yup.string().optional(),
  }),
  type: yup.string().optional(),
  roleIds: yup
    .array()
    .of(yup.number().typeError("Role must be a number"))
    .min(1, "Select at least one role")
    .required("Roles are required"),
});

const UserForm = ({ user = null, onSuccess, onCancel }) => {
  const { data: roles } = useGetRolesQuery();

  const [addUser, { isLoading: addUserLoading }] = useAddUserMutation();

  const [updateUser, { isLoading: updateUserLoading }] =
    useUpdateUserMutation();

  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
  ];

  // Transform roles into options for the dropdown

  const rolesOptions =
    roles?.map((role) => ({
      value: role.id,
      label: role.name,
    })) || [];

  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      type: "",
      roleIds: [],
      status: 1,
      isEditing, // helper for conditional validation
    },
  });

  useEffect(() => {
    if (user) {
      const selectedRoles = rolesOptions?.filter((roleOpt) =>
        user.roles?.some((role) => role.id === roleOpt.value),
      );

      reset({
        name: user.nameEn || user.nameBn || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "", // clear password on edit
        type: user?.type || "",
        status: user?.status,
        roleIds: selectedRoles.map((r) => r.value), // pass only the IDs
        isEditing: true,
      });
    }
  }, [user, reset, roles]);

  const onSubmit = async (data) => {
    try {
      // Prepare payload, possibly omit password if empty in edit mode
      const payload = { ...data, type: "Admin" };
      delete payload.isEditing;
      delete payload.status;

      if (isEditing && !payload.password) {
        delete payload.password; // no password change
      }

      if (isEditing) {
        const result = await updateUser({ id: user.id, ...payload });

        if (result?.error) {
          toast.error(result?.error?.data?.message);
        } else {
          toast.success("User updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await addUser(payload);

        if (result?.error) {
          toast.error(result?.error?.data?.message);
        } else {
          toast.success("User created successfully");
          reset();
          onSuccess?.();
        }
      }

      // Call API here
      // if editing: await updateUserMutation({ id: user.id, ...payload })
      // toast.success(`User ${isEditing ? "updated" : "created"} successfully`);
      // reset();
      // onSuccess?.();
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error(err.message || "Failed to save user");
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
      <TextField
        register={register}
        label="Email"
        name={"email"}
        error={errors.email?.message}
        type="email"
        required
      />
      <TextField
        register={register}
        label="Phone"
        name={"phone"}
        error={errors.phone?.message}
        // required
      />
      <TextField
        register={register}
        label={
          isEditing ? "Password (leave blank to keep unchanged)" : "Password"
        }
        name={"password"}
        error={errors.password?.message}
        type="password"
        autoComplete={isEditing ? "off" : "new-password"}
        required={!isEditing}
      />
      {/*<TextField*/}
      {/*  register={register}*/}
      {/*  label="Type"*/}
      {/*  name={"type"}*/}
      {/*  error={errors.type?.message}*/}
      {/*/>*/}

      <div>
        <Controller
          control={control}
          name="roleIds"
          render={({ field, fieldState }) => (
            <MultiSelectDropdown
              options={rolesOptions}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              LabelName="Roles"
              placeholder="Select roles"
              required
            />
          )}
          rules={{ required: "Please select at least one role" }}
        />
      </div>

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
        <PrimaryButton
          type="button"
          variant="secondary"
          onClick={() => {
            reset();
            onCancel?.();
          }}
        >
          Cancel
        </PrimaryButton>
        <PrimaryButton
          isLoading={addUserLoading || updateUserLoading}
          type="submit"
        >
          {isEditing ? "Update User" : "Add User"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default UserForm;
