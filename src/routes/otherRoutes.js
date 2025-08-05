import express from 'express'
import {
  getAllBanners,
  getAllNotifications,
  getAppVersion,
} from '../controllers/otherController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/banners', getAllBanners)
router.get('/notifications', getAllNotifications)
router.get('/version', getAppVersion)

export default router
