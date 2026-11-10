import cron from 'node-cron';
import { Post, CreatePostDto } from '../types/index.js';
import crypto from 'crypto';

class SchedulerService {
  private posts: Map<string, Post> = new Map();
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.seedSamplePosts();
  }

  private seedSamplePosts(): void {
    const samplePost: Post = {
      id: crypto.randomUUID(),
      content: '🚀 Welcome to Multi-Media Post Scheduler! Easily compose, preview, and queue your posts across platforms.',
      mediaUrls: [],
      platforms: ['twitter', 'linkedin'],
      scheduledFor: new Date(Date.now() + 3600000).toISOString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(samplePost.id, samplePost);
  }

  public start(): void {
    // Run every minute to check for due scheduled posts
    this.cronJob = cron.schedule('* * * * *', () => {
      this.checkAndPublishDuePosts();
    });
    console.log('[SchedulerService] Background scheduler running (every minute).');
  }

  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('[SchedulerService] Background scheduler stopped.');
    }
  }

  private checkAndPublishDuePosts(): void {
    const now = new Date();
    for (const post of this.posts.values()) {
      if (post.status === 'scheduled' && new Date(post.scheduledFor) <= now) {
        post.status = 'published';
        post.updatedAt = new Date().toISOString();
        console.log(`[SchedulerService] Successfully published scheduled post ${post.id} to [${post.platforms.join(', ')}]`);
      }
    }
  }

  public getAllPosts(): Post[] {
    return Array.from(this.posts.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPostById(id: string): Post | undefined {
    return this.posts.get(id);
  }

  public createPost(dto: CreatePostDto): Post {
    const newPost: Post = {
      id: crypto.randomUUID(),
      content: dto.content,
      mediaUrls: dto.mediaUrls || [],
      platforms: dto.platforms,
      scheduledFor: dto.scheduledFor,
      status: new Date(dto.scheduledFor) <= new Date() ? 'published' : 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  public deletePost(id: string): boolean {
    return this.posts.delete(id);
  }
}

export const schedulerService = new SchedulerService();
