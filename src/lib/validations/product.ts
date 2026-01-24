import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stock must be a non-negative number",
    }),
  minStock: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => val === "" || val === undefined || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Min stock must be a non-negative number",
    }),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a non-negative number",
    }),
  categoryId: z.string().optional().or(z.literal("")),
  subCategoryId: z.string().optional().or(z.literal("")),
  providerId: z.string().min(1, "Provider is required"),
  sku: z
    .string()
    .max(50, "SKU must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  cost: z
    .string()
    .min(1, "Cost is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Cost must be a non-negative number",
    }),
  image: z.string().optional().or(z.literal("")),
});

export type ProductFormData = z.infer<typeof productSchema>;

