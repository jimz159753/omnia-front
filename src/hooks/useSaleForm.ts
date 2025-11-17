import { useState, useEffect } from "react";
import { Sale } from "@/generated/prisma";
import { saleSchema } from "@/lib/validations/sales";
import { z } from "zod";

interface UseSaleFormProps {
  open: boolean;
  item?: Sale | null;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export function useSaleForm({
  open,
  item,
  onSuccess,
  onOpenChange,
}: UseSaleFormProps) {
  const isEditMode = !!item;

  const [formData, setFormData] = useState({
    date: "",
    client: "",
    code: "",
    description: "",
    units: "",
    unitPrice: "",
    totalPrice: "",
    hasDiscount: false,
    discountPercentage: "",
    finalPrice: "",
    cardPayment: false,
    realIncome: "",
    paymentStatus: "",
    paymentMethod: "",
    account: "",
    seller: "",
    category: "",
    subCategory: "",
    provider: "",
    providerCost: "",
    providerPaymentStatus: "",
    comments: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Populate form when modal opens
  useEffect(() => {
    if (open) {
      if (item) {
        // Format date for input field (yyyy-MM-dd)
        const dateStr = new Date(item.date).toISOString().split("T")[0];

        setFormData({
          date: dateStr,
          client: item.client,
          code: item.code,
          description: item.description,
          units: item.units.toString(),
          unitPrice: item.unitPrice.toString(),
          totalPrice: item.totalPrice.toString(),
          hasDiscount: item.hasDiscount,
          discountPercentage: item.discountPercentage?.toString() || "",
          finalPrice: item.finalPrice.toString(),
          cardPayment: item.cardPayment,
          realIncome: item.realIncome.toString(),
          paymentStatus: item.paymentStatus,
          paymentMethod: item.paymentMethod,
          account: item.account,
          seller: item.seller,
          category: item.category,
          subCategory: item.subCategory || "",
          provider: item.provider,
          providerCost: item.providerCost.toString(),
          providerPaymentStatus: item.providerPaymentStatus,
          comments: item.comments || "",
        });
      } else {
        // Reset form for new item
        const today = new Date().toISOString().split("T")[0];
        setFormData({
          date: today,
          client: "",
          code: "",
          description: "",
          units: "1",
          unitPrice: "",
          totalPrice: "",
          hasDiscount: false,
          discountPercentage: "",
          finalPrice: "",
          cardPayment: false,
          realIncome: "",
          paymentStatus: "Pendiente",
          paymentMethod: "Efectivo",
          account: "Front Desk",
          seller: "",
          category: "",
          subCategory: "",
          provider: "",
          providerCost: "",
          providerPaymentStatus: "Pendiente",
          comments: "",
        });
      }
      setError("");
      setSuccess("");
    }
  }, [open, item]);

  // Auto-calculate total price when units or unit price changes
  useEffect(() => {
    const units = parseFloat(formData.units) || 0;
    const unitPrice = parseFloat(formData.unitPrice) || 0;
    const totalPrice = units * unitPrice;

    if (totalPrice > 0 && formData.totalPrice !== totalPrice.toString()) {
      setFormData((prev) => ({
        ...prev,
        totalPrice: totalPrice.toFixed(2),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.units, formData.unitPrice]);

  // Auto-calculate final price when total price or discount changes
  useEffect(() => {
    const totalPrice = parseFloat(formData.totalPrice) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;

    let finalPrice = totalPrice;
    if (formData.hasDiscount && discountPercentage > 0) {
      finalPrice = totalPrice - totalPrice * (discountPercentage / 100);
    }

    if (finalPrice !== parseFloat(formData.finalPrice)) {
      setFormData((prev) => ({
        ...prev,
        finalPrice: finalPrice.toFixed(2),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.totalPrice, formData.hasDiscount, formData.discountPercentage]);

  // Auto-calculate real income considering card payment fee (5%)
  useEffect(() => {
    const finalPrice = parseFloat(formData.finalPrice) || 0;
    let realIncome = finalPrice;

    if (formData.cardPayment && finalPrice > 0) {
      realIncome = finalPrice * 0.95; // 5% fee for card payment
    }

    if (realIncome !== parseFloat(formData.realIncome)) {
      setFormData((prev) => ({
        ...prev,
        realIncome: realIncome.toFixed(2),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.finalPrice, formData.cardPayment]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});
    setLoading(true);

    try {
      // Validate form data with Zod
      const validatedData = saleSchema.parse(formData);

      const payload = {
        date: new Date(validatedData.date).toISOString(),
        client: validatedData.client,
        code: validatedData.code,
        description: validatedData.description,
        units: parseInt(validatedData.units),
        unitPrice: parseFloat(validatedData.unitPrice),
        totalPrice: parseFloat(validatedData.totalPrice),
        hasDiscount: validatedData.hasDiscount,
        discountPercentage: validatedData.discountPercentage
          ? parseFloat(validatedData.discountPercentage)
          : null,
        finalPrice: parseFloat(validatedData.finalPrice),
        cardPayment: validatedData.cardPayment,
        realIncome: parseFloat(validatedData.realIncome),
        paymentStatus: validatedData.paymentStatus,
        paymentMethod: validatedData.paymentMethod,
        account: validatedData.account,
        seller: validatedData.seller,
        category: validatedData.category,
        subCategory: validatedData.subCategory || null,
        provider: validatedData.provider,
        providerCost: parseFloat(validatedData.providerCost),
        providerPaymentStatus: validatedData.providerPaymentStatus,
        comments: validatedData.comments || null,
        ...(isEditMode && { id: item.id }),
      };

      const response = await fetch("/api/sales", {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to ${isEditMode ? "update" : "create"} sale`
        );
      }

      setSuccess(`Sale ${isEditMode ? "updated" : "created"} successfully!`);

      // Close modal and refresh data
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const errors: Record<string, string> = {};
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFieldErrors(errors);
        setError("Please fix the validation errors below");
      } else {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditMode,
    formData,
    loading,
    error,
    success,
    fieldErrors,
    handleChange,
    handleSubmit,
  };
}
