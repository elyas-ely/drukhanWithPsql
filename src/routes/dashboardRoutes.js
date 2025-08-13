import express from 'express'
import {
  DSgetAllUsers,
  DSgetSearchUsers,
} from '../controllers/dashboardController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', DSgetAllUsers)
router.get('/search', DSgetSearchUsers)

export default router
