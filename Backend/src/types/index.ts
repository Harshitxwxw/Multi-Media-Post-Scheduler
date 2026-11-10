export type Platform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'youtube';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  platforms: Platform[];
  scheduledFor: string; // ISO 8601 string
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  content: string;
  mediaUrls?: string[];
  platforms: Platform[];
  scheduledFor: string;
}

export interface UpdatePostDto {
  content?: string;
  mediaUrls?: string[];
  platforms?: Platform[];
  scheduledFor?: string;
  status?: PostStatus;
}
