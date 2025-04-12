import { client } from '../config/db.js'

// Helper function to execute queries with proper connection management
const executeQuery = async (query, params = []) => {
  const connection = await client.connect()
  try {
    const result = await connection.query(query, params)
    return result.rows
  } finally {
    connection.release()
  }
}

// =======================================
// ============== GET ALL BANNERS ==========
// =======================================
const getAllBannersFn = async () => {
  const query = `SELECT b.*, 
    u.username, 
    u.city 
    FROM banners b 
    INNER JOIN users u 
    ON b.user_id = u.user_id`
  
  return await executeQuery(query)
}

const getAllNotificationsFn = async () => {
  const query = `SELECT * FROM notifications`
  return await executeQuery(query)
}

export { getAllBannersFn, getAllNotificationsFn }
