import { executeQuery } from '../utils/helpingFunctions.js'

// =======================================
// ============== GET ALL BANNERS ==========
// =======================================
const getAllBannersFn = async () => {
  const query = `SELECT b.*, 
    u.username, 
    u.city,
    u.profile
    FROM banners b 
    INNER JOIN users u 
    ON b.user_id = u.user_id
    ORDER BY b.id DESC`

  return await executeQuery(query)
}

const getAllNotificationsFn = async () => {
  const query = `SELECT * FROM notifications`
  return await executeQuery(query)
}

export { getAllBannersFn, getAllNotificationsFn }
