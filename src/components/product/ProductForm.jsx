import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import PrimaryButton from "@/components/ui/buttons/primary-button";
import TextField from "@/components/ui/input/TextField";
import Dropdown from "@/components/ui/dropdown/dropdown";
import TextareaField from "@/components/ui/input/TextareaField";

import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/services/product/productApiSlice.js";

// Enums
const ProductType = [
  { value: "climate_attribute", label: "Climate Attribute" },
  { value: "service", label: "Service" },
  { value: "equipment", label: "Equipment" },
];

const PurchaseType = [
  { value: "one_time", label: "One Time" },
  // { value: "recurring", label: "Recurring" },
  // { value: "both", label: "Both" },
];

const DeliveryMethod = [
  { value: "email", label: "Email" },
  { value: "download", label: "Download" },
  { value: "manual", label: "Manual" },
];

const PriceUnit = [
  { value: "per_year", label: "Per Year" },
  { value: "per_month", label: "Per Month" },
  { value: "per_unit", label: "Per Unit" },
  // { value: "one_time", label: "One Time" },
];

// Yup validation schema
const productSchema = yup.object({
  name: yup.string().required("Name is required").max(255),
  description: yup.string().nullable(),
  price: yup
    .number()
    .required("Price is required")
    .typeError("Price must be a number"),
  currency: yup
    .string()
    .required("Currency is required")
    .default("BDT")
    .max(10),
  product_type: yup.string().required("Product Type is required"),
  purchase_type: yup.string().required("Purchase Type is required"),
  price_unit: yup
    .string()
    .required("Price Unit is required")
    .oneOf(
      ["per_year", "per_month", "per_unit", "one_time"],
      "Price Unit must be per_year, per_month, per_unit, or one_time",
    ),
  delivery_method: yup.string().nullable(),
  sort_order: yup.number().integer().default(0),
});

export default function ProductForm({ product, onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "BDT",
      product_type: "",
      purchase_type: "",
      price_unit: "per_unit",
      delivery_method: "",
      sort_order: 0,
    },
    resolver: yupResolver(productSchema),
    mode: "onSubmit",
    context: { isEditing },
  });

  useEffect(() => {
    if (product) {
      Object.keys(product).forEach((key) => {
        if (product[key] !== undefined) {
          if (key !== "metadata" && key !== "slug") {
            setValue(key, product[key]);
          }
        }
      });
      // Ensure price_unit has a valid value when editing
      if (
        !product.price_unit ||
        !["per_year", "per_month", "per_unit", "one_time"].includes(
          product.price_unit,
        )
      ) {
        setValue("price_unit", "per_unit");
      }
    }
  }, [product, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        metadata: null,
      };

      if (product) {
        await updateProduct({
          id: product.id,
          data: payload,
        }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload).unwrap();
        toast.success("Product created successfully");
      }

      onSuccess();
      reset();
    } catch (error) {
      console.error("Error details:", error);
      toast.error(error?.data?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Name"
            name="name"
            register={register}
            placeholder="Product Name"
            error={errors.name?.message}
            required
          />

          <Controller
            name="product_type"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Product Type"
                options={ProductType}
                placeholder="Select Type"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <Controller
            name="price_unit"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Price Unit"
                options={PriceUnit}
                placeholder="Select Price Unit"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <TextField
            label="Currency"
            name="currency"
            register={register}
            placeholder="BDT"
            error={errors.currency?.message}
            required
          />

          <TextField
            label="Price"
            name="price"
            step="0.01"
            type="number"
            register={register}
            placeholder="0.00"
            error={errors.price?.message}
            required
          />

          <Controller
            name="purchase_type"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Purchase Type"
                options={PurchaseType}
                placeholder="Select Purchase Type"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <Controller
            name="delivery_method"
            control={control}
            render={({ field, fieldState }) => (
              <Dropdown
                {...field}
                LabelName="Delivery Method"
                options={DeliveryMethod}
                placeholder="Select Delivery Method"
                error={fieldState.error?.message}
              />
            )}
          />

          <TextField
            label="Sort Order"
            name="sort_order"
            type="number"
            register={register}
            placeholder="0"
            error={errors.sort_order?.message}
          />
        </div>

        <TextareaField
          label="Description"
          name="description"
          register={register}
          placeholder="Product Description"
          rows={3}
          error={errors.description?.message}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <PrimaryButton
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Saving..." : product ? "Update" : "Create"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
