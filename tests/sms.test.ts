import {describe,it,expect} from 'bun:test';
import {smsPhone,uniqueSmsPhones,validAudience} from '../supabase/functions/_shared/sms-selection';
describe('Kazini service SMS',()=>{
 it('normalizes Kenyan mobile numbers and rejects unsupported numbers',()=>{expect(smsPhone('0700 000 001')).toBe('254700000001');expect(smsPhone('+254100000001')).toBe('254100000001');expect(smsPhone('+15551234567')).toBe(null);});
 it('removes duplicate and invalid recipients',()=>{expect(uniqueSmsPhones([{phone:'0700000001'},{phone:'+254700000001'},{phone:'invalid'}])).toEqual(['254700000001']);});
 it('supports all, recent and selected client audiences',()=>{expect(validAudience({audience:'all',client_ids:[]})).toBe(true);expect(validAudience({audience:'selected',client_ids:[]})).toBe(false);expect(validAudience({audience:'selected',client_ids:['client']})).toBe(true);expect(validAudience({audience:'recent',client_ids:[],since:'2026-10-01',until:'2026-10-28'})).toBe(true);expect(validAudience({audience:'recent',client_ids:[],since:'2026-10-28',until:'2026-10-01'})).toBe(false);});
});