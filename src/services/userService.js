import { client } from '../config/db.js'

// =======================================
// ============ GET ALL USERS ============
// =======================================
const getAllUsersFn = async (searchTerm, limit, offset) => {
  const result = await client.query(
    `SELECT * 
    FROM users 
    WHERE 'seller' = ANY(label) 
      AND username ILIKE $1 || '%'  
    ORDER BY username ASC, created_at DESC
    LIMIT $2 OFFSET $3`,
    [`${searchTerm}`, limit, offset]
  )
  return result.rows
}

// =======================================
// ============ GET SEARCH USERS ============
// =======================================
const getSearchUsersFn = async (searchTerm, limit = 6) => {
  const result = await client.query(
    `SELECT * 
    FROM users 
    WHERE 'seller' = ANY(label) 
      AND username ILIKE $1 || '%'  
    ORDER BY username ASC, created_at DESC
    LIMIT $2`,
    [`${searchTerm}`, limit]
  )
  return result.rows
}

// =======================================
// =========== GET USER BY ID ===========
// =======================================
const getUserByIdFn = async (id) => {
  const result = await client.query('SELECT * FROM users WHERE user_id = $1', [
    id,
  ])
  return result.rows[0]
}

// =======================================
// ============== GET VIEWED USERS =========
// =======================================
const getViewedUsersFn = async (userId) => {
  const result = await client.query(
    `SELECT u.* 
     FROM users u
     JOIN viewed_users v ON u.user_id = v.viewed_user_id
     WHERE v.user_id = $1
     ORDER BY v.created_at DESC;`,
    [userId]
  )
  return result.rows
}

// =======================================
// ============= CREATE USER ============
// =======================================
const createUserFn = async (userData) => {
  const {
    userId,
    username,
    email,
    bio = null,
    city = null,
    background = null,
    profile = null,
    facebook = null,
    lat = null,
    lng = null,
    phone_number1 = null,
    phone_number2 = null,
    phone_number3 = null,
    address = null,
    whatsapp = null,
    x = null,
    seller = false,
  } = userData

  const query = `
    INSERT INTO users (
      user_id, username, email, bio, city, background, profile,
      facebook, lat, lng, phone_number1, phone_number2, phone_number3,
      address, whatsapp, x, seller
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *`

  const values = [
    userId,
    username,
    email,
    bio,
    city,
    background,
    profile,
    facebook,
    lat,
    lng,
    phone_number1,
    phone_number2,
    phone_number3,
    address,
    whatsapp,
    x,
    seller,
  ]

  await client.query(query, values)
  return true
}

// =======================================
// ============= UPDATE USER ============
// =======================================
const updateUserFn = async (userId, userData) => {
  const updatableFields = [
    'username',
    'email',
    'bio',
    'city',
    'background',
    'profile',
    'facebook',
    'lat',
    'lng',
    'phone_number1',
    'phone_number2',
    'phone_number3',
    'address',
    'whatsapp',
    'x',
  ]

  // Filter out fields that are not provided in the request
  const fieldsToUpdate = {}
  for (const field of updatableFields) {
    if (userData[field] !== undefined) {
      fieldsToUpdate[field] = userData[field]
    }
  }

  // If no fields are provided to update, throw an error
  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('No fields provided to update')
  }

  // Construct the SQL query dynamically
  const setClause = Object.keys(fieldsToUpdate)
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ')

  const values = Object.values(fieldsToUpdate)
  values.push(userId)

  const query = `
    UPDATE users
    SET ${setClause}
    WHERE user_id = $${values.length}
    RETURNING *
  `

  // Execute the query
  const result = await client.query(query, values)
  return result.rows[0]
}

// =======================================
// ============== UPDATE VIEWED USERS ====
// =======================================
const updateViewedUsersFn = async (userId, otherId) => {
  // Check if the post is already viewed
  const { rows } = await client.query(
    `SELECT * FROM viewed_users WHERE user_id = $1 AND viewed_user_id = $2`,
    [userId, otherId]
  )

  if (rows.length > 0) {
    // If already viewed, update the timestamp
    await client.query(
      `UPDATE viewed_users SET created_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND viewed_user_id = $2`,
      [userId, otherId]
    )
    return { message: 'updated' }
  } else {
    // If not viewed, save it
    await client.query(
      `INSERT INTO viewed_users (user_id, viewed_user_id) VALUES ($1, $2) RETURNING *`,
      [userId, otherId]
    )
    return { message: 'viewed' }
  }
}

// =======================================
// ============= DELETE USER ============
// =======================================
const deleteUserFn = async (userId) => {
  const result = await client.query(
    'DELETE FROM users WHERE user_id = $1 RETURNING *',
    [userId]
  )
  return result.rows[0]
}

export {
  getAllUsersFn,
  getSearchUsersFn,
  getUserByIdFn,
  getViewedUsersFn,
  createUserFn,
  updateUserFn,
  updateViewedUsersFn,
  deleteUserFn,
}
