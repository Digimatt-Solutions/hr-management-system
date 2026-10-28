import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { clientSchema } from '../_shared/client-schema.ts';

Deno.serve(async (req) => {
  const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', {headers: corsHeaders});
  if (req.method !== 'POST') return respond({error: 'Method not allowed'}, 405);
  try {
    const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    let ownerId: string | null = null;
    const auth = req.headers.get('Authorization');
    if (auth) {
      const match = auth.match(/^Bearer (.+)$/i);
      if (!match) return respond({error: 'Invalid session'}, 401);
      const {data, error} = await db.auth.getUser(match[1]);
      if (error || !data.user) return respond({error: 'Invalid session. Please sign in again.'}, 401);
      ownerId = data.user.id;
    }
    const input = await req.json();
    const parsed = clientSchema.safeParse(input);
    if (!parsed.success) return respond({error: 'Check your registration details', fields: parsed.error.flatten().fieldErrors}, 400);
    const {data, error} = await db.from('clients').insert({...parsed.data, owner_id: ownerId, source: 'website'}).select('id').single();
    if (error) return respond({error: 'Could not save registration. Please try again.'}, 500);
    return respond({id: data.id, success: true}, 201);
  } catch { return respond({error: 'Invalid registration request'}, 400); }
});