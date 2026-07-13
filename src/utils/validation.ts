import { z } from "zod";

const trimmedText = z.string().trim();

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = signInSchema.extend({
  username: trimmedText.min(2, "Username must have at least 2 characters.").max(40),
  password: z.string().min(8, "Password must have at least 8 characters.").max(128),
});

export const albumSchema = z.object({
  name: trimmedText.min(1, "Album name is required.").max(80),
});

export const photoMetadataSchema = z.object({
  caption: trimmedText.max(500).default(""),
  capturedAt: z.coerce.date(),
  albumId: z.string().uuid().nullable().optional(),
  tags: z.array(trimmedText.min(1).max(40)).max(20).default([]),
});

export const profileSchema = z.object({
  username: trimmedText.min(2).max(40),
  avatarUrl: z.string().trim().url().nullable().optional(),
});

export const tagSchema = z.object({
  name: trimmedText.min(1).max(40),
});

export const searchSchema = z.object({
  query: trimmedText.max(100),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type AlbumValues = z.infer<typeof albumSchema>;
export type PhotoMetadataValues = z.infer<typeof photoMetadataSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
