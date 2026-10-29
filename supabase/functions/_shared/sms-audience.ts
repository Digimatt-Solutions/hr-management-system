import { z } from "npm:zod@3.25.76";
import { validAudience } from "./sms-selection.ts";
export const smsSchema = z
  .object({
    audience: z.enum(["all", "recent", "selected"]),
    message: z.string().trim().min(1).max(480),
    client_ids: z.array(z.string().uuid()).max(10000).default([]),
    since: z.string().datetime().optional(),
    until: z.string().datetime().optional(),
    preview: z.boolean().default(true),
    request_id: z.string().uuid(),
  })
  .refine(
    validAudience,
    "Select clients or choose a valid registration date range",
  );
