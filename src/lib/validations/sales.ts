import { z } from "zod";

export const saleSchema = z.object({
  date: z.string().min(1, "Date is required"),
  client: z
    .string()
    .min(1, "Client name is required")
    .max(100, "Client name must be less than 100 characters"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  units: z
    .string()
    .min(1, "Units is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: "Units must be at least 1",
    }),
  unitPrice: z
    .string()
    .min(1, "Unit price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Unit price must be a non-negative number",
    }),
  totalPrice: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Total price must be a non-negative number",
    }),
  hasDiscount: z.boolean(),
  discountPercentage: z.string().refine(
    (val) => {
      if (val === "") return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    },
    {
      message: "Discount percentage must be between 0 and 100",
    }
  ),
  finalPrice: z
    .string()
    .min(1, "Final price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Final price must be a non-negative number",
    }),
  cardPayment: z.boolean(),
  realIncome: z
    .string()
    .min(1, "Real income is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Real income must be a non-negative number",
    }),
  paymentStatus: z.string().min(1, "Payment status is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  account: z.string().min(1, "Account is required"),
  seller: z
    .string()
    .min(1, "Seller name is required")
    .max(100, "Seller name must be less than 100 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be less than 100 characters"),
  subCategory: z
    .string()
    .max(100, "Sub category must be less than 100 characters")
    .optional(),
  provider: z
    .string()
    .min(1, "Provider name is required")
    .max(100, "Provider name must be less than 100 characters"),
  providerCost: z
    .string()
    .min(1, "Provider cost is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Provider cost must be a non-negative number",
    }),
  providerPaymentStatus: z
    .string()
    .min(1, "Provider payment status is required"),
  comments: z
    .string()
    .max(1000, "Comments must be less than 1000 characters")
    .optional(),
});

export type SaleFormData = z.infer<typeof saleSchema>;
