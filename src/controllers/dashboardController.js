import {
  DSdeleteLikesFn,
  DSgetAllUsersFn,
  DSgetSearchUsersFn,
  DSgivePostLikesFn,
  DSpostToPopularFn,
  DSuserToSellerFn,
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

// =======================================
// ====== UPDATE POST TO POPULAR OR ONT ==
// =======================================
export async function DSpostToPopular(req, res) {
  const postId = req.query?.postId

  if (!postId) {
    return res
      .status(400)
      .json({ message: 'Post ID is required DSpostToPopular' })
  }
  try {
    const post = await DSpostToPopularFn(postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ message: 'post updated susccesfully ' })
  } catch (err) {
    console.error('Error in postToPopularFn:', err)
    res.status(500).json({ error: 'Failed to retrieve post (postToPopularFn)' })
  }
}

// =======================================
// ====== UPDATE USER TO SELLER OR NOT ===
// =======================================
export async function DSuserToSeller(req, res) {
  const userId = req.query?.userId

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    const user = await DSuserToSellerFn(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({ message: 'user updated susccesfully ' })
  } catch (err) {
    console.error('Error in userToSeller:', err)
    res.status(500).json({ error: 'Failed to retrieve user (userToSeller)' })
  }
}

// =======================================
// ====== give a post likes ===
// =======================================
export async function DSgivePostLikes(req, res) {
  const postId = Number(req.params?.postId)
  const numberOfLikes = Number(req.query?.likes)

  if (!postId || !numberOfLikes || isNaN(numberOfLikes) || numberOfLikes <= 0) {
    return res
      .status(400)
      .json({ message: 'postId and a valid number of likes are required' })
  }

  try {
    await DSgivePostLikesFn(postId, numberOfLikes)

    res.status(200).json({
      message: `${numberOfLikes} likes added successfully to post ${postId}`,
    })
  } catch (err) {
    console.error('Error in DSgivePostsLikesFn:', err)
    res.status(500).json({
      error: 'Failed to add likes to the post',
    })
  }
}

// =======================================
// ====== delete a post likes ===
// =======================================
export async function DSdeleteLikes(req, res) {
  const postId = Number(req.params?.postId)
  const numberOfLikes = Number(req.query?.likes)

  if (!postId || !numberOfLikes || isNaN(numberOfLikes) || numberOfLikes <= 0) {
    return res
      .status(400)
      .json({ message: 'postId and a valid number of likes are required' })
  }

  try {
    await DSdeleteLikesFn(postId, numberOfLikes)

    res.status(200).json({
      message: `${numberOfLikes} likes deleted successfully to post ${postId}`,
    })
  } catch (err) {
    console.error('Error in DSdeleteLikesFn:', err)
    res.status(500).json({
      error: 'Failed to delete likes to the post',
    })
  }
}
