import {
  getAllBannersFn,
  getAllNotificationsFn,
} from '../services/otherService.js'

// =======================================
// ============== GET ALL BANNAERS =======
// =======================================
const getAllBanners = async (req, res) => {
  try {
    const banners = await getAllBannersFn()
    if (!banners) {
      return res
        .status(404)
        .json({ message: 'banners not found (getAllBannersFn)' })
    }
    res.status(200).json(banners)
  } catch (err) {
    console.error('Error in getAllBannersFn:', err)
    res
      .status(500)
      .json({ error: 'Failed to retrieve banners (getAllBannersFn)' })
  }
}

// =======================================
// ============== GET ALL NOTIFICATIONS =======
// =======================================
const getAllNotifications = async (req, res) => {
  try {
    const notificaitons = await getAllNotificationsFn()
    if (!notificaitons) {
      return res
        .status(404)
        .json({ message: 'notificaitons not found (getAllNotificationsFn)' })
    }
    res.status(200).json(notificaitons)
  } catch (err) {
    console.error('Error in getAllNotificationsFn:', err)
    res.status(500).json({
      error: 'Failed to retrieve notificaitons (getAllNotificationsFn)',
    })
  }
}
export { getAllBanners, getAllNotifications }
