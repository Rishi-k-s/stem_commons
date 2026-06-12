import { z } from "zod";
import { RESOURCE_TYPES } from "../data/resources";

const urlOrBlank = z
  .string()
  .refine(
    (v) => !v || v === "N/A" || /^https?:\/\/.+/.test(v),
    "Enter a valid URL (https://...) or leave blank"
  );

export const resourceSubmissionSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(RESOURCE_TYPES as [string, ...string[]]),
    description: z.string().max(500, "Maximum 500 characters").optional().default(""),
    facilities: z.array(z.string()).optional().default([]),
    website: urlOrBlank.optional().default(""),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    address: z.string().optional().default(""),
    lat: z.number(),
    lng: z.number(),
    poc_name: z.string().min(2, "Contact name is required"),
    designation: z.string().min(1, "Designation is required"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().optional().default(""),
    submitted_by: z.string().min(2, "Your name is required"),
  })
  .refine((d) => !(d.lat === 0 && d.lng === 0), {
    message: "Please pin the location on the map",
    path: ["lat"],
  });

export type FieldErrors = Record<string, string>;

export function parseSubmission(
  data: unknown
): { ok: true } | { ok: false; errors: FieldErrors } {
  const result = resourceSubmissionSchema.safeParse(data);
  if (result.success) return { ok: true };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
