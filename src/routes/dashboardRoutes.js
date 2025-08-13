import express from 'express'
import {
  DSdeleteLikes,
  DSgetAllUsers,
  DSgetSearchUsers,
  DSgivePostLikes,
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

router.put('/add-likes/:postId', DSgivePostLikes)
router.delete('/delete-likes/:postId', DSdeleteLikes)

export default router
