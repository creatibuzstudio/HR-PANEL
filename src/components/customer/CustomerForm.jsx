import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@/services/customer/customerApiSlice.js";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().nullable().optional(),
  address: yup.string().nullable().optional(),
});

const CustomerForm = ({ customer = null, onSuccess, onCancel }) => {
  const [createCustomer, { isLoading: createLoading }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updateLoading }] = useUpdateCustomerMutation();

  const isEditing = !!customer;
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
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        const result = await updateCustomer({
          id: customer.id,
          data,
        });

        if (result?.error) {
          const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") || "Failed to update customer");
        } else {
          toast.success("Customer updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createCustomer(data);

        if (result?.error) {
          const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") || "Failed to create customer");
        } else {
          toast.success("Customer created successfully");
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
        <div className="-mt-1">
          <TextField
            label="Name *"
            type="text"
            placeholder="Enter full name"
            register={register}
            name="name"
            error={errors.name?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Email *"
            type="email"
            placeholder="Enter email address"
            register={register}
            name="email"
            error={errors.email?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Phone"
            type="text"
            placeholder="Enter phone number"
            register={register}
            name="phone"
            error={errors.phone?.message}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Address"
            type="text"
            placeholder="Enter address"
            register={register}
            name="address"
            error={errors.address?.message}
          />
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

export default CustomerForm;
