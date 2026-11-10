import { Request, Response } from 'express';
import { schedulerService } from '../services/scheduler.service.js';
import { CreatePostDto, Platform } from '../types/index.js';

export const getPosts = (_req: Request, res: Response) => {
  try {
    const posts = schedulerService.getAllPosts();
    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve posts', error });
  }
};

export const createPost = (req: Request, res: Response): void => {
  try {
    const { content, mediaUrls, platforms, scheduledFor } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({ success: false, message: 'Content is required' });
      return;
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      res.status(400).json({ success: false, message: 'At least one platform is required' });
      return;
    }

    if (!scheduledFor || isNaN(Date.parse(scheduledFor))) {
      res.status(400).json({ success: false, message: 'Valid scheduledFor ISO date is required' });
      return;
    }

    const dto: CreatePostDto = {
      content,
      mediaUrls: mediaUrls || [],
      platforms: platforms as Platform[],
      scheduledFor,
    };

    const newPost = schedulerService.createPost(dto);
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post', error });
  }
};

export const deletePost = (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const deleted = schedulerService.deletePost(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete post', error });
  }
};
