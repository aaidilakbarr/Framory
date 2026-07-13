import * as ImagePicker from "expo-image-picker";
import { assertSupportedImage, MAX_AVATAR_IMAGE_BYTES } from "@/utils/files";

export type PickedImage = {
  source: string;
  mimeType: string;
  fileName?: string;
  size?: number;
};

export async function pickImage(maxBytes?: number): Promise<PickedImage | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
    selectionLimit: 1,
    orderedSelection: true,
  });

  if (result.canceled || !result.assets.length) return null;

  const asset = result.assets[0];
  assertSupportedImage(asset.mimeType ?? "image/jpeg", asset.fileSize, maxBytes);

  return {
    source: asset.uri,
    mimeType: asset.mimeType ?? "image/jpeg",
    fileName: asset.fileName ?? undefined,
    size: asset.fileSize ?? undefined,
  };
}

export async function pickAvatarImage(): Promise<PickedImage | null> {
  return pickImage(MAX_AVATAR_IMAGE_BYTES);
}

export async function captureImage(maxBytes?: number): Promise<PickedImage | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 1,
  });

  if (result.canceled || !result.assets.length) return null;

  const asset = result.assets[0];
  assertSupportedImage(asset.mimeType ?? "image/jpeg", asset.fileSize, maxBytes);

  return {
    source: asset.uri,
    mimeType: asset.mimeType ?? "image/jpeg",
    fileName: asset.fileName ?? undefined,
    size: asset.fileSize ?? undefined,
  };
}
