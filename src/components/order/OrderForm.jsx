import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import TextareaField from "@/components/ui/input/TextareaField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from "@/services/order/orderApiSlice";
import { useGetAllCategoriesQuery } from "@/services/category/categoryApiSlice";
import { useGetAllClientUsersQuery } from "@/services/user/userApiSlice";
import { DollarSign, CheckCircle2, Clock, AlertCircle, RefreshCw, User, Calendar, FileText, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const ORDER_STATUS_OPTIONS = [
  { label: "Onboard", value: "onboard" },
  { label: "Ongoing", value: "ongoing" },
  { label: "QA Test", value: "qa test" },
  { label: "Delivery", value: "delivery" },
  { label: "Delivered", value: "delivered" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
];

const schema = yup.object({
  projectName: yup.string().required("Project name is required"),
  subtotal: yup
    .number()
    .typeError("Subtotal must be a number")
    .required("Subtotal is required")
    .min(0, "Subtotal cannot be negative"),
  discount: yup.number().typeError("Discount must be a number").default(0).min(0, "Discount cannot be negative"),
  tax: yup.number().typeError("Tax must be a number").default(0).min(0, "Tax cannot be negative"),
  budget: yup.number().typeError("Budget must be a number").default(0),
  advance: yup
    .number()
    .typeError("Advance must be a number")
    .default(0)
    .min(0, "Advance cannot be negative"),
  status: yup.string().default("onboard"),
  paymentStatus: yup.string().default("unpaid"),
  duration: yup.string().nullable().optional(),
  projectProgress: yup.string().nullable().optional(),
  invoiceNumber: yup.string().nullable().optional(),
  dueDate: yup.string().nullable().optional(),
  categoryId: yup.string().nullable().optional(),
  clientId: yup.string().nullable().optional(),
  clientName: yup.string().nullable().optional(),
  clientEmail: yup.string().nullable().optional(),
  clientPhone: yup.string().nullable().optional(),
  clientAddress: yup.string().nullable().optional(),
  notes: yup.string().nullable().optional(),
});

export default function OrderForm({ order = null, onSuccess, onCancel }) {
  const [createOrder, { isLoading: createLoading }] = useCreateOrderMutation();
  const [updateOrder, { isLoading: updateLoading }] = useUpdateOrderMutation();

  const { data: categories = [] } = useGetAllCategoriesQuery();
  const { data: clientUsersData = [] } = useGetAllClientUsersQuery();

  // Ensure clients is strictly an array of users where role === 'client'
  const clients = useMemo(() => {
    let rawList = [];
    if (Array.isArray(clientUsersData)) {
      rawList = clientUsersData;
    } else if (Array.isArray(clientUsersData?.items)) {
      rawList = clientUsersData.items;
    } else if (Array.isArray(clientUsersData?.data)) {
      rawList = clientUsersData.data;
    }

    return rawList.filter((u) => u.role?.toLowerCase() === "client");
  }, [clientUsersData]);

  const isEditing = !!order;
  const isLoading = createLoading || updateLoading;

  const [clientMode, setClientMode] = useState(
    order?.clientId || order?.client?.id ? "registered" : "manual"
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      projectName: "",
      subtotal: 0,
      budget: 0,
      advance: 0,
      discount: 0,
      tax: 0,
      status: "onboard",
      paymentStatus: "unpaid",
      duration: "2 Weeks",
      projectProgress: "10%",
      invoiceNumber: "",
      dueDate: "",
      categoryId: "",
      clientId: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      notes: "",
    },
  });

  const watchedSubtotal = Number(watch("subtotal") || 0);
  const watchedDiscount = Number(watch("discount") || 0);
  const watchedTax = Number(watch("tax") || 0);
  const watchedAdvance = Number(watch("advance") || 0);
  const watchedPaymentStatus = watch("paymentStatus");
  const watchedInvoiceNumber = watch("invoiceNumber");

  // Effective Total = Subtotal - Discount + Tax
  const effectiveTotal = Math.max(0, watchedSubtotal - watchedDiscount + watchedTax);
  // Balance Due = Total - Advance
  const balanceDue = Math.max(0, effectiveTotal - watchedAdvance);

  // Helper to generate unique Invoice Number
  const generateNewInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000);
    const newInv = `INV-${year}-${rand}`;
    setValue("invoiceNumber", newInv, { shouldValidate: true, shouldDirty: true });
    return newInv;
  };

  // Auto-generate invoice number on add
  useEffect(() => {
    if (!isEditing && !watch("invoiceNumber")) {
      generateNewInvoiceNumber();
    }
  }, [isEditing]);

  // Sync effectiveTotal into budget hidden field whenever subtotal, discount, or tax change
  useEffect(() => {
    setValue("budget", effectiveTotal);
  }, [effectiveTotal, setValue]);

  // Auto-update paymentStatus suggestion based on advance and effective total
  const handleAutoPaymentStatus = (adv, tot) => {
    if (adv >= tot && tot > 0) {
      setValue("paymentStatus", "paid");
    } else if (adv > 0) {
      setValue("paymentStatus", "partial");
    } else {
      setValue("paymentStatus", "unpaid");
    }
  };

  // Populate form on edit
  useEffect(() => {
    if (order) {
      const initSubtotal =
        order.subtotal !== undefined && order.subtotal !== null
          ? Number(order.subtotal)
          : Math.max(
              0,
              Number(order.budget || 0) +
                Number(order.discount || 0) -
                Number(order.tax || 0)
            );

      reset({
        projectName: order.projectName || "",
        subtotal: initSubtotal,
        budget: Number(order.budget || 0),
        advance: Number(order.advance || 0),
        discount: Number(order.discount || 0),
        tax: Number(order.tax || 0),
        status: order.status || "onboard",
        paymentStatus: order.paymentStatus || "unpaid",
        duration: order.duration || "",
        projectProgress: order.projectProgress || "",
        invoiceNumber: order.invoiceNumber || "",
        dueDate: order.dueDate
          ? new Date(order.dueDate).toISOString().split("T")[0]
          : "",
        categoryId: order.categoryId || order.category?.id || "",
        clientId: order.clientId || order.client?.id || "",
        clientName: order.clientName || order.client?.name || "",
        clientEmail: order.clientEmail || order.client?.email || "",
        clientPhone: order.clientPhone || order.client?.phone || "",
        clientAddress: order.clientAddress || order.client?.location || "",
        notes: order.notes || "",
      });

      if (order.clientId || order.client?.id) {
        setClientMode("registered");
      } else {
        setClientMode("manual");
      }
    }
  }, [order, reset]);

  // Sync client details when registered client is chosen
  const handleClientSelect = (clientId) => {
    setValue("clientId", clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setValue("clientName", found.name || "");
      setValue("clientEmail", found.email || "");
      setValue("clientPhone", found.phone || "");
      setValue("clientAddress", found.location || "");
    }
  };

  const onSubmit = async (data) => {
    try {
      const subtotalVal = Number(data.subtotal || 0);
      const discountVal = Number(data.discount || 0);
      const taxVal = Number(data.tax || 0);
      const netBudget = Math.max(0, subtotalVal - discountVal + taxVal);
      const invNumber = data.invoiceNumber?.trim() || generateNewInvoiceNumber();

      let advanceVal = Number(data.advance || 0);
      if (data.paymentStatus === "paid") {
        advanceVal = Math.max(netBudget, advanceVal);
      }

      const payload = {
        projectName: data.projectName,
        subtotal: subtotalVal,
        budget: netBudget,
        advance: advanceVal,
        discount: discountVal,
        tax: taxVal,
        status: data.status,
        paymentStatus: data.paymentStatus,
        duration: data.duration || undefined,
        projectProgress: data.projectProgress || undefined,
        invoiceNumber: invNumber,
        dueDate: data.dueDate || undefined,
        notes: data.notes || undefined,
        categoryId: data.categoryId || undefined,
        clientId: clientMode === "registered" && data.clientId ? data.clientId : undefined,
        clientName: data.clientName || undefined,
        clientEmail: data.clientEmail || undefined,
        clientPhone: data.clientPhone || undefined,
        clientAddress: data.clientAddress || undefined,
      };

      if (isEditing) {
        await updateOrder({ id: order.id, data: payload }).unwrap();
        toast.success("Order & invoice updated successfully");
      } else {
        await createOrder(payload).unwrap();
        toast.success("Order & invoice created successfully");
      }
      onSuccess?.();
    } catch (err) {
      const msg = err?.data?.message;
      toast.error(
        typeof msg === "string"
          ? msg
          : Array.isArray(msg)
          ? msg[0]
          : "Failed to save order"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Live Financial & Status Summary Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-[#181310] to-[#251508] text-white border border-primary/30 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Order Financials
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs font-mono font-bold text-gray-200 bg-white/10 px-2 py-0.5 rounded">
              {watchedInvoiceNumber || "INV-AUTO"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Payment:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                watchedPaymentStatus === "paid"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : watchedPaymentStatus === "partial"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              {watchedPaymentStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-4 pt-3.5 text-center sm:text-left">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Subtotal
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-gray-200">
              ${watchedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Discount (-)
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
              -${watchedDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Tax (+)
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-amber-300">
              +${watchedTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Net Total
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-white">
              ${effectiveTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Advance Paid
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
              ${watchedAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              Balance Due
            </span>
            <span
              className={`text-base sm:text-lg font-bold font-mono ${
                balanceDue === 0 ? "text-emerald-400" : "text-amber-400 font-extrabold"
              }`}
            >
              ${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Project Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider border-b pb-2 dark:border-gray-800">
          Project Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Project Name *"
            placeholder="e.g. Modern E-commerce Platform, Mobile App UI/UX"
            register={register}
            name="projectName"
            error={errors.projectName?.message}
          />

          {/* Service Category */}
          <div className="space-y-1">
            <label className="text-black font-[500] dark:text-white/75 text-[14px]">
              Service Category
            </label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField
            label="Duration / Timeline"
            placeholder="e.g. 2 Weeks, 1 Month"
            register={register}
            name="duration"
          />

          {/* Order Status */}
          <div className="space-y-1">
            <label className="text-black font-[500] dark:text-white/75 text-[14px]">
              Order Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <TextField
            label="Project Progress"
            placeholder="e.g. 25%, 50%, In Review"
            register={register}
            name="projectProgress"
          />
        </div>
      </div>

      {/* Client Information */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap justify-between items-center border-b pb-2 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Client Details
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setClientMode("registered")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                clientMode === "registered"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              Registered Client
            </button>
            <button
              type="button"
              onClick={() => setClientMode("manual")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                clientMode === "manual"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              Manual Client Info
            </button>
          </div>
        </div>

        {clientMode === "registered" && (
          <div className="space-y-1">
            <label className="text-black font-[500] dark:text-white/75 text-[14px]">
              Select Client Account
            </label>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={handleClientSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a registered client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <div className="p-3 text-xs text-gray-500 text-center">
                        No client users found. Use "Manual Client Info" instead.
                      </div>
                    ) : (
                      clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.email})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Client Name"
            placeholder="e.g. John Doe / TechCorp Inc."
            register={register}
            name="clientName"
          />
          <TextField
            label="Client Email"
            type="email"
            placeholder="e.g. client@company.com"
            register={register}
            name="clientEmail"
          />
          <TextField
            label="Client Phone"
            placeholder="e.g. +1 555-0199"
            register={register}
            name="clientPhone"
          />
          <TextField
            label="Client Location / Address"
            placeholder="e.g. New York, USA"
            register={register}
            name="clientAddress"
          />
        </div>
      </div>

      {/* Financials & Invoice Section */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Financials & Invoice Setup
          </h3>
          <span className="text-xs text-gray-500">
            Total = Subtotal - Discount + Tax
          </span>
        </div>

        {/* Row 1: Subtotal, Discount, Tax, Calculated Net Total */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Subtotal ($) *
            </label>
            <input
              type="number"
              step="any"
              {...register("subtotal", {
                onChange: (e) => {
                  const newSub = Number(e.target.value || 0);
                  const tot = Math.max(0, newSub - watchedDiscount + watchedTax);
                  handleAutoPaymentStatus(watchedAdvance, tot);
                },
              })}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
            />
            {errors.subtotal && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.subtotal.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Discount ($)
            </label>
            <input
              type="number"
              step="any"
              {...register("discount", {
                onChange: (e) => {
                  const newDisc = Number(e.target.value || 0);
                  const tot = Math.max(0, watchedSubtotal - newDisc + watchedTax);
                  handleAutoPaymentStatus(watchedAdvance, tot);
                },
              })}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Tax ($)
            </label>
            <input
              type="number"
              step="any"
              {...register("tax", {
                onChange: (e) => {
                  const newTax = Number(e.target.value || 0);
                  const tot = Math.max(0, watchedSubtotal - watchedDiscount + newTax);
                  handleAutoPaymentStatus(watchedAdvance, tot);
                },
              })}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono text-amber-500"
            />
          </div>

          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Net Invoiced Total ($)
            </label>
            <div className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/60 font-mono font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>${effectiveTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-gray-400 font-sans font-normal uppercase">Auto</span>
            </div>
          </div>
        </div>

        {/* Row 2: Advance Paid, Balance Due, Payment Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Advance / Paid Upfront ($)
            </label>
            <input
              type="number"
              step="any"
              {...register("advance", {
                onChange: (e) =>
                  handleAutoPaymentStatus(
                    Number(e.target.value || 0),
                    effectiveTotal
                  ),
              })}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Balance Due ($)
            </label>
            <div
              className={`w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/60 font-mono font-bold flex items-center justify-between ${
                balanceDue === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              <span>${balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-gray-400 font-sans font-normal uppercase">Remaining</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-black font-[500] dark:text-white/75 text-[14px]">
              Payment Status
            </label>
            <Controller
              name="paymentStatus"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    if (val === "paid") {
                      setValue("advance", effectiveTotal, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    } else if (val === "unpaid" && watchedAdvance >= effectiveTotal && effectiveTotal > 0) {
                      setValue("advance", 0, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger className="w-full capitalize">
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Row 3: Auto-created Invoice Number with Regenerate button & Payment Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Invoice Number (Auto Generated)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                {...register("invoiceNumber")}
                placeholder="e.g. INV-2026-102938"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono font-bold"
              />
              <button
                type="button"
                onClick={generateNewInvoiceNumber}
                title="Generate New Invoice Number"
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-black font-[500] dark:text-white/75 text-[14px] block mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <TextareaField
          label="Scope of Work / Deliverables / Terms & Notes"
          placeholder="Detailed description of features, milestones, and payment terms for this invoice..."
          register={register}
          name="notes"
          rows={3}
        />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t dark:border-gray-800">
        <div className="text-xs text-gray-500">
          * Required fields. Subtotal, discount & tax calculate invoice totals dynamically.
        </div>
        <div className="flex items-center space-x-3">
          <PrimaryButton type="button" onClick={onCancel} variant="secondary">
            Cancel
          </PrimaryButton>
          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Order & Invoice"
              : "Create Order & Invoice"}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}
