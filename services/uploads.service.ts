import { client } from './api.client';
import type { UploadResponse, UploadType } from '@/types/verification';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}

// A listing photo or video picked on the device.
export interface PickedMedia extends PickedFile {
  isVideo: boolean;
}

export const UploadsService = {
  // POST /uploads — one file per call; the backend validates the real file
  // signature (images, videos for `media`, plus PDF for the student documents)
  // and returns a media id that other endpoints reference.
  upload: (type: UploadType, file: PickedFile, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
    } as unknown as Blob);
    return client
      .post<UploadResponse>('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Videos can take a while on mobile data.
        timeout: 5 * 60_000,
        onUploadProgress: (event) => {
          if (!onProgress) return;
          const total = event.total || 1;
          onProgress(Math.round((Math.min(event.loaded, total) / total) * 100));
        },
      })
      .then((r) => r.data);
  },
};
