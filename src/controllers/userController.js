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
export const getAllUsers = async (req, res) => {
  const searchTerm = req.query?.searchTerm || ''
  const city = req.query?.city || ''
  const page = parseInt(req.query?.page) || 1
  const limit = 15
  const offset = (page - 1) * limit

  try {
    const users = await getAllUsersFn(searchTerm, city, limit, offset)

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
export const getSearchUsers = async (req, res) => {
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
export const getUserById = async (req, res) => {
  const userId = req.params?.userId

  if (!userId) {
    return res.status(400).json({ message: 'userId is required (getUserById)' })
  }

  try {
    const user = await getUserByIdFn(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (err) {
    console.error('Error in getUserById:', err)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve user (getUserById)' })
  }
}

// =======================================
// ============ GET VIEWED USERS ===========
// =======================================
export const getViewedUsers = async (req, res) => {
  const userId = req.params.userId

  if (!userId) {
    return res
      .status(400)
      .json({ message: 'userId is required (getViewedUsers)' })
  }

  try {
    const viewedUsers = await getViewedUsersFn(userId)
    return res.status(200).json(viewedUsers)
  } catch (error) {
    console.error('Error in getViewedUsers:', error)
    return res
      .status(500)
      .json({ error: 'Failed to retrieve users (getViewedUsers)' })
  }
}

// =======================================
// ============= CREATE USER =============
// =======================================
export const createUser = async (req, res) => {
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
export const updateUser = async (req, res) => {
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
export const updateViewedUsers = async (req, res) => {
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
export const deleteUser = async (req, res) => {
  const userId = req.params.userId

  if (!userId) throw new Error('User ID is required')

  try {
    await deleteUserFn(userId)
    res.status(204).send()
  } catch (err) {
    console.error('Error in deleteUser:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}
