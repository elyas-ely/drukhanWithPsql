import { client } from '../config/db.js'

// =======================================
// ============== GET ALL BANNERS ==========
// =======================================
const getAllBannersFn = async () => {
  const result = await client.query(`SELECT * FROM banners`)

  return result.rows
}

const getAllNotificationsFn = async () => {
  const result = await client.query(`SELECT * FROM notifications`)

  return result.rows
}

export { getAllBannersFn, getAllNotificationsFn }
