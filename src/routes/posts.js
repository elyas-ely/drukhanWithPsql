import express from 'express'
import { uploadPost, handleUploadError } from '../middlewares/upload.js'
import { createPost, updatePost } from '../controllers/posts.js'

const router = express.Router()

// Create a new post with multiple images
router.post('/', uploadPost, handleUploadError, createPost)

// Update a post with multiple images
router.put('/:id', uploadPost, handleUploadError, updatePost)

export default router
