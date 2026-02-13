
import { createClient } from '@supabase/supabase-js';

// 클라이언트와 서버 공용 URL
const supabaseUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) || '';
// 서버 전용 Service Role Key (클라이언트에 노출되지 않도록 주의)
const supabaseServiceKey = (typeof process !== 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY) || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Public URL 생성 유틸리티
 */
export const getPublicUrl = (path: string, bucket: string = 'news-images') => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
