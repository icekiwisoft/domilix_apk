import { client } from './api.client';

/** Response of POST /uploads (backend uploads.controller.ts, website services/uploadApi.ts). */
export interface UploadedFile {
  id: string;
  type: string;
  purpose: string;
  mime_type: string;
  size?: number | null;
  original_name?: string;
}

/** Name and MIME type of a local image picked from the gallery. */
export function localImagePart(uri: string, fallbackName = 'photo.jpg') {
  const name = uri.split('/').pop() ?? fallbackName;
  const match = /\.(\w+)$/.exec(name);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  return { uri, name, type };
}

export const UploadsService = {
  /**
   * Uploads one local file to object storage (POST /uploads, multipart
   * `type` + `file`), as the website does before attaching medias to a
   * listing by id. `media` files become ad medias (purpose ad_media).
   */
  upload: (uri: string, type: 'media' | 'avatar' = 'media') => {
    const form = new FormData();
    form.append('type', type);
    form.append('file', localImagePart(uri) as unknown as Blob);
    return client
      .post<UploadedFile>('/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data);
  },
};
