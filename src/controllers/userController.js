import {
  getAllUsersFn,
  getUserByIdFn,
  getViewedUsersFn,
  updateUserFn,
  createUserFn,
  deleteUserFn,
  updateViewedUsersFn,
  getSearchUsersFn,
} from '../services/userService.js'
import { logger } from '../utils/logger.js'

// =======================================
// ============= GET ALL USERS ===========
// =======================================
const getAllUsers = async (req, res) => {
  const searchTerm = req.query?.searchTerm || ''
  const page = parseInt(req.query?.page) || 1
  const limit = 15
  const offset = (page - 1) * limit

  try {
    const users = await getAllUsersFn(searchTerm, limit, offset)
    if (users.length === 0) {
      return res.status(200).json({ users: [], nextPage: null })
    }

    res.status(200).json({
      users,
      nextPage: users.length === limit ? page + 1 : null,
    })
  } catch (err) {
    console.error('Error in getAllUsers:', err)
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
}

// =======================================
// ============= GET SEARCH USERS ===========
// =======================================
const getSearchUsers = async (req, res) => {
  const searchTerm = req.query?.searchTerm
  try {
    const users = await getSearchUsersFn(searchTerm)
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }
    res.status(200).json(users)
  } catch (err) {
    console.error('Error in getAllUsers:', err)
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
}

// =======================================
// ============ GET USER BY ID ===========
// =======================================
const getUserById = async (req, res) => {
  const userId = req.params?.userId

  try {
    const user = await getUserByIdFn(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (err) {
    console.error('Error in getUserById:', err)
    res.status(500).json({ error: 'Failed to retrieve user' })
  }
}

// =======================================
// ============ GET VIEWED USERS ===========
// =======================================
const getViewedUsers = async (req, res) => {
  const userId = req.params?.userId

  try {
    const user = await getViewedUsersFn(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json(user)
  } catch (err) {
    console.error('Error in getUserById:', err)
    res.status(500).json({ error: 'Failed to retrieve user' })
  }
}

// =======================================
// ============= CREATE USER =============
// =======================================
const createUser = async (req, res) => {
  const userData = req.body

  try {
    await createUserFn(userData)
    res.status(201).json({ message: 'User created successfully' })
  } catch (err) {
    console.error('Error in createUser:', err)
    if (err.code === '23505') {
      return res
        .status(400)
        .json({ error: 'User with this email already exists, try another one' })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
}

// =======================================
// ============= UPDATE USER =============
// =======================================
const updateUser = async (req, res) => {
  const userId = req.params?.userId
  const userData = req.body

  if (!userId) throw new Error('User ID is required')

  try {
    await updateUserFn(userId, userData)
    res.status(200).json({ message: 'User updated successfully' })
  } catch (err) {
    console.error('Error in updateUser:', err)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

// =======================================
// ============== UPDATE VIEWED USERS =======
// =======================================
const updateViewedUsers = async (req, res) => {
  const userId = req.query?.userId
  const otherId = req.params?.otherId

  if (!userId || !otherId) {
    return res
      .status(400)
      .json({ error: 'Post ID and User ID are required (updateViewedUsers)' })
  }

  try {
    const post = await updateViewedUsersFn(userId, otherId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ message: 'User viewd updated susccesfully ' })
  } catch (err) {
    console.error('Error in updateViewedUsers:', err)
    res
      .status(500)
      .json({ error: 'Failed to retrieve post (updateViewedUsers)' })
  }
}

// =======================================
// ============= DELETE USER =============
// =======================================
const deleteUser = async (req, res) => {
  const userId = req.params.userId

  if (!userId) throw new Error('User ID is required')

  try {
    await deleteUserFn(userId)
    logger.warning('User deleted successfully')
    res.status(204).send()
  } catch (err) {
    console.error('Error in deleteUser:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}

export {
  getAllUsers,
  getSearchUsers,
  getViewedUsers,
  createUser,
  getUserById,
  updateUser,
  updateViewedUsers,
  deleteUser,
}
