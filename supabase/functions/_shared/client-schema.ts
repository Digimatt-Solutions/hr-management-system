import { z } from "npm:zod@3.25.76";

export function normalizePhone(value: string) {
  const clean = value.replace(/[\s()-]/g, "");
  if (/^0[17]\d{8}$/.test(clean)) return `+254${clean.slice(1)}`;
  if (/^254[17]\d{8}$/.test(clean)) return `+${clean}`;
  return clean;
}
export const membershipPlans = [
  "Daily",
  "Weekly",
  "Monthly",
  "Dedicated Desk",
  "Meeting room",
] as const;
export const workingHours = [
  "Morning",
  "Afternoon",
  "Evening",
  "Flexible",
] as const;
const required = z
  .string()
  .trim()
  .min(2, "Enter at least two characters")
  .max(150);
const optional = z.string().trim().max(500).default("");
const phone = z
  .string()
  .transform(normalizePhone)
  .pipe(
    z
      .string()
      .regex(
        /^\+[1-9]\d{7,14}$/,
        "Enter a valid phone number with country code",
      ),
  );
const optionalPhone = z
  .string()
  .trim()
  .default("")
  .transform(normalizePhone)
  .pipe(
    z
      .string()
      .regex(
        /^(\+[1-9]\d{7,14})?$/,
        "Enter a valid phone number with country code",
      ),
  );
const isPlainDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !Number.isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const optionalDate = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || isPlainDate(v), "Choose a valid date");
export const clientSchema = z.object({
  full_name: required,
  phone,
  email: z.string().trim().email("Enter a valid email").max(255),
  residential_address: z.string().trim().max(1000).default(""),
  company_name: optional,
  industry: optional,
  job_title: optional,
  website: z
    .union([
      z.literal(""),
      z
        .string()
        .url()
        .refine((v) => /^https?:\/\//.test(v), "Use an https:// website"),
    ])
    .default(""),
  facebook: optional,
  linkedin: optional,
  social_other: optional,
  membership_plans: z.array(z.enum(membershipPlans)).max(5).default([]),
  working_hours: z.array(z.enum(workingHours)).max(4).default([]),
  coworking_date: optionalDate,
  special_requirements: z.string().trim().max(2000).default(""),
  emergency_name: optional,
  emergency_relationship: optional,
  emergency_phone: optionalPhone,
  comments: z.string().trim().max(2000).default(""),
  signature: optional,
  signature_date: optionalDate,
  privacy_agreed: z.literal(true, {
    errorMap: () => ({ message: "Please acknowledge the privacy notice" }),
  }),
  signature_confirmed: z.literal(true, {
    errorMap: () => ({ message: "Please confirm your signature" }),
  }),
});
export type ClientValues = Required<z.infer<typeof clientSchema>>;
export function toClientPayload(values: ClientValues): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...values };
  if (!payload.coworking_date) delete payload.coworking_date;
  if (!payload.signature_date) delete payload.signature_date;
  return payload;
}
