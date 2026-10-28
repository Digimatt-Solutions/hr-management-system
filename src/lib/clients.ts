import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

export type ClientRecord = Database['public']['Tables']['clients']['Row'];
export const membershipPlans = ['Daily', 'Weekly', 'Monthly', 'Dedicated Desk', 'Meeting room'] as const;
export const workingHours = ['Morning', 'Afternoon', 'Evening', 'Flexible'] as const;
export function normalizePhone(value: string) {
  const clean = value.replace(/[\s()-]/g, '');
  if (/^0[17]\d{8}$/.test(clean)) return `+254${clean.slice(1)}`;
  if (/^254[17]\d{8}$/.test(clean)) return `+${clean}`;
  return clean;
}
const required = z.string().trim().min(2, 'Enter at least two characters').max(150);
const optional = z.string().trim().max(500).default('');
const phone = z.string().transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Enter a valid phone number with country code'));
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date').refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v, 'Choose a valid date');
export const clientSchema = z.object({
  full_name: required, phone, email: z.string().trim().email('Enter a valid email').max(255),
  residential_address: z.string().trim().min(3).max(1000), company_name: required, industry: required,
  job_title: optional, website: z.union([z.literal(''), z.string().url().refine(v => /^https?:\/\//.test(v), 'Use an https:// website')]).default(''),
  facebook: optional, linkedin: optional, social_other: optional,
  membership_plans: z.array(z.enum(membershipPlans)).min(1, 'Choose a membership plan').max(5),
  working_hours: z.array(z.enum(workingHours)).min(1, 'Choose preferred working hours').max(4),
  coworking_date: date, special_requirements: z.string().trim().max(2000).default(''),
  emergency_name: required, emergency_relationship: required, emergency_phone: phone,
  comments: z.string().trim().max(2000).default(''), signature: required, signature_date: date,
  privacy_agreed: z.literal(true, { errorMap: () => ({message: 'Please acknowledge the privacy notice'}) }),
  signature_confirmed: z.literal(true, { errorMap: () => ({message: 'Please confirm your signature'}) }),
});
export type ClientValues = Required<z.infer<typeof clientSchema>>;
export const emptyClient = (): ClientValues => ({ full_name:'', phone:'', email:'', residential_address:'', company_name:'', industry:'', job_title:'', website:'', facebook:'', linkedin:'', social_other:'', membership_plans:[], working_hours:[], coworking_date: new Date().toISOString().slice(0,10), special_requirements:'', emergency_name:'', emergency_relationship:'', emergency_phone:'', comments:'', signature:'', signature_date: new Date().toISOString().slice(0,10), privacy_agreed: true, signature_confirmed: true });