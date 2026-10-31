ALTER TABLE public.clients
  ALTER COLUMN residential_address SET DEFAULT '',
  ALTER COLUMN company_name SET DEFAULT '',
  ALTER COLUMN industry SET DEFAULT '',
  ALTER COLUMN emergency_name SET DEFAULT '',
  ALTER COLUMN emergency_relationship SET DEFAULT '',
  ALTER COLUMN emergency_phone SET DEFAULT '',
  ALTER COLUMN signature SET DEFAULT '',
  ALTER COLUMN coworking_date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN signature_date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN membership_plans SET DEFAULT '{}',
  ALTER COLUMN working_hours SET DEFAULT '{}';

ALTER TABLE public.clients DROP CONSTRAINT clients_emergency_phone_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_emergency_phone_check CHECK (emergency_phone = '' OR emergency_phone ~ '^\+[1-9][0-9]{7,14}$');

ALTER TABLE public.clients DROP CONSTRAINT clients_membership_plans_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_membership_plans_check CHECK (membership_plans <@ ARRAY['Daily','Weekly','Monthly','Dedicated Desk','Meeting room']::text[]);

ALTER TABLE public.clients DROP CONSTRAINT clients_working_hours_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_working_hours_check CHECK (working_hours <@ ARRAY['Morning','Afternoon','Evening','Flexible']::text[]);

COMMENT ON TABLE public.clients IS 'Client biodata. Only full_name, phone and email are mandatory; every other column may be blank.';