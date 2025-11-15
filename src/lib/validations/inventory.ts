import { z } from "zod";

export const inventorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Stock must be a non-negative number",
    }),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a non-negative number",
    }),
  categoryId: z.string().min(1, "Category is required"),
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be less than 50 characters"),
  providerCost: z
    .string()
    .min(1, "Provider cost is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Provider cost must be a non-negative number",
    }),
});

export type InventoryFormData = z.infer<typeof inventorySchema>;
