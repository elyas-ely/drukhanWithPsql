import express from 'express'
import {
  DSchangeCarResquestStatus,
  DScreateBanner,
  DSdeleteCarRequest,
  DSdeleteLikes,
  DSgetAllCarRequests,
  DSgetAllUserCarRequests,
  DSgetAllUsers,
  DSgetCarRequestById,
  DSgetSearchUsers,
  DSgivePostLikes,
  DSpostToPopular,
  DSupdateCarRequest,
  DSuserToSeller,
} from '../controllers/dashboardController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', DSgetAllUsers)
router.get('/search', DSgetSearchUsers)
router.get('/car-requests', DSgetAllCarRequests)
router.get('/car-requests/:id', DSgetCarRequestById)
router.get('/user-requests', DSgetAllUserCarRequests)

// =======================================
// ============== POST ROUTES ============
// =======================================
router.post('/popular', DSpostToPopular)
router.post('/user', DSuserToSeller)
router.post('/banners', DScreateBanner)

// =======================================
// ============== UPDATE ROUTES ==========
// =======================================
router.put('/add-likes/:postId', DSgivePostLikes)
router.patch('/car-requests/status/:id', DSchangeCarResquestStatus)
router.patch('/car-requests/:id', DSupdateCarRequest)

// =======================================
// ============== DELETE ROUTES =============
// =======================================
router.delete('/car-requests/:id', DSdeleteCarRequest)
router.delete('/delete-likes/:postId', DSdeleteLikes)

export default router
