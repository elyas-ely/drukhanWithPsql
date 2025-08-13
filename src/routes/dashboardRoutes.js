import express from 'express'
import {
  DSgetAllUsers,
  DSgetSearchUsers,
  DSpostToPopular,
  DSuserToSeller,
} from '../controllers/dashboardController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', DSgetAllUsers)
router.get('/search', DSgetSearchUsers)
router.post('/popular', DSpostToPopular)
router.post('/user', DSuserToSeller)

export default router
