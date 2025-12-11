import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().optional(),
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
  parking: z.boolean().optional(),
  acceptCards: z.boolean().optional(),
  acceptCash: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  freeWifi: z.boolean().optional(),
  whatsappReminders: z.boolean().optional(),
  whatsappCredits: z.boolean().optional(),
  whatsappChatBot: z.boolean().optional(),
  logo: z.any().optional(),
  language: z.string().optional(),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

