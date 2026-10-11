import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "@/services/invoice/invoiceApiSlice.js";
import { useSearchCustomersQuery } from "@/services/customer/customerApiSlice.js";

const schema = yup.object({
  customerId: yup.string().required("Customer is required"),
  amount: yup.number().typeError("Amount must be a number").required("Amount is required").min(0),
  status: yup.string().required("Status is required"),
  type: yup.string().required("Type is required"),
  dueDate: yup.string().nullable().optional(),
});

const InvoiceForm = ({ invoice = null, onSuccess, onCancel }) => {
  const [createInvoice, { isLoading: createLoading }] = useCreateInvoiceMutation();
  const [updateInvoice, { isLoading: updateLoading }] = useUpdateInvoiceMutation();

  const { data: customersData } = useSearchCustomersQuery({ limit: 100, page: 1 });
  const customers = customersData?.items || [];

  const isEditing = !!invoice;
  const isLoading = createLoading || updateLoading;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerId: "",
      amount: "",
      status: "pending",
      type: "one_time",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (invoice) {
      reset({
        customerId: invoice.customer_id?.toString() || invoice.customerId?.toString() || "",
        amount: invoice.amount || invoice.total || "",
        status: invoice.status || "pending",
        type: invoice.type || "one_time",
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
      });
    }
  }, [invoice, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        customer_id: parseInt(data.customerId, 10),
        amount: Number(data.amount),
        status: data.status,
        type: data.type,
        dueDate: data.dueDate || undefined,
      };

      if (isEditing) {
        const result = await updateInvoice({
          id: invoice.id,
          data: payload,
        });

        if (result?.error) {
          const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") || "Failed to update invoice");
        } else {
          toast.success("Invoice updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await createInvoice(payload);

        if (result?.error) {
          const errMsg = result?.error?.data?.message; toast.error(typeof errMsg === "string" ? errMsg : (Array.isArray(errMsg) ? (typeof errMsg[0] === "string" ? errMsg[0] : "Validation Error") : "An error occurred") || "Failed to create invoice");
        } else {
          toast.success("Invoice created successfully");
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
        
        <div className="-mt-1 flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Customer *</label>
          <Controller
            name="customerId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name || c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.customerId && <span className="text-red-500 text-xs">{errors.customerId.message}</span>}
        </div>

        <div className="-mt-1">
          <TextField
            label="Amount *"
            type="number"
            step="0.01"
            placeholder="Enter invoice amount"
            register={register}
            name="amount"
            error={errors.amount?.message}
          />
        </div>

        <div className="-mt-1 flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Status *</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="-mt-1 flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">Type *</label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One Time</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="-mt-1">
          <TextField
            label="Due Date"
            type="date"
            register={register}
            name="dueDate"
            error={errors.dueDate?.message}
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

export default InvoiceForm;
