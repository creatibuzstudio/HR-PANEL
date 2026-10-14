import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/dropdown/dropdown.jsx";
import { Camera, X, Upload, DollarSign } from "lucide-react";
import {
  useAddUserMutation,
  useUpdateUserMutation,
  useUploadImageMutation,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
} from "@/services/user/userApiSlice.js";

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
  role: yup.string().required("Role is required"),
  departmentId: yup.string().optional().nullable(),
  designationId: yup.string().optional().nullable(),
  order: yup.number().typeError("Order must be a number").default(0),
  isPreview: yup.boolean().default(false),
  dateOfBirth: yup.string().optional().nullable(),
  joiningDate: yup.string().optional().nullable(),
  salary: yup
    .number()
    .typeError("Salary must be a number")
    .min(0, "Salary cannot be negative")
    .default(0),
});

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
  { value: "developer", label: "Developer" },
  { value: "employee", label: "Employee" },
  { value: "cto", label: "CTO" },
  { value: "ceo", label: "CEO" },
  { value: "coo", label: "COO" },
  { value: "cpm", label: "CPM" },
  { value: "founder", label: "Founder" },
  { value: "client", label: "Client" },
];

const UserForm = ({ user = null, onSuccess, onCancel }) => {
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: designations = [] } = useGetDesignationsQuery();

  const [addUser, { isLoading: addUserLoading }] = useAddUserMutation();
  const [updateUser, { isLoading: updateUserLoading }] = useUpdateUserMutation();
  const [uploadImage, { isLoading: uploadingImage }] = useUploadImageMutation();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef(null);

  const isEditing = !!user;

  const departmentOptions = [
    { value: "", label: "None" },
    ...departments.map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ];

  const designationOptions = [
    { value: "", label: "None" },
    ...designations.map((d) => ({
      value: d.id,
      label: d.title,
    })),
  ];

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
      role: "employee",
      departmentId: "",
      designationId: "",
      order: 0,
      salary: 0,
      isPreview: false,
      dateOfBirth: "",
      joiningDate: "",
      isEditing,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || user.nameEn || user.nameBn || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        role: user.role || "employee",
        departmentId: user.department?.id || "",
        designationId: user.designation?.id || "",
        order: user.order !== undefined && user.order !== null ? Number(user.order) : 0,
        salary: user.salary !== undefined && user.salary !== null ? Number(user.salary) : 0,
        isPreview: !!user.isPreview,
        dateOfBirth: user.dateOfBirth || "",
        joiningDate: user.joiningDate || "",
        isEditing: true,
      });
      setAvatarPreview(user.picture || "");
      setAvatarFile(null);
    } else {
      setAvatarPreview("");
      setAvatarFile(null);
    }
  }, [user, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    try {
      let pictureUrl = avatarPreview;

      // If a new image file was selected, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        const uploadRes = await uploadImage(formData).unwrap();
        if (uploadRes?.url) {
          pictureUrl = uploadRes.url;
        }
      }

      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        picture: pictureUrl || undefined,
        role: data.role,
        departmentId: data.departmentId ? data.departmentId : undefined,
        designationId: data.designationId ? data.designationId : undefined,
        order: Number(data.order || 0),
        isPreview: Boolean(data.isPreview),
        dateOfBirth: data.dateOfBirth || null,
        joiningDate: data.joiningDate || null,
      };

      if (!isEditing || data.password) {
        payload.password = data.password;
      }

      if (isEditing) {
        const result = await updateUser({ id: user.id, ...payload });
        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to update user");
        } else {
          toast.success("User updated successfully");
          reset();
          onSuccess?.();
        }
      } else {
        const result = await addUser(payload);
        if (result?.error) {
          toast.error(result?.error?.data?.message || "Failed to create user");
        } else {
          toast.success("User created successfully");
          reset();
          onSuccess?.();
        }
      }
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error(err.message || "Failed to save user");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Profile Picture Upload Section */}
      <div className="flex flex-col items-center justify-center pb-2">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-inner">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Change overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Upload Profile Picture"
          >
            <Upload className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Change</span>
          </button>

          {/* Remove button */}
          {avatarPreview && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition"
              title="Remove Picture"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-xs text-primary dark:text-orange-400 hover:underline font-medium"
        >
          {avatarPreview ? "Change Profile Picture" : "Upload Profile Picture"}
        </button>
      </div>

      <TextField
        register={register}
        label="Name"
        name="name"
        type="text"
        error={errors.name?.message}
        required
      />

      <TextField
        register={register}
        label="Email"
        name="email"
        error={errors.email?.message}
        type="email"
        required
      />

      <TextField
        register={register}
        label="Phone"
        name="phone"
        error={errors.phone?.message}
      />

      <TextField
        register={register}
        label={
          isEditing ? "Password (leave blank to keep unchanged)" : "Password"
        }
        name="password"
        error={errors.password?.message}
        type="password"
        autoComplete={isEditing ? "off" : "new-password"}
        required={!isEditing}
      />

      <Controller
        name="role"
        control={control}
        render={({ field, fieldState }) => (
          <Dropdown
            {...field}
            LabelName="Role"
            options={ROLE_OPTIONS}
            placeholder="Select Role"
            error={fieldState.error?.message}
            required
          />
        )}
      />

      <Controller
        name="departmentId"
        control={control}
        render={({ field, fieldState }) => (
          <Dropdown
            {...field}
            LabelName="Department"
            options={departmentOptions}
            placeholder="Select Department (Optional)"
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="designationId"
        control={control}
        render={({ field, fieldState }) => (
          <Dropdown
            {...field}
            LabelName="Designation"
            options={designationOptions}
            placeholder="Select Designation (Optional)"
            error={fieldState.error?.message}
          />
        )}
      />

      {/* Monthly Base Salary Section */}
      <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
        <label className="text-black font-[500] dark:text-white/75 text-[14px] flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Monthly Base Salary ($)
          </span>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            Payroll & Pool Distribution
          </span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400 font-bold">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("salary")}
            placeholder="0.00"
            className="w-full pl-8 pr-3 py-2 text-sm border border-emerald-300 dark:border-emerald-700/60 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold text-gray-900 dark:text-gray-100"
          />
        </div>
        <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
          Configured base monthly compensation used for payroll calculations
        </span>
      </div>

      {/* Date of Birth & Joining Date Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-black font-[500] dark:text-white/75 text-[14px] flex items-center gap-1.5 mb-1">
            🎂 Date of Birth (Birthday)
          </label>
          <input
            type="date"
            {...register("dateOfBirth")}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-gray-100"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Used for upcoming birthday alerts on dashboard
          </span>
        </div>

        <div>
          <label className="text-black font-[500] dark:text-white/75 text-[14px] flex items-center gap-1.5 mb-1">
            🚀 Official Joining Date
          </label>
          <input
            type="date"
            {...register("joiningDate")}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-gray-100"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Leave blank to use registration date
          </span>
        </div>
      </div>

      {/* Order & Website Preview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
        <div>
          <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
            Display Order
          </label>
          <input
            type="number"
            {...register("order")}
            placeholder="0"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono"
          />
          <span className="text-[11px] text-gray-500 mt-1 block">
            Lower numbers appear first (e.g. 1, 2, 3)
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-2">
            Website Preview
          </label>
          <label className="inline-flex items-center cursor-pointer gap-2.5">
            <input
              type="checkbox"
              {...register("isPreview")}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              Show in "Meet Our Specialist"
            </span>
          </label>
          <span className="text-[11px] text-gray-500 mt-1 block">
            Preview this team specialist on the website
          </span>
        </div>
      </div>

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
          isLoading={addUserLoading || updateUserLoading || uploadingImage}
          type="submit"
        >
          {isEditing ? "Update User" : "Add User"}
        </PrimaryButton>
      </div>
    </form>
  );
};

export default UserForm;
