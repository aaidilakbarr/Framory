const MIME_EXTENSION: Record<string, string> = {
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_IMAGE_MIME_TYPES = Object.keys(MIME_EXTENSION);
export const MAX_MEMORY_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_AVATAR_IMAGE_BYTES = 5 * 1024 * 1024;

export type UploadableImage = Blob | ArrayBuffer | Uint8Array | string;

export function extensionForImage(mimeType: string, fileName?: string) {
  const fromMime = MIME_EXTENSION[mimeType.toLowerCase()];
  if (fromMime) return fromMime;

  const fromName = fileName?.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fromName && fromName.length <= 5 ? fromName : "jpg";
}

export function assertSupportedImage(mimeType: string, size?: number, maxBytes = MAX_MEMORY_IMAGE_BYTES) {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType.toLowerCase())) {
    throw new Error("Choose a JPEG, PNG, WebP, HEIC, or HEIF image.");
  }

  if (typeof size === "number" && size > maxBytes) {
    throw new Error(`Image must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  }
}

export async function toUploadBody(source: UploadableImage): Promise<Blob | ArrayBuffer | Uint8Array> {
  if (typeof source !== "string") return source;

  const response = await fetch(source);
  if (!response.ok) throw new Error("The selected image could not be read.");
  return response.arrayBuffer();
}

export function makeObjectId() {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
