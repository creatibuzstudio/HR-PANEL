import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import toast from "react-hot-toast";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
} from "@/services/package-booking/packageBookingApiSlice.js";
import { useGetAllPackagesQuery } from "@/services/package/packageApiSlice.js";
import { User, Mail, Building, Briefcase, Calendar, CheckCircle2 } from "lucide-react";

// Validation schema
const schema = yup.object({
  name: yup.string().trim().required("Client name is required"),
  userEmail: yup
    .string()
    .trim()
    .email("Must be a valid email address")
    .required("Client email is required"),
  companyName: yup.string().trim().required("Company name is required"),
  companyEmail: yup
    .string()
    .trim()
    .email("Must be a valid email address")
    .required("Company email is required"),
  packageId: yup.string().required("Please select a package"),
  billingCycle: yup.string().required("Please select a billing cycle"),
  status: yup.string().default("PENDING"),
});

export const BILLING_CYCLES = [
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly (3 Months)" },
  { value: "Semi-Annually", label: "Semi-Annually (6 Months)" },
  { value: "Yearly", label: "Yearly" },
  { value: "One-Time", label: "One-Time / Project Based" },
  { value: "Custom", label: "Custom Agreement" },
];

export const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending Review" },
  { value: "CONFIRMED", label: "Confirmed / Active" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PackageBookingForm = ({ bookingData = null, onSuccess, onCancel }) => {
  const [createBooking, { isLoading: createLoading }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: updateLoading }] = useUpdateBookingMutation();
  const { data: packages = [], isLoading: packagesLoading } = useGetAllPackagesQuery();

  const isEditing = !!bookingData;
  const isLoading = createLoading || updateLoading;

  const packageOptions = packages.map((pkg) => ({
    value: pkg.id,
    label: `${pkg.name} - $${pkg.price || 0} (${pkg.duration || "Standard"})`,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      userEmail: "",
      companyName: "",
      companyEmail: "",
      packageId: "",
      billingCycle: "Monthly",
      status: "PENDING",
    },
  });

  const selectedPackageId = watch("packageId");
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  useEffect(() => {
    if (bookingData) {
      reset({
        name: bookingData.name || "",
        userEmail: bookingData.userEmail || "",
        companyName: bookingData.companyName || "",
        companyEmail: bookingData.companyEmail || "",
        packageId: bookingData.packageId || bookingData.package?.id || "",
        billingCycle: bookingData.billingCycle || "Monthly",
        status: bookingData.status || "PENDING",
      });
    } else {
      reset({
        name: "",
        userEmail: "",
        companyName: "",
        companyEmail: "",
        packageId: packages[0]?.id || "",
        billingCycle: "Monthly",
        status: "PENDING",
      });
    }
  }, [bookingData, packages, reset]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name.trim(),
        userEmail: formData.userEmail.trim(),
        companyName: formData.companyName.trim(),
        companyEmail: formData.companyEmail.trim(),
        packageId: formData.packageId,
        billingCycle: formData.billingCycle,
        status: formData.status,
      };

      if (isEditing) {
        const res = await updateBooking({
          id: bookingData.id,
          data: payload,
        });

        if (res?.error) {
          toast.error(res?.error?.data?.message || "Failed to update package booking");
        } else {
          toast.success("Package booking updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const res = await createBooking(payload);

        if (res?.error) {
          toast.error(res?.error?.data?.message || "Failed to create package booking");
        } else {
          toast.success("Package booking created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred while saving booking");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Client Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Client Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Client Full Name *"
            type="text"
            placeholder="e.g. John Doe"
            register={register}
            name="name"
            error={errors.name?.message}
            required
            icon={<User className="w-4 h-4 text-gray-400" />}
          />

          <TextField
            label="Client Email Address *"
            type="email"
            placeholder="e.g. john@example.com"
            register={register}
            name="userEmail"
            error={errors.userEmail?.message}
            required
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </div>

      {/* Company Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Building className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Company Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Company Name *"
            type="text"
            placeholder="e.g. Acme Corporation"
            register={register}
            name="companyName"
            error={errors.companyName?.message}
            required
            icon={<Building className="w-4 h-4 text-gray-400" />}
          />

          <TextField
            label="Company Official Email *"
            type="email"
            placeholder="e.g. contact@acme.com"
            register={register}
            name="companyEmail"
            error={errors.companyEmail?.message}
            required
            icon={<Mail className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </div>

      {/* Package & Plan Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <Briefcase className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Package & Subscription
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="packageId"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Choose Package *"
                options={packageOptions}
                placeholder={packagesLoading ? "Loading packages..." : "Select Package"}
                error={fieldState.error?.message}
                required
                disabled={packagesLoading}
              />
            )}
          />

          <Controller
            name="billingCycle"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Billing Cycle *"
                options={BILLING_CYCLES}
                placeholder="Select Billing Cycle"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <div className="md:col-span-2">
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Dropdown
                  {...field}
                  LabelName="Booking Status"
                  options={STATUS_OPTIONS}
                  placeholder="Select Status"
                  error={fieldState.error?.message}
                  required
                />
              )}
            />
          </div>
        </div>

        {/* Selected Package Preview Card */}
        {selectedPackage && (
          <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Selected Plan
              </span>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                {selectedPackage.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                {selectedPackage.description || "No description available"}
              </p>
            </div>
            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                ${selectedPackage.price ?? 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {selectedPackage.duration || "term"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <PrimaryButton
          type="button"
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading}
        >
          Cancel
        </PrimaryButton>
        <PrimaryButton type="submit" disabled={isLoading} className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Update Booking"
            : "Create Booking"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default PackageBookingForm;
