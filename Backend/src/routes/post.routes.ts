import { Router } from 'express';
import {
  getPosts,
  createPost,
  updatePost,
  publishPost,
  deletePost,
} from '../controllers/post.controller.js';

const router = Router();

router.get('/', getPosts);
router.post('/', createPost);
router.put('/:id', updatePost);
router.post('/:id/publish', publishPost);
router.delete('/:id', deletePost);

export default router;
