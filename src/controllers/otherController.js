import {
  getAllBannersFn,
  getAllNotificationsFn,
} from '../services/otherService.js'

// =======================================
// ============== GET ALL BANNAERS =======
// =======================================
export const getAllBanners = async (req, res) => {
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
export const getAllNotifications = async (req, res) => {
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

export const getAppVersion = async (req, res) => {
  try {
    const version = '1.2.11'
    res.status(200).json({ version })
  } catch (err) {
    console.error('Error in getAppVersion:', err)
    res.status(500).json({ message: 'Failed to retrieve app version' })
  }
}
