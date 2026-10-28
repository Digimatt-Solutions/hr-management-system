import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { smsSchema } from '../_shared/sms-audience.ts';
import { uniqueSmsPhones } from '../_shared/sms-selection.ts';

Deno.serve(async(req)=>{
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
  const db=createClient(Deno.env.get('SUPABASE_URL')??'',Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'');
  const token=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];if(!token)return reply({error:'Sign in required'},401);
  const {data:auth,error:authError}=await db.auth.getUser(token);if(authError||!auth.user)return reply({error:'Invalid session'},401);
  const {data:role,error:roleError}=await db.from('user_roles').select('role').eq('user_id',auth.user.id).eq('role','admin').maybeSingle();if(roleError||!role)return reply({error:'Administrator access required'},403);
  const parsed=smsSchema.safeParse(await req.json());if(!parsed.success)return reply({error:parsed.error.issues[0]?.message??'Invalid message'},400);
  const input=parsed.data;let rows:{phone:string}[]=[];let offset=0;
  while(true){let query=db.from('clients').select('phone').order('id').range(offset,offset+999);if(input.audience==='selected')query=query.in('id',input.client_ids);if(input.audience==='recent')query=query.gte('created_at',input.since).lte('created_at',input.until);const {data,error}=await query;if(error)return reply({error:'Could not resolve client audience'},500);rows.push(...(data??[]));if((data?.length??0)<1000)break;offset+=1000;}
  const phones=uniqueSmsPhones(rows);const skipped=rows.length-phones.length;
  if(input.preview)return reply({total:phones.length,skipped,clients:rows.length});
  if(!phones.length)return reply({error:'No supported Kenyan mobile numbers in this audience'},400);
  const endpoint=Deno.env.get('SMS_API_ENDPOINT');const username=Deno.env.get('SMS_USERNAME');const password=Deno.env.get('SMS_PASSWORD');const issn=Deno.env.get('SMS_ISSN');
  if(!endpoint||!username||!password||!issn)return reply({error:'Airtouch configuration is not complete'},503);
  let base:URL;try{base=new URL(endpoint);if(base.protocol!=='https:')return reply({error:'Airtouch requires an HTTPS endpoint'},503);}catch{return reply({error:'Airtouch endpoint configuration is invalid'},503);}
  const {error:createError}=await db.from('sms_broadcasts').insert({id:input.request_id,created_by:auth.user.id,message:input.message,audience:input.audience,total:phones.length,skipped,status:'processing'});if(createError)return reply({error:'This broadcast has already started or could not be recorded. Check history before retrying.'},409);
  let accepted=0,failed=0;
  for(let i=0;i<phones.length;i+=10){await Promise.all(phones.slice(i,i+10).map(async phone=>{try{const url=new URL(base);url.searchParams.set('issn',issn);url.searchParams.set('msisdn',phone);url.searchParams.set('text',input.message);url.searchParams.set('username',username);url.searchParams.set('password',password);const response=await fetch(url,{signal:AbortSignal.timeout(15000),redirect:'error'});const text=await response.text();if(response.ok&&!/\b(error|failed|invalid|insufficient|denied)\b/i.test(text)){accepted++;}else{failed++;}}catch{failed++;}}));await db.from('sms_broadcasts').update({accepted,failed}).eq('id',input.request_id);}
  const {error:logError}=await db.from('sms_broadcasts').update({accepted,failed,status:failed?'completed_with_failures':'completed'}).eq('id',input.request_id);
  return reply({accepted,failed,total:phones.length,skipped,history_saved:!logError,note:'Accepted means an HTTP-success response from Airtouch; delivery is not confirmed.'});
 }catch{return reply({error:'Could not complete broadcast. Check history before retrying.'},500);}
});