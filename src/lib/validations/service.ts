import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Price must be a non-negative number",
    }),
  commission: z
    .string()
    .min(1, "Commission is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Commission must be a non-negative number",
    }),
  duration: z
    .string()
    .min(1, "Duration is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Duration must be a positive number (minutes)",
    }),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().min(1, "Subcategory is required"),
  image: z.string().optional(),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;

