import {
  getAllPostsFn,
  getPopularPostsFn,
  getPostByIdFn,
  getSavedPostFn,
  getViewedPostFn,
  getPostsByUserIdFn,
  getFilteredPostFn,
  createPostFn,
  updatePostFn,
  deletePostFn,
  getSearchPostsFn,
  updateSaveFn,
  updateLikeFn,
  updateViewedPostsFn,
  updatePostStatusFn,
} from '../services/postService.js'
import { logger } from '../utils/logger.js'

// =======================================
// ============== GET ALL POSTS ==========
// =======================================
const getAllPosts = async (req, res) => {
  const userId = req.query?.userId
  const page = parseInt(req.query?.page) || 1
  const limit = 12
  const offset = (page - 1) * limit

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const posts = await getAllPostsFn(userId, limit, offset)

    res.status(200).json({
      posts,
      nextPage: posts.length < limit ? null : page + 1,
    })
  } catch (err) {
    console.error('Error in getAllPosts:', err)
    res.status(500).json({ error: 'Failed to retrieve posts' })
  }
}

// =======================================
// ============== GET POPULAR POSTS ==========
// =======================================
const getPopularPosts = async (req, res) => {
  const userId = req.query?.userId

  if (!userId) throw new Error('User ID is required')

  try {
    const posts = await getPopularPostsFn(userId)

    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found' })
    }

    res.status(200).json(posts)
  } catch (err) {
    console.error('Error in getAllPosts:', err)
    res
      .status(500)
      .json({ error: 'Failed to retrieve posts (getPopularPosts)' })
  }
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getPostById = async (req, res) => {
  const postId = req.params?.postId
  const userId = req.query?.userId

  if (!postId || !userId) {
    return res
      .status(400)
      .json({ error: 'Post ID and User ID are required (getPostById)' })
  }

  try {
    const post = await getPostByIdFn(postId, userId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json(post)
  } catch (err) {
    console.error('Error in getPostById:', err)
    res.status(500).json({ error: 'Failed to retrieve post (getPostById)' })
  }
}

// =======================================
// ============== GET SAVED POST =========
// =======================================
const getSavesPost = async (req, res) => {
  const userId = req.params?.userId
  const page = parseInt(req.query?.page) || 1
  const limit = 12
  const offset = (page - 1) * limit

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const posts = await getSavedPostFn(userId, limit, offset)

    res.status(200).json({
      posts,
      nextPage: posts.length < limit ? null : page + 1, // Indicate if more pages exist
    })
  } catch (err) {
    console.error('Error in getSavesPost:', err)
    res.status(500).json({ error: 'Failed to retrieve saved posts' })
  }
}

// =======================================
// ============== GET VIEWED POST =========
// =======================================
const getViewedPost = async (req, res) => {
  const userId = req.params?.userId

  if (!userId) {
    return res.status(400).json({ error: 'User ID are required' })
  }

  try {
    const post = await getViewedPostFn(userId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json(post)
  } catch (err) {
    console.error('Error in getViewedPost:', err)
    res.status(500).json({ error: 'Failed to retrieve post' })
  }
}

// =======================================
// ============= GET SEARCH POSTS ========
// =======================================
const getSearchPosts = async (req, res) => {
  const searchTerm = req.query?.searchTerm
  try {
    const posts = await getSearchPostsFn(searchTerm)
    if (posts.length === 0) {
      return res
        .status(404)
        .json({ message: 'No posts found (getSearchPosts)' })
    }
    res.status(200).json(posts)
  } catch (err) {
    console.error('Error in getSearchPosts:', err)
    res.status(500).json({ error: 'Failed to retrieve posts (getSearchPosts)' })
  }
}

// =======================================
// ========= GET FILTERED POSTS ========
// =======================================
const getFilteredPost = async (req, res) => {
  const userId = req.query?.userId
  const filters = req.query
  const page = parseInt(req.query?.page) || 1
  const limit = 12
  const offset = (page - 1) * limit

  if (!filters?.car_name || !userId) {
    return res
      .status(400)
      .json({ error: 'User ID and car name are required (getFilteredPost)' })
  }

  try {
    const posts = await getFilteredPostFn(filters, userId, limit, offset)

    res.status(200).json({
      posts,
      nextPage: posts.length < limit ? null : page + 1,
    })
  } catch (err) {
    console.error('Error in getFilteredPost:', err)
    res.status(500).json({ error: 'Failed to retrieve filtered posts' })
  }
}
// =======================================
// ========= GET POSTS BY USER ID ========
// =======================================
const getPostsByUserId = async (req, res) => {
  const userId = req.params?.userId
  const myId = req.query?.myId
  const page = parseInt(req.query?.page) || 1
  const limit = 12
  const offset = (page - 1) * limit

  if (!userId || !myId) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const posts = await getPostsByUserIdFn(userId, myId, limit, offset)
    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' })
    }
    res.status(200).json({
      posts,
      nextPage: posts.length < limit ? null : page + 1,
    })
  } catch (err) {
    console.error('Error in getPostsByUserId:', err)
    res
      .status(500)
      .json({ error: 'Failed to retrieve user posts (getPostsByUserId)' })
  }
}

// =======================================
// ============== CREATE POST ============
// =======================================
const createPost = async (req, res) => {
  try {
    const postData = req.body

    if (!postData?.car_name) {
      res.status(400).json({ message: 'post details are required' })
    }

    const newPost = await createPostFn(postData)
    if (!newPost) {
      res.status(400).json({ error: 'Failed to create post' })
    }
    return res.status(201).json({ message: 'new post created' })
  } catch (error) {
    logger.error('Error in createPost:', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
}

// =======================================
// ============== UPDATE POST ============
// =======================================
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params
    const updateData = { ...req.body }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`
    }

    const updatedPost = await updatePostFn(postId, updateData)
    res.json(updatedPost)
  } catch (error) {
    logger.error('Error in updatePost:', error)
    res.status(500).json({ error: 'Failed to update post' })
  }
}

// =======================================
// ============== UPDATE SAVE POST =======
// =======================================
const updateSave = async (req, res) => {
  const userId = req.query?.userId
  const postId = req.params?.postId

  if (!userId || !postId) {
    return res
      .status(400)
      .json({ error: 'Post ID and User ID are required (updateSave)' })
  }

  try {
    const post = await updateSaveFn(userId, postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ message: 'post save updated susccesfully ' })
  } catch (err) {
    console.error('Error in getPostById:', err)
    res.status(500).json({ error: 'Failed to retrieve post (getPostById)' })
  }
}

// =======================================
// ============== UPDATE SAVE POST =======
// =======================================
const updateLike = async (req, res) => {
  const userId = req.query?.userId
  const postId = req.params?.postId

  if (!userId || !postId) {
    return res
      .status(400)
      .json({ error: 'Post ID and User ID are required (updateLike)' })
  }

  try {
    const post = await updateLikeFn(userId, postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ message: 'post like updated susccesfully ' })
  } catch (err) {
    console.error('Error in updateLike:', err)
    res.status(500).json({ error: 'Failed to retrieve post (updateLike)' })
  }
}

// =======================================
// ============== UPDATE VIEWED POST =======
// =======================================
const updateViewedPosts = async (req, res) => {
  const userId = req.query?.userId
  const postId = req.params?.postId

  if (!userId || !postId) {
    return res
      .status(400)
      .json({ error: 'Post ID and User ID are required (updateViewedPosts)' })
  }

  try {
    const post = await updateViewedPostsFn(userId, postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ message: 'post viewd updated susccesfully ' })
  } catch (err) {
    console.error('Error in updateViewedPosts:', err)
    res
      .status(500)
      .json({ error: 'Failed to retrieve post (updateViewedPosts)' })
  }
}

const updatePostStatus = async (req, res) => {
  const userId = req.query?.userId
  const postId = req.params?.postId

  if (!userId || !postId) {
    return res
      .status(400)
      .json({ error: 'Post ID and User ID are required (updatePostStatus)' })
  }

  try {
    const post = await updatePostStatusFn(userId, postId)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(200).json({ message: 'post status updated susccesfully ' })
  } catch (err) {
    console.error('Error in updatePostStatus:', err)
    res
      .status(500)
      .json({ error: 'Failed to retrieve post (updatePostStatus)' })
  }
}

// =======================================
// ============== DELETE POST ============
// =======================================
const deletePost = async (req, res) => {
  const postId = req.params?.postId
  const userId = req.query?.userId

  if (!postId || !userId) {
    return res.status(400).json({ error: 'Post ID and User ID are required' })
  }

  try {
    const result = await deletePostFn(postId)
    if (!result) {
      return res.status(404).json({ message: 'Post not found' })
    }
    res.status(204).send()
  } catch (err) {
    console.error('Error in deletePost:', err)
    res.status(500).json({ error: 'Failed to delete post' })
  }
}

export {
  getAllPosts,
  getPopularPosts,
  getPostById,
  getViewedPost,
  getSavesPost,
  getPostsByUserId,
  getSearchPosts,
  getFilteredPost,
  createPost,
  updatePost,
  updateSave,
  updateLike,
  updateViewedPosts,
  updatePostStatus,
  deletePost,
}
