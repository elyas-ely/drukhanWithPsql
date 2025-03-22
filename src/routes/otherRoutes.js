import express from 'express'
// import upload from '../middlewares/uploadMiddleware.js'
import {
  getAllBanners,
  getAllNotifications,
} from '../controllers/otherController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/banners', getAllBanners)
router.get('/notifications', getAllNotifications)

// =======================================
// ============== POST ROUTES ============
// =======================================
// router.post('/', upload.single('file'), createPost)

// =======================================
// ============== PUT ROUTES =============
// =======================================
// router.put('/:postId', upload.single('file'), updatePost)
// router.put('/saves/:postId', updateSave)
// router.put('/likes/:postId', updateLike)
// router.put('/viewed/:postId', updateViewedPosts)

// =======================================
// ============== DELETE ROUTES ==========
// =======================================
// router.delete('/:postId', deletePost)

export default router
