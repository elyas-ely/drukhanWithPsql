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
router.get('/:id', getCarRequestById)
router.get('/user_requests', getAllUserCarRequests)

// =======================================
// ============== POST ROUTES ============
// =======================================
router.post('/', createCarRequest)

// =======================================
// ============== PATCH ROUTES ===========
// =======================================
router.patch('/:id', updateCarRequest)

// =======================================
// ============== DELETE ROUTES ==========
// =======================================
router.delete('/:id', deleteCarRequest)

export default router
