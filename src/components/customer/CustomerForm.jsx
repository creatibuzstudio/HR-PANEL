import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import {
  useAddUserMutation,
  useUpdateUserMutation,
} from "@/services/user/userApiSlice.js";

const schema = yup.object({
  name: yup.string().required("Customer name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().nullable().optional(),
  location: yup.string().nullable().optional(),
  password: yup.string().when("isEditing", {
    is: (v) => v === false,
    then: () => yup.string().optional(),
    otherwise: () => yup.string().optional(),
  }),
});

const CustomerForm = ({ customer = null, onSuccess, onCancel }) => {
  const [addUser, { isLoading: addLoading }] = useAddUserMutation();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  const isEditing = !!customer;
  const isLoading = addLoading || updateLoading;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      password: "",
      isEditing,
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        location: customer.location || customer.address || "",
        password: "",
        isEditing: true,
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        location: data.location || undefined,
        role: "client",
      };

      if (!isEditing) {
        payload.password = data.password || "Client123@";
        const result = await addUser(payload);
        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to create customer");
        } else {
          toast.success("Customer created successfully");
          reset();
          onSuccess?.();
        }
      } else {
        if (data.password) {
          payload.password = data.password;
        }
        const result = await updateUser({ id: customer.id, ...payload });
        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to update customer");
        } else {
          toast.success("Customer updated successfully");
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
          label="Name *"
          type="text"
          placeholder="Enter full name"
          register={register}
          name="name"
          error={errors.name?.message}
          required
        />

        <TextField
          label="Email *"
          type="email"
          placeholder="Enter email address"
          register={register}
          name="email"
          error={errors.email?.message}
          required
        />

        <TextField
          label="Phone"
          type="text"
          placeholder="Enter phone number"
          register={register}
          name="phone"
          error={errors.phone?.message}
        />

        <TextField
          label="Location / Address"
          type="text"
          placeholder="e.g. Dhaka, Bangladesh"
          register={register}
          name="location"
          error={errors.location?.message}
        />

        <div className="md:col-span-2">
          <TextField
            label={isEditing ? "Password (leave blank to keep unchanged)" : "Password (optional, default: Client123@)"}
            type="password"
            placeholder={isEditing ? "Leave blank to keep unchanged" : "Client123@"}
            register={register}
            name="password"
            error={errors.password?.message}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-800">
        <PrimaryButton type="button" onClick={onCancel} variant="secondary">
          Cancel
        </PrimaryButton>
        <PrimaryButton type="submit" disabled={isLoading} className="px-4 py-2">
          {isLoading ? "Saving..." : isEditing ? "Update Customer" : "Create Customer"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default CustomerForm;
