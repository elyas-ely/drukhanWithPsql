import express from 'express'
import {
  getAllUsers,
  getUserById,
  getViewedUsers,
  createUser,
  updateUser,
  deleteUser,
  updateViewedUsers,
} from '../controllers/userController.js'

const router = express.Router()

// =======================================
// ============== GET ROUTES =============
// =======================================
router.get('/', getAllUsers)
router.get('/:userId', getUserById)
router.get('/viewed/:userId', getViewedUsers)

// =======================================
// ============== POST ROUTES ============
// =======================================
router.post('/', createUser)

// =======================================
// ============== PUT ROUTES =============
// =======================================
router.put('/:userId', updateUser)
router.put('/viewed/:otherId', updateViewedUsers)

// =======================================
// ============== DELETE ROUTES ==========
// =======================================
router.delete('/:userId', deleteUser)

export default router
