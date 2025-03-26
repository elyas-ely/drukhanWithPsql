import express from 'express'

import {
  getAllPosts,
  getPopularPosts,
  getPostById,
  getSavesPost,
  getViewedPost,
  getFilteredPost,
  getPostsByUserId,
  getSearchPosts,
  createPost,
  updatePost,
  deletePost,
  updateSave,
  updateLike,
  updateViewedPosts,
} from '../controllers/postController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', getAllPosts)
router.get('/popular', getPopularPosts)
router.get('/search', getSearchPosts)
router.get('/filtered', getFilteredPost)
router.get('/saves/:userId', getSavesPost)
router.get('/viewed/:userId', getViewedPost)
router.get('/user/:userId', getPostsByUserId)
router.get('/:postId', getPostById)

// =======================================
// ============== POST ROUTES ============
// =======================================

// =======================================
// ============== PUT ROUTES =============
// =======================================
router.put('/:postId', updatePost)
router.put('/saves/:postId', updateSave)
router.put('/likes/:postId', updateLike)
router.put('/viewed/:postId', updateViewedPosts)

// =======================================
// ============== DELETE ROUTES ==========
// =======================================
router.delete('/:postId', deletePost)

export default router
