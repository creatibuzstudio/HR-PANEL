import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Cake,
  Calendar,
  Camera,
  Upload,
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PartyPopper,
} from "lucide-react";
import { useAddUserMutation, useUploadImageMutation } from "@/services/user/userApiSlice";
import logo from "@/assets/logo/logo.png";

const schema = yup.object({
  name: yup.string().required("Full Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Please enter a valid email").required("Email is required"),
  phone: yup.string().optional(),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  dateOfBirth: yup.string().optional().nullable(),
  joiningDate: yup.string().optional().nullable(),
});

export default function EmployeeRegister() {
  const navigate = useNavigate();
  const [addUser, { isLoading: isRegistering }] = useAddUserMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const fileInputRef = useRef(null);

  // Today's date in YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      joiningDate: todayStr,
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size must be less than 5MB");
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
      let pictureUrl = "";

      // Upload profile picture if provided
      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        const uploadRes = await uploadImage(formData).unwrap();
        if (uploadRes?.url) {
          pictureUrl = uploadRes.url;
        }
      }

      // Default role is strictly 'employee', no department/designation required
      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
        role: "employee",
        dateOfBirth: data.dateOfBirth || undefined,
        joiningDate: data.joiningDate || todayStr,
        picture: pictureUrl || undefined,
      };

      const result = await addUser(payload).unwrap();
      setRegisteredUser(result?.data || payload);
      setIsSuccess(true);
      toast.success("Welcome aboard! Your employee registration is complete.");
      reset();
    } catch (error) {
      console.error("Employee Registration error:", error);
      const msg =
        error?.data?.message ||
        error?.message ||
        "Registration failed. Please check your details and try again.";
      toast.error(msg);
    }
  };

  // Success Celebration View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1f1e22] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Ambient celebration glow */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg border border-emerald-200 dark:border-emerald-800">
            <PartyPopper className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Registration Successful!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome to the Team, {registeredUser?.name?.split(" ")[0] || "Colleague"}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Your employee account has been created. Your profile is now registered with the company registry and live dashboard.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 text-left text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Registered Email:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                {registeredUser?.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Assigned Role:</span>
              <span className="capitalize font-bold text-indigo-600 dark:text-indigo-400">
                Employee
              </span>
            </div>
            {registeredUser?.dateOfBirth && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Birthday Recorded:</span>
                <span className="font-medium text-pink-600 dark:text-pink-400">
                  🎂 {registeredUser.dateOfBirth}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Joining Date:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                🚀 {registeredUser?.joiningDate || todayStr}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Sign In to Employee Portal
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-gray-400">
              Department and designation will be reviewed and assigned by administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121113] flex items-center justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <Link to="/" className="inline-block relative mb-3 group">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-600/20 to-amber-500/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
            <img
              src={logo}
              alt="Creatibuz Studio"
              className="relative h-14 sm:h-16 w-auto max-w-[280px] sm:max-w-[320px] object-contain drop-shadow-md filter dark:brightness-110"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:text-orange-400 border border-primary/20 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Employee Onboarding Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Join the Creatibuz Team
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mt-1">
            Fill in your details below to set up your official employee profile and team credentials.
          </p>
        </div>

        {/* Registration Card Form */}
        <div className="bg-white dark:bg-[#1b1a1d] rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Profile Avatar / Selfie Upload */}
            <div className="flex flex-col items-center justify-center pb-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-7 h-7 mx-auto text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-400 block font-medium">Add Photo</span>
                    </div>
                  )}
                </div>

                {/* Change overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload Photo"
                >
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Upload</span>
                </button>

                {/* Remove button */}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition cursor-pointer"
                    title="Remove Photo"
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
                className="mt-2 text-xs text-primary dark:text-orange-400 hover:underline font-semibold cursor-pointer"
              >
                {avatarPreview ? "Change Photo" : "Upload Profile Photo (Optional)"}
              </button>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="e.g. John Doe"
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-primary"
                  }`}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:border-primary"
                    }`}
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    {...register("phone")}
                    placeholder="+880 1..."
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth & Joining Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Cake className="w-3.5 h-3.5 text-pink-500" /> Date of Birth (Birthday)
                </label>
                <input
                  type="date"
                  {...register("dateOfBirth")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Celebrated on company dashboard
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Joining Date
                </label>
                <input
                  type="date"
                  {...register("joiningDate")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Official date joining the team
                </span>
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Min 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Repeat password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 dark:border-gray-700 focus:border-primary"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            {/* Note about department and designation */}
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
              <span>
                Your official department and designation will be assigned by company administration upon verification.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isRegistering || isUploadingImage}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-700 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isRegistering || isUploadingImage ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Profile...</span>
                </div>
              ) : (
                <>
                  <span>Complete Employee Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Already have an employee or admin account?{" "}
              <Link
                to="/login"
                className="text-primary dark:text-orange-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
