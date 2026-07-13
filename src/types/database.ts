export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_path: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_path?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          avatar_path?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      albums: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cover_photo_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          cover_photo_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          cover_photo_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "albums_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "albums_cover_photo_owner_fkey";
            columns: ["cover_photo_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          user_id: string;
          album_id: string | null;
          storage_path: string;
          caption: string;
          captured_at: string;
          uploaded_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          album_id?: string | null;
          storage_path: string;
          caption?: string;
          captured_at: string;
          uploaded_at?: string;
          updated_at?: string;
        };
        Update: {
          album_id?: string | null;
          caption?: string;
          captured_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "photos_album_owner_fkey";
            columns: ["album_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "albums";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      photo_tags: {
        Row: {
          photo_id: string;
          tag_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          photo_id: string;
          tag_id: string;
          user_id?: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "photo_tags_photo_owner_fkey";
            columns: ["photo_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "photo_tags_tag_owner_fkey";
            columns: ["tag_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      favorites: {
        Row: {
          user_id: string;
          photo_id: string;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          photo_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "favorites_photo_owner_fkey";
            columns: ["photo_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "photos";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PublicSchema = Database["public"];
export type TableName = keyof PublicSchema["Tables"];
export type TableRow<T extends TableName> = PublicSchema["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = PublicSchema["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = PublicSchema["Tables"][T]["Update"];

export type Profile = TableRow<"profiles">;
export type Album = TableRow<"albums">;
export type Photo = TableRow<"photos">;
export type Tag = TableRow<"tags">;
export type Favorite = TableRow<"favorites">;

export type AlbumSummary = Album & {
  cover_url: string | null;
  photo_count: number;
};

export type PhotoWithRelations = Photo & {
  album: Pick<Album, "id" | "name"> | null;
  tags: Tag[];
  is_favorite: boolean;
  image_url: string | null;
};

export type ProfileStats = {
  totalAlbums: number;
  totalPhotos: number;
  totalFavorites: number;
};

export type ProfileWithAvatar = Profile & {
  avatar_display_url: string | null;
};

export type PageResult<T> = {
  items: T[];
  nextPage: number | undefined;
  total: number | null;
};
