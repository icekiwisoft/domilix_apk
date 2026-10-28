import type { PickedFile } from '@/services/uploads.service';

// Builds an upload descriptor from a local image URI (e.g. from the image picker).
export function uriToPickedFile(uri: string): PickedFile {
  const name = uri.split('/').pop() ?? 'photo.jpg';
  const ext = /\.(\w+)$/.exec(name)?.[1]?.toLowerCase();
  const mimeType = !ext || ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return { uri, name, mimeType };
}
