import { client } from '../config/db.js'
import { logger } from '../utils/logger.js'

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
// ============== GET ALL POSTS ==========
// =======================================
const getAllPostsFn = async (userId, limit = 12, offset = 0) => {
  const query = `SELECT 
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
  LIMIT $2 OFFSET $3`

  return await executeQuery(query, [userId, limit, offset])
}

// =======================================
// ============== GET POPULAR POSTS ======
// =======================================
const getPopularPostsFn = async (userId) => {
  const query = `SELECT 
    posts.*, 
    (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = posts.id) AS likes_count,
    EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = posts.id) AS like_status,
    EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = posts.id) AS save_status
  FROM posts
  WHERE posts.popular = true
  ORDER BY posts.created_at DESC`

  return await executeQuery(query, [userId])
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getPostByIdFn = async (postId, userId) => {
  const query = `SELECT 
  p.*, 
  u.username, 
  u.profile, 
  u.city,

   (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
  EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $2 AND l.post_id = p.id) AS like_status,
  EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $2 AND s.post_id = p.id) AS save_status
FROM posts p
INNER JOIN users u ON u.user_id = p.user_id
WHERE p.id = $1`

  return await executeQuery(query, [postId, userId])
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getSavedPostFn = async (userId, limit, offset) => {
  const query = `SELECT 
    p.*, 
    (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
    EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = p.id)::BOOLEAN AS like_status,
    EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = p.id)::BOOLEAN AS save_status
  FROM posts p
  JOIN saves s ON p.id = s.post_id
  WHERE s.user_id = $1
  ORDER BY s.created_at DESC
  LIMIT $2 OFFSET $3;`

  return await executeQuery(query, [userId, limit, offset])
}

// =======================================
// ============== GET POST BY ID =========
// =======================================
const getViewedPostFn = async (userId) => {
  const query = `SELECT 
    p.*, 
    (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
    EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $1 AND l.post_id = p.id)::BOOLEAN AS like_status,
    EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $1 AND s.post_id = p.id)::BOOLEAN AS save_status
  FROM posts p
  JOIN viewed_posts v ON p.id = v.post_id  -- Join with viewed_posts instead of saves
  WHERE v.user_id = $1  -- Filter by user_id for the viewed posts
  ORDER BY v.created_at DESC;`

  return await executeQuery(query, [userId])
}

// =======================================
// ============ GET ALL USERS ============
// =======================================
const getSearchPostsFn = async (searchTerm, limit = 10) => {
  const query = `SELECT id, car_name 
     FROM posts 
     WHERE car_name ILIKE $1
     ORDER BY car_name ASC, created_at DESC
     LIMIT $2`

  return await executeQuery(query, [`${searchTerm}%`, limit])
}

// =======================================
// ============== GET FILTERED POST  =====
// =======================================
const getFilteredPostFn = async (filters, userId, limit, offset) => {
  try {
    const queryParts = []
    const queryParams = [userId]

    const filterConditions = {
      car_name: (value) => `car_name ILIKE $${queryParams.push(`${value}%`)}`,
      conditions: (value) => `conditions = $${queryParams.push(value)}`,
      color: (value) => `color = $${queryParams.push(value)}`,
      engine: (value) => `engine = $${queryParams.push(value)}`,
      fuel_type: (value) => `fuel_type = $${queryParams.push(value)}`,
      model: (value) => `model = $${queryParams.push(value)}`,
      minPrice: (value) => `price >= $${queryParams.push(value)}`,
      maxPrice: (value) => `price <= $${queryParams.push(value)}`,
      side: (value) => `side = $${queryParams.push(value)}`,
      transmission: (value) => `transmission = $${queryParams.push(value)}`,
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (filterConditions[key] && value !== undefined && value !== '') {
        queryParts.push(filterConditions[key](value))
      }
    })

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
      LIMIT $${queryParams.push(limit)} OFFSET $${queryParams.push(offset)};
    `

    return await executeQuery(query, queryParams)
  } catch (error) {
    console.error('Error fetching filtered posts:', error)
    throw new Error(`Failed to fetch filtered posts: ${error.message}`)
  }
}

// =======================================
// ========= GET POSTS BY USER ID ========
// =======================================
const getPostsByUserIdFn = async (userId, myId, limit, offset) => {
  const query = `SELECT 
    p.*, 
    (SELECT COUNT(*)::int FROM likes l WHERE l.post_id = p.id) AS likes_count,
    EXISTS (SELECT 1 FROM likes l WHERE l.user_id = $2 AND l.post_id = p.id)::BOOLEAN AS like_status,
    EXISTS (SELECT 1 FROM saves s WHERE s.user_id = $2 AND s.post_id = p.id)::BOOLEAN AS save_status
  FROM posts p
  JOIN users u ON p.user_id = u.user_id
  WHERE p.user_id = $1
  ORDER BY p.created_at DESC
  LIMIT $3 OFFSET $4`

  return await executeQuery(query, [userId, myId, limit, offset])
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
    userId,
    conditions = null,
    engine = null,
    side = null,
    popular = false,
    images = [],
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

  return result.rows[0]
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
  const result = await executeQuery(query, values)

  // Return the updated post
  return result.rows[0]
}

// =======================================
// ============== UPDATE SAVE POST =======
// =======================================
const updateSaveFn = async (userId, postId) => {
  // Check if the post is already saved
  const { rows } = await executeQuery(
    `SELECT * FROM saves WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  )

  if (rows.length > 0) {
    // If already saved, delete it
    await executeQuery(
      `DELETE FROM saves WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )
    return { message: 'unsaved' }
  } else {
    // If not saved, save it
    await executeQuery(
      `INSERT INTO saves (user_id, post_id) VALUES ($1, $2) RETURNING *`,
      [userId, postId]
    )
    return { message: 'saved' }
  }
}

// =======================================
// ============== UPDATE LIKE POST =======
// =======================================
const updateLikeFn = async (userId, postId) => {
  // Check if the post is already saved
  const { rows } = await executeQuery(
    `SELECT * FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  )

  if (rows.length > 0) {
    // If already saved, delete it
    await executeQuery(
      `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )
    return { message: 'unliked' }
  } else {
    // If not saved, save it
    await executeQuery(
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
  try {
    await executeQuery('BEGIN')

    // Check if the post is already viewed
    const { rows } = await executeQuery(
      `SELECT * FROM viewed_posts WHERE user_id = $1 AND post_id = $2`,
      [userId, postId]
    )

    if (rows.length > 0) {
      // If already viewed, update the timestamp
      await executeQuery(
        `UPDATE viewed_posts SET created_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      )
    } else {
      // Insert the new viewed post
      await executeQuery(
        `INSERT INTO viewed_posts (user_id, post_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [userId, postId]
      )
    }

    // Ensure the user has a maximum of 5 viewed posts
    await executeQuery(
      `DELETE FROM viewed_posts 
       WHERE user_id = $1 
       AND post_id NOT IN (
         SELECT post_id FROM viewed_posts 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5
       )`,
      [userId]
    )

    await executeQuery('COMMIT')
    return { message: rows.length > 0 ? 'updated' : 'viewed' }
  } catch (error) {
    await executeQuery('ROLLBACK')
    console.error('Error updating viewed posts:', error)
    throw error
  }
}

// =======================================
// ============== DELETE POST ============
// =======================================
const deletePostFn = async (postId) => {
  const result = await executeQuery(
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
