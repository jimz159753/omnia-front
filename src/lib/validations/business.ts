import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  website: z.string().optional(),
  rfc: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  parking: z.boolean(),
  acceptCards: z.boolean(),
  acceptCash: z.boolean(),
  petFriendly: z.boolean(),
  freeWifi: z.boolean(),
  whatsappReminders: z.boolean(),
  whatsappCredits: z.boolean(),
  whatsappChatBot: z.boolean(),
  logo: z.any().optional(),
  language: z.string().optional(),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

