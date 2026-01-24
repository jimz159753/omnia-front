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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomAlert } from "@/components/ui/CustomAlert";
import { ServiceWithRelations } from "@/app/(dashboard)/dashboard/services/columns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceFormData } from "@/lib/validations/service";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { useTranslation } from "@/hooks/useTranslation";

export interface ServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  item?: ServiceWithRelations | null;
}

export function ServiceFormModal({
  open,
  onOpenChange,
  onSuccess,
  item,
}: ServiceFormModalProps) {
  const { t } = useTranslation("services");
  const isEditMode = !!item;

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string; categoryId: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: "",
      price: "",
      commission: "",
      categoryId: "",
      subCategoryId: "",
      image: "",
    },
  });

  const watchedCategoryId = watch("categoryId");

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setError("");
      try {
        const [catRes, subRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ]);
        const catData = await catRes.json();
        const subData = await subRes.json();
        setCategories(catData.data || []);
        setSubCategories(subData.data || []);
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
        duration: item.duration.toString(),
        price: item.price.toString(),
        commission: item.commission.toString(),
        categoryId: item.categoryId ?? "",
        subCategoryId: item.subCategoryId ?? "",
        image: item.image ?? "",
      });
      setImageFile(null);
    } else {
      reset({
        name: "",
        description: "",
        duration: "",
        price: "",
        commission: "",
        categoryId: "",
        subCategoryId: "",
        image: "",
      });
      setImageFile(null);
    }
  }, [open, item, reset]);

  const onSubmit = async (values: ServiceFormData) => {
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
        duration: Number(values.duration),
        price: Number(values.price),
        commission: Number(values.commission),
        image: imageUrl,
      };

      const response = await fetch("/api/services", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditMode ? { ...payload, id: item?.id } : payload
        ),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || `Failed to ${isEditMode ? "update" : "create"} service`
        );
      }

      setSuccess(isEditMode ? t("serviceUpdatedSuccess") : t("serviceCreatedSuccess"));
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("updateService") || "Update Service" : t("addService") || "Add Service"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("updateServiceDescription") || "Update the details of the service."
              : t("addServiceDescription") || "Fill in the details to add a new service."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && <CustomAlert severity="error">{error}</CustomAlert>}
          {success && <CustomAlert severity="success">{success}</CustomAlert>}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              {t("name") || "Name"}<span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register("name")}
              placeholder={t("enterServiceName") || "Enter service name"}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700"
            >
              {t("serviceDescription") || "Description"}
            </label>
            <textarea
              id="description"
              {...register("description")}
              placeholder={t("enterServiceDescription") || "Enter service description"}
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
            <label className="text-sm font-medium text-gray-700">
              {t("category") || "Category"}
            </label>
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
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectCategory") || "Select a category"} />
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
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("subcategory") || "Subcategory"}
            </label>
            <Controller
              control={control}
              name="subCategoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!watchedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectSubcategory") || "Select a subcategory"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories
                      .filter(
                        (sub) =>
                          !watchedCategoryId ||
                          sub.categoryId === watchedCategoryId
                      )
                      .map((sub) => (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="duration"
                className="text-sm font-medium text-gray-700"
              >
                {t("durationMin") || "Duration (min)"}<span className="text-red-500">*</span>
              </label>
              <input
                id="duration"
                type="number"
                {...register("duration")}
                placeholder="60"
                min="1"
                step="1"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.duration.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="price"
                className="text-sm font-medium text-gray-700"
              >
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
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="commission"
                className="text-sm font-medium text-gray-700"
              >
                {t("commission") || "Commission"}<span className="text-red-500">*</span>
              </label>
              <input
                id="commission"
                type="number"
                {...register("commission")}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.commission && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.commission.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("serviceImage") || "Service Image"}
            </label>
            <ImageDropzone
              value={watch("image")}
              onChange={(file) => setImageFile(file)}
              onError={(error) => setError(error)}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">
                {errors.image.message as string}
              </p>
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
                ? t("updateService") || "Update Service"
                : t("createService") || "Create Service"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
