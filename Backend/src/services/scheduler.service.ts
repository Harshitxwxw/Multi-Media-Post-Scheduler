import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Post, CreatePostDto, UpdatePostDto } from '../types/index.js';

class SchedulerService {
  private posts: Map<string, Post> = new Map();
  private cronJob: cron.ScheduledTask | null = null;
  private dataDir = path.resolve(process.cwd(), 'data');
  private dataFilePath = path.join(this.dataDir, 'posts.json');

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const list: Post[] = JSON.parse(raw);
        for (const post of list) {
          this.posts.set(post.id, post);
        }
        console.log(`[SchedulerService] Loaded ${this.posts.size} posts from persistence.`);
      } else {
        this.seedSamplePosts();
        this.saveToDisk();
      }
    } catch (err) {
      console.error('[SchedulerService] Error initializing post persistence:', err);
      this.seedSamplePosts();
    }
  }

  private saveToDisk(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const data = Array.from(this.posts.values());
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SchedulerService] Failed to save posts to disk:', err);
    }
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
    let hasChanges = false;

    for (const post of this.posts.values()) {
      if (post.status === 'scheduled' && new Date(post.scheduledFor) <= now) {
        post.status = 'published';
        post.updatedAt = new Date().toISOString();
        hasChanges = true;
        console.log(`[SchedulerService] Automatically published scheduled post "${post.id}" to [${post.platforms.join(', ')}]`);
      }
    }

    if (hasChanges) {
      this.saveToDisk();
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
    this.saveToDisk();
    return newPost;
  }

  public updatePost(id: string, updates: UpdatePostDto): Post | null {
    const post = this.posts.get(id);
    if (!post) return null;

    if (updates.content !== undefined) post.content = updates.content;
    if (updates.mediaUrls !== undefined) post.mediaUrls = updates.mediaUrls;
    if (updates.platforms !== undefined) post.platforms = updates.platforms;
    if (updates.scheduledFor !== undefined) {
      post.scheduledFor = updates.scheduledFor;
      if (post.status !== 'published') {
        post.status = new Date(updates.scheduledFor) <= new Date() ? 'published' : 'scheduled';
      }
    }
    if (updates.status !== undefined) post.status = updates.status;

    post.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return post;
  }

  public publishNow(id: string): Post | null {
    const post = this.posts.get(id);
    if (!post) return null;

    post.status = 'published';
    post.updatedAt = new Date().toISOString();
    this.saveToDisk();
    console.log(`[SchedulerService] Manually published post "${id}" to [${post.platforms.join(', ')}]`);
    return post;
  }

  public deletePost(id: string): boolean {
    const removed = this.posts.delete(id);
    if (removed) {
      this.saveToDisk();
    }
    return removed;
  }
}

export const schedulerService = new SchedulerService();
