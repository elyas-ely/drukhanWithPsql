import {
  DSgetAllUsersFn,
  DSgetSearchUsersFn,
} from '../services/dashboardService.js'

export async function DSgetAllUsers(req, res) {
  const searchTerm = req.query?.searchTerm || ''
  const city = req.query?.city || ''
  const page = parseInt(req.query?.page) || 1
  const limit = 15
  const offset = (page - 1) * limit

  try {
    const users = await DSgetAllUsersFn(searchTerm, city, limit, offset)

    res.status(200).json({
      users,
      nextPage: users.length === limit ? page + 1 : null,
    })
  } catch (err) {
    console.error('Error in getAllUsers:', err)
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
}

export async function DSgetSearchUsers(req, res) {
  const searchTerm = req.query?.searchTerm
  try {
    const users = await DSgetSearchUsersFn(searchTerm)
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }
    res.status(200).json(users)
  } catch (err) {
    console.error('Error in DSgetSearchUsers:', err)
    res.status(500).json({ error: 'Failed to retrieve users' })
  }
}
