export function smsPhone(raw:string){let p=raw.replace(/\D/g,'');if(/^0[17]\d{8}$/.test(p))p='254'+p.slice(1);return /^254[17]\d{8}$/.test(p)?p:null;}
export function uniqueSmsPhones(rows:{phone:string}[]) { return Array.from(new Set(rows.map(row=>smsPhone(row.phone)).filter((phone):phone is string=>phone!==null))); }
export function validAudience(value:{audience:string;client_ids:string[];since?:string;until?:string}) {
  if(value.audience==='selected')return value.client_ids.length>0;
  if(value.audience==='recent')return !!value.since&&!!value.until&&value.since<=value.until;
  return value.audience==='all';
}