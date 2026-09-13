import type { ImagePickerErrorResult, ImagePickerOptions, ImagePickerResult } from 'expo-image-picker';
import { MAX_AVATAR_BYTES, validAvatar } from './profile';

export const nativeProfilePhotoOptions: ImagePickerOptions = {
  mediaTypes: ['images'], allowsMultipleSelection: false, allowsEditing: true,
  aspect: [1, 1], quality: 0.35, base64: true, exif: false,
};

function imageMime(base64: string): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  // RIFF also describes other formats. Confirm the WEBP tag in its header.
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  for (let offset = 0; offset < Math.min(base64.length, 16); offset += 4) {
    const values = Array.from(base64.slice(offset, offset + 4), char => alphabet.indexOf(char));
    if (values.length !== 4 || values.some(value => value < 0)) return null;
    const packed = (values[0] << 18) | (values[1] << 12) | (values[2] << 6) | values[3];
    bytes.push((packed >> 16) & 255, (packed >> 8) & 255, packed & 255);
  }
  return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP' ? 'image/webp' : null;
}

/** Keeps image bytes only; discards the picker's URI, name, and EXIF fields. */
export function avatarFromPickerResult(result: ImagePickerResult | ImagePickerErrorResult | null): string | null {
  if (!result) return null;
  if ('code' in result) throw new Error('The photo picker could not finish. Please try choosing a photo again.');
  if (result.canceled) return null;
  const asset = result.assets?.[0];
  if (!asset || asset.type && asset.type !== 'image' || typeof asset.base64 !== 'string' || !asset.base64) {
    throw new Error('This photo could not be read. Try choosing a JPEG, PNG, or WebP image.');
  }
  // fileSize may describe the original file rather than its cropped/re-encoded
  // bytes. Enforce the persisted-data limit on the actual returned data instead.
  if (asset.base64.length > Math.ceil(MAX_AVATAR_BYTES / 3) * 4) {
    throw new Error('Choose a smaller photo or crop it more closely. The selected photo must be no larger than 600 KB after compression.');
  }
  if (!validAvatar(`data:image/jpeg;base64,${asset.base64}`)) {
    throw new Error('This photo contains invalid image data. Try another photo.');
  }
  const mime = imageMime(asset.base64);
  if (!mime) throw new Error('Choose a JPEG, PNG, or WebP photo. This returned image format is not supported.');
  return `data:${mime};base64,${asset.base64}`;
}
