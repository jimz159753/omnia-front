"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomAlert } from "@/components/ui/CustomAlert";
import { ProductWithCategory } from "@/app/(dashboard)/dashboard/products/columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormData } from "@/lib/validations/product";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { useTranslation } from "@/hooks/useTranslation";

export interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: ProductWithCategory | null;
}

export function ProductFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: ProductFormModalProps) {
  const { t } = useTranslation("products");
  const isEditMode = !!item;

  const [categories, setCategories] = useState<
    { id: string; name: string; subCategory?: { id: string; name: string } | null }[]
  >([]);
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string; categoryId: string }[]
  >([]);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: "",
      minStock: "",
      price: "",
      categoryId: "",
      subCategoryId: "",
      providerId: "",
      sku: "",
      cost: "",
      image: "",
    },
  });

  const watchedCategoryId = watch("categoryId");

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setError("");
      try {
        const [catRes, subRes, provRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
          fetch("/api/providers"),
        ]);
        const catData = await catRes.json();
        const subData = await subRes.json();
        const provData = await provRes.json();
        setCategories(catData.data || []);
        setSubCategories(subData.data || []);
        setProviders(provData.data || []);
      } catch (err) {
        console.error(err);
        setError(t("failedToLoadData") || "Failed to load form data");
      }
    };

    load();

    if (item) {
      reset({
        name: item.name,
        description: item.description ?? "",
        stock: item.stock.toString(),
        minStock: item.minStock?.toString() ?? "0",
        price: item.price.toString(),
        categoryId: item.categoryId ?? "",
        subCategoryId: item.subCategoryId ?? "",
        providerId: item.providerId ?? "",
        sku: item.sku ?? "",
        cost: item.cost.toString(),
        image: item.image ?? "",
      });
      setImageFile(null);
    } else {
      reset({
        name: "",
        description: "",
        stock: "",
        minStock: "",
        price: "",
        categoryId: "",
        subCategoryId: "",
        providerId: "",
        sku: "",
        cost: "",
        image: "",
      });
      setImageFile(null);
    }
  }, [open, item, reset]);

  const onSubmit = async (values: ProductFormData) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let imageUrl = values.image;

      // Upload image if a file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || "Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...values,
        stock: Number(values.stock),
        minStock: values.minStock ? Number(values.minStock) : 0,
        price: Number(values.price),
        cost: Number(values.cost),
        image: imageUrl,
      };

      const response = await fetch("/api/products", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditMode ? { ...payload, id: item?.id } : payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} product`);
      }

      setSuccess(isEditMode ? t("productUpdatedSuccess") : t("productCreatedSuccess"));
      reset();
      setImageFile(null);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubCategories = subCategories.filter(
    (sub) => !watchedCategoryId || sub.categoryId === watchedCategoryId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[90vh]">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {isEditMode ? t("updateProduct") || "Update Product" : t("addProduct") || "Add Product"}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm">
                {isEditMode
                  ? t("updateProductDescription") || "Update the details of the product."
                  : t("addProductDescription") || "Fill in the details to add a new product."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Alert messages */}
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          {/* Basic Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Información básica</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("sku") || "SKU"}
                </label>
                <input
                  {...register("sku")}
                  placeholder={t("enterSku") || "Enter SKU"}
                  className="w-full h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
                {errors.sku && <p className="text-red-500 text-xs">{errors.sku.message as string}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("name") || "Name"} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder={t("enterProductName") || "Enter product name"}
                  className="w-full h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message as string}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t("productDescription") || "Description"}
              </label>
              <textarea
                {...register("description")}
                placeholder={t("enterProductDescription") || "Enter product description"}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-pink-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categorías y proveedor</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t("category") || "Category"}</label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("subCategoryId", "");
                      }}
                    >
                      <SelectTrigger className="w-full h-11 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder={t("selectCategory") || "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t("subcategory") || "Subcategory"}</label>
                <Controller
                  control={control}
                  name="subCategoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={!watchedCategoryId}>
                      <SelectTrigger className="w-full h-11 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder={t("selectSubcategory") || "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubCategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("provider") || "Provider"} <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="providerId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-11 border-2 border-gray-200 rounded-xl">
                        <SelectValue placeholder={t("selectProvider") || "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.providerId && <p className="text-red-500 text-xs">{errors.providerId.message as string}</p>}
              </div>
            </div>
          </div>

          {/* Inventory & Pricing Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-green-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventario y precios</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("stock") || "Stock"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("stock")}
                  placeholder="0"
                  min="0"
                  className="w-full h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center font-semibold"
                />
                {errors.stock && <p className="text-red-500 text-xs">{errors.stock.message as string}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("minStock") || "Min Stock"}
                </label>
                <input
                  type="number"
                  {...register("minStock")}
                  placeholder="0"
                  min="0"
                  className="w-full h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-center font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("cost") || "Cost"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    {...register("cost")}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-11 rounded-xl border-2 border-gray-200 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-semibold"
                  />
                </div>
                {errors.cost && <p className="text-red-500 text-xs">{errors.cost.message as string}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("price") || "Price"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    {...register("price")}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full h-11 rounded-xl border-2 border-gray-200 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-semibold"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs">{errors.price.message as string}</p>}
              </div>
            </div>
          </div>

          {/* Image Upload Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t("productImage") || "Product Image"}</span>
            </div>
            <ImageDropzone
              value={watch("image")}
              onChange={(file) => setImageFile(file)}
              onError={(error) => setError(error)}
            />
          </div>

          {/* Action Buttons */}
          <DialogFooter className="gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading || isSubmitting}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-rose-500/25 flex items-center gap-2"
            >
              {loading || isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditMode ? t("updating") || "Updating..." : t("creating") || "Creating..."}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {isEditMode ? t("updateProduct") || "Update Product" : t("createProduct") || "Create Product"}
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

