import { client } from '../config/db.js'

// =======================================
// ============== GET ALL BANNERS ==========
// =======================================
const getAllBannersFn = async () => {
  const result = await client.query(
    `SELECT b.*, u.username, u.city FROM banners b INNER JOIN users u ON b.user_id = u.user_id`
  )

  return result.rows
}

const getAllNotificationsFn = async () => {
  const result = await client.query(`SELECT * FROM notifications`)

  return result.rows
}

export { getAllBannersFn, getAllNotificationsFn }
