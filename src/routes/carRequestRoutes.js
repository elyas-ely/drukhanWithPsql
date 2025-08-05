import express from 'express'
import {
  getAllCarRequests,
  getAllUserCarRequests,
  getCarRequestById,
  createCarRequest,
  deleteCarRequest,
  updateCarRequest,
} from '../controllers/carRequestController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', getAllCarRequests)
router.get('/user_requests', getAllUserCarRequests)
router.get('/:id', getCarRequestById)

// =======================================
// ============== POST ROUTES ============
// =======================================
router.post('/', createCarRequest)
router.delete('/:id', deleteCarRequest)
router.patch('/:id', updateCarRequest)
export default router
