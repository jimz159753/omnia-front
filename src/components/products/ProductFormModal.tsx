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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("updateProduct") || "Update Product" : t("addProduct") || "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("updateProductDescription") || "Update the details of the product."
              : t("addProductDescription") || "Fill in the details to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-medium text-gray-700">
                {t("sku") || "SKU"}
              </label>
              <input
                id="sku"
                {...register("sku")}
                placeholder={t("enterSku") || "Enter SKU"}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                {t("name") || "Name"}<span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                {...register("name")}
                placeholder={t("enterProductName") || "Enter product name"}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              {t("productDescription") || "Description"}
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder={t("enterProductDescription") || "Enter product description"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("category") || "Category"}</label>
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectCategory") || "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                        {category.subCategory && ` - ${category.subCategory.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t("subcategory") || "Subcategory"}</label>
            <Controller
              control={control}
              name="subCategoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchedCategoryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectSubcategory") || "Select a subcategory"} />
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
            {errors.subCategoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subCategoryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("provider") || "Provider"}<span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="providerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectProvider") || "Select a provider"} />
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
            {errors.providerId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.providerId.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium text-gray-700">
                {t("stock") || "Stock"}<span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                type="number"
                {...register("stock")}
                placeholder="0"
                min="0"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="minStock" className="text-sm font-medium text-gray-700">
                {t("minStock") || "Min Stock"}
              </label>
              <input
                id="minStock"
                type="number"
                {...register("minStock")}
                placeholder="0"
                min="0"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.minStock && (
                <p className="text-red-500 text-sm mt-1">{errors.minStock.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-gray-700">
                {t("price") || "Price"}<span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                {...register("price")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="cost" className="text-sm font-medium text-gray-700">
                {t("cost") || "Cost"}<span className="text-red-500">*</span>
              </label>
              <input
                id="cost"
                type="number"
                {...register("cost")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.cost && (
                <p className="text-red-500 text-sm mt-1">{errors.cost.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("productImage") || "Product Image"}
            </label>
            <ImageDropzone
              value={watch("image")}
              onChange={(file) => setImageFile(file)}
              onError={(error) => setError(error)}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image.message as string}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading || isSubmitting}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="px-4 py-2 rounded-md bg-brand-500 hover:bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isSubmitting
                ? isEditMode
                  ? t("updating") || "Updating..."
                  : t("creating") || "Creating..."
                : isEditMode
                ? t("updateProduct") || "Update Product"
                : t("createProduct") || "Create Product"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

