import express from 'express'
import {
  DSchangeCarResquestStatus,
  DSdeleteLikes,
  DSgetAllCarRequests,
  DSgetAllUserCarRequests,
  DSgetAllUsers,
  DSgetCarRequestById,
  DSgetSearchUsers,
  DSgivePostLikes,
  DSpostToPopular,
  DSuserToSeller,
} from '../controllers/dashboardController.js'
import { DSgetAllUserCarRequestsFn } from '../services/dashboardService.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', DSgetAllUsers)
router.get('/search', DSgetSearchUsers)
router.get('/car-requests', DSgetAllCarRequests)
router.get('/car-requests/:id', DSgetCarRequestById)
router.get('/user-requests', DSgetAllUserCarRequests)

router.post('/popular', DSpostToPopular)
router.post('/user', DSuserToSeller)

router.put('/add-likes/:postId', DSgivePostLikes)

router.patch('/car-requests/status/:id', DSchangeCarResquestStatus)

router.delete('/delete-likes/:postId', DSdeleteLikes)

export default router
