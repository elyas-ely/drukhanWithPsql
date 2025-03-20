import { client } from '../config/db.js'
import { logger } from '../utils/logger.js'

// =======================================
// ============== GET ALL POSTS ==========
// =======================================
const getAllPostsFn = async (userId, limit = 12, offset = 0) => {
  const result = await client.query(
    `SELECT 
      posts.*, 
      u.username, 
      u.profile, 
      u.city,
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = posts.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = posts.id)::BOOLEAN AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = posts.id)::BOOLEAN AS save_status
    FROM posts
    INNER JOIN users u ON posts.user_id = u.user_id
    ORDER BY posts.created_at DESC
    LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )

  return result.rows
}

// =======================================
// ============== GET POPULAR POSTS ==========
// =======================================
const getPopularPostsFn = async (userId) => {
  const result = await client.query(
    `SELECT 
      posts.*, 
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = posts.id) AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = posts.id) AS save_status
    FROM posts
    WHERE posts.popular = true
    ORDER BY posts.created_at DESC`,
    [userId]
  )

  return result.rows
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getPostByIdFn = async (postId, userId) => {
  const result = await client.query(
    `SELECT 
      p.*, 
      u.username, 
      u.profile, 
      u.city,
      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $2 AND l.post_id = p.id) AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $2 AND s.post_id = p.id) AS save_status
    FROM posts p
    INNER JOIN users u ON u.user_id = p.user_id
    WHERE p.id = $1`,
    [postId, userId]
  )

  return result.rows[0]
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getSavedPostFn = async (userId, limit, offset) => {
  const result = await client.query(
    `SELECT 
      p.*, 
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = p.id)::BOOLEAN AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = p.id)::BOOLEAN AS save_status
    FROM posts p
    JOIN saves s ON p.id = s.post_id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
    LIMIT $2 OFFSET $3;`,
    [userId, limit, offset]
  )
  return result.rows
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getViewedPostFn = async (userId) => {
  const result = await client.query(
    `SELECT 
      p.*, 
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = p.id)::BOOLEAN AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = p.id)::BOOLEAN AS save_status
    FROM posts p
    JOIN viewed_posts v ON p.id = v.post_id  -- Join with viewed_posts instead of saves
    WHERE v.user_id = $1  -- Filter by user_id for the viewed posts
    ORDER BY v.created_at DESC;`,
    [userId]
  )
  return result.rows
}

// =======================================
// ============ GET ALL USERS ============
// =======================================
const getSearchPostsFn = async (searchTerm) => {
  const result = await client.query(
    `SELECT id, car_name 
       FROM posts 
       WHERE car_name ILIKE $1
       ORDER BY car_name ASC, created_at DESC`,
    [`${searchTerm}%`] // Properly parameterized query to prevent SQL injection
  )

  return result.rows
}

// =======================================
// ============== GET FILTERED POST  =====
// =======================================
const getFilteredPostFn = async (filters, userId) => {
  try {
    const queryParts = []
    const queryParams = [userId] // Add userId as the first parameter

    const filterConditions = {
      car_name: (value) => `car_name ILIKE $${queryParams.push(`${value}%`)}`,
      conditions: (value) => `conditions = $${queryParams.push(value)}`,
      engine: (value) => `engine = $${queryParams.push(value)}`,
      fuel_type: (value) => `fuel_type = $${queryParams.push(value)}`,
      model: (value) => `model = $${queryParams.push(value)}`,
      price: (value) => `price <= $${queryParams.push(value)}`,
      side: (value) => `side = $${queryParams.push(value)}`,
      transmission: (value) => `transmission = $${queryParams.push(value)}`,
    }

    // Apply filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (filterConditions[key] && value !== undefined && value !== '') {
        queryParts.push(filterConditions[key](value))
      }
    })

    // If no filters were applied, return an empty array early
    if (queryParts.length === 0) {
      console.log('No valid filters applied, returning empty array.')
      return []
    }

    const query = `
      SELECT *,
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = posts.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = posts.id)::BOOLEAN AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = posts.id)::BOOLEAN AS save_status
      FROM posts
      WHERE ${queryParts.join(' AND ')}
      ORDER BY car_name ASC, created_at DESC
    `

    const result = await client.query(query, queryParams)
    return result.rows
  } catch (error) {
    console.error('Error fetching filtered posts:', error)
    throw new Error(`Failed to fetch filtered posts: ${error.message}`)
  }
}
// =======================================
// ========= GET POSTS BY USER ID ========
// =======================================
const getPostsByUserIdFn = async (userId, myId, limit, offset) => {
  const result = await client.query(
    `SELECT 
      p.*, 
      (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
      EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $2 AND l.post_id = p.id)::BOOLEAN AS like_status,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $2 AND s.post_id = p.id)::BOOLEAN AS save_status
    FROM posts p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
    LIMIT $3 OFFSET $4`,
    [userId, myId, limit, offset]
  )
  return result.rows
}

// =======================================
// ============== CREATE POST ============
// =======================================
const createPostFn = async (postData) => {
  const {
    car_name,
    price,
    model,
    transmission,
    fuel_type,
    color,
    information,
    conditions = null,
    engine = null,
    side = null,
    popular = false,
    images = [],
    userId,
  } = postData

  const result = await client.query(
    `INSERT INTO posts (
        car_name,
        price,
        model,
        transmission,
        fuel_type,
        color,
        information,
        conditions,
        engine,
        popular,
        side,
        images, 
        user_id 
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
    [
      car_name,
      price,
      model,
      transmission,
      fuel_type,
      color,
      information,
      conditions,
      engine,
      popular,
      side,
      images,
      userId,
    ]
  )

  return result.rows[0] // Return the inserted row
}

// =======================================
// ============== UPDATE POST ============
// =======================================
const updatePostFn = async (postId, postData) => {
  const setClauses = []
  const values = []

  // Iterate over the keys in postData
  Object.keys(postData).forEach((key, index) => {
    if (postData[key] !== undefined) {
      // Ensure the field is provided
      setClauses.push(`${key} = $${index + 1}`)
      values.push(postData[key])
    }
  })

  // If no fields are provided to update, return early or throw an error
  if (setClauses.length === 0) {
    throw new Error('No fields provided to update.')
  }

  // Add the postId as the last value for the WHERE clause
  values.push(postId)

  // Construct the SQL query dynamically
  const query = `
    UPDATE posts
    SET ${setClauses.join(', ')}
    WHERE id = $${values.length}
    RETURNING *
  `

  // Execute the query
  const result = await client.query(query, values)

  // Return the updated post
  return result.rows[0]
}

// =======================================
// ============== UPDATE SAVE POST ============
// =======================================
const updateSaveFn = async (userId, postId) => {
  // Check if the post is already saved
  const { rows } = await client.query(
    `SELECT * FROM saves WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  )

  if (rows.length > 0) {
    // If already saved, delete it
    await client.query(
      `DELETE FROM saves WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )
    return { message: 'unsaved' }
  } else {
    // If not saved, save it
    await client.query(
      `INSERT INTO saves (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [userId, postId]
    )
    return { message: 'saved' }
  }
}

// =======================================
// ============== UPDATE LIKE POST ============
// =======================================
const updateLikeFn = async (userId, postId) => {
  // Check if the post is already saved
  const { rows } = await client.query(
    `SELECT * FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  )

  if (rows.length > 0) {
    // If already saved, delete it
    await client.query(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )
    return { message: 'unliked' }
  } else {
    // If not saved, save it
    await client.query(
      `INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [userId, postId]
    )
    return { message: 'liked' }
  }
}

// =======================================
// ============== UPDATE VIEWED POST =====
// =======================================
const updateViewedPostsFn = async (userId, postId) => {
  // Check if the post is already viewed
  const { rows } = await client.query(
    `SELECT * FROM viewed_posts WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  )

  if (rows.length > 0) {
    // If already viewed, update the timestamp
    await client.query(
      `UPDATE viewed_posts SET created_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )
    return { message: 'updated' }
  } else {
    // If not viewed, save it
    await client.query(
      `INSERT INTO viewed_posts (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [userId, postId]
    )
    return { message: 'viewed' }
  }
}

// =======================================
// ============== DELETE POST ============
// =======================================
const deletePostFn = async (postId) => {
  const result = await client.query(
    'DELETE FROM posts WHERE id = $1 RETURNING *',
    [postId]
  )
  return result.rows[0]
}

export {
  getAllPostsFn,
  getPopularPostsFn,
  getPostByIdFn,
  getSavedPostFn,
  getViewedPostFn,
  getSearchPostsFn,
  getFilteredPostFn,
  getPostsByUserIdFn,
  createPostFn,
  updatePostFn,
  updateSaveFn,
  updateLikeFn,
  updateViewedPostsFn,
  deletePostFn,
}
