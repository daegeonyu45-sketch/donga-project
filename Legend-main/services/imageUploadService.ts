import { supabase } from '../lib/supabase';

interface UploadResponse {
  success: boolean;
  url: string;
  error?: string;
}

/**
 * 외부 이미지 URL을 fetch하여 Supabase Storage('news-images')에 업로드합니다.
 */
export async function uploadExternalImageToStorage(
  externalUrl: string,
  fileName?: string
): Promise<UploadResponse> {
  try {
    // 1. 이미 Supabase Storage URL인 경우 재업로드 방지
    if (externalUrl.includes('.supabase.co/storage/v1/object/public/')) {
      return { success: true, url: externalUrl };
    }

    // 2. 이미지 fetch
    const response = await fetch(externalUrl);
    if (!response.ok) throw new Error(`이미지 fetch 실패: ${response.statusText}`);
    
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.split('/')[1] || 'jpg';
    
    // 3. 파일명 생성 (안전한 경로 구성)
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const finalFileName = fileName 
      ? `${fileName}-${timestamp}.${extension}`
      : `news-${timestamp}-${randomStr}.${extension}`;
    
    // 4. Supabase Storage 업로드
    const { data, error: uploadError } = await supabase.storage
      .from('news-images')
      .upload(finalFileName, blob, {
        contentType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 5. Public URL 생성 및 반환
    const { data: urlData } = supabase.storage
      .from('news-images')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Image upload failed:', error);
    // 실패 시 원본 URL을 반환하여 중단되지 않게 함 (UI에서 onError로 처리)
    return { success: false, url: externalUrl, error: error.message };
  }
}

/**
 * 기사 생성 또는 업데이트 시 이미지 필드를 Storage URL로 변환하는 파이프라인
 */
export async function processArticleImages(articleId: string, images: { [key: string]: string }) {
  const processedImages: { [key: string]: string } = {};
  
  for (const [key, url] of Object.entries(images)) {
    if (url) {
      const result = await uploadExternalImageToStorage(url, `article-${articleId}-${key}`);
      processedImages[key] = result.url;
    }
  }
  
  return processedImages;
}