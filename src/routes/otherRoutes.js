import express from 'express'
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

export default router
