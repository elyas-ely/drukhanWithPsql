import { client } from '../config/db.js'

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
// ============ GET ALL USERS ============
// =======================================
const getAllUsersFn = async (searchTerm, city, limit, offset) => {
  let query = `
    SELECT *,
      similarity(unaccent(username), unaccent($1)) AS sim,
      ts_rank_cd(
        setweight(to_tsvector('simple', unaccent(username)), 'A'),
        plainto_tsquery('simple', unaccent($1))
      ) AS rank
    FROM users 
    WHERE seller = true
      AND (
        similarity(unaccent(username), unaccent($1)) > 0.15 OR
        to_tsvector('simple', unaccent(username)) @@ plainto_tsquery('simple', unaccent($1)) OR
        username ILIKE '%' || $1 || '%'
      )
  `
  const params = [searchTerm]
  let paramIndex = 2

  if (city) {
    query += ` AND city = $${paramIndex}`
    params.push(city)
    paramIndex++
  }

  query += `
    ORDER BY 
      CASE 
        WHEN username ILIKE $1 || '%' THEN 1
        WHEN to_tsvector('simple', unaccent(username)) @@ plainto_tsquery('simple', unaccent($1)) THEN 2
        WHEN similarity(unaccent(username), unaccent($1)) > 0.15 THEN 3
        ELSE 4
      END,
      sim DESC,
      rank DESC,
      username ASC,
      created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `

  params.push(limit, offset)

  return await executeQuery(query, params)
}

// =======================================
// ============ GET SEARCH USERS ============
// =======================================
const getSearchUsersFn = async (searchTerm, limit = 6) => {
  const query = `
    SELECT *,
      similarity(unaccent(username), unaccent($1)) AS sim,
      ts_rank_cd(
        setweight(to_tsvector('simple', unaccent(username)), 'A'),
        plainto_tsquery('simple', unaccent($1))
      ) AS rank
    FROM users 
    WHERE 
      seller = true AND (
        similarity(unaccent(username), unaccent($1)) > 0.15 OR
        to_tsvector('simple', unaccent(username)) @@ plainto_tsquery('simple', unaccent($1)) OR
        username ILIKE '%' || $1 || '%'
      )
    ORDER BY 
      CASE 
        WHEN username ILIKE $1 || '%' THEN 1
        WHEN to_tsvector('simple', unaccent(username)) @@ plainto_tsquery('simple', unaccent($1)) THEN 2
        WHEN similarity(unaccent(username), unaccent($1)) > 0.15 THEN 3
        ELSE 4
      END,
      sim DESC,
      rank DESC,
      username ASC,
      created_at DESC
    LIMIT $2;
  `

  return await executeQuery(query, [searchTerm, limit])
}

// =======================================
// =========== GET USER BY ID ===========
// =======================================
const getUserByIdFn = async (id) => {
  const connection = await client.connect()
  try {
    await connection.query('BEGIN')

    const query = `
      SELECT *
      FROM users 
      WHERE user_id = $1`

    const result = await connection.query(query, [id])

    await connection.query('COMMIT')
    return result.rows[0]
  } catch (error) {
    await connection.query('ROLLBACK')
    throw error
  } finally {
    connection.release()
  }
}

// =======================================
// ============== GET VIEWED USERS =========
// =======================================
const getViewedUsersFn = async (userId) => {
  const query = `SELECT u.* 
     FROM users u
     JOIN viewed_users v ON u.user_id = v.viewed_user_id
     WHERE v.user_id = $1
     ORDER BY v.created_at DESC`

  return await executeQuery(query, [userId])
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

  const connection = await client.connect()
  try {
    await connection.query('BEGIN')

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

    const result = await connection.query(query, values)
    await connection.query('COMMIT')
    return result.rows[0]
  } catch (error) {
    await connection.query('ROLLBACK')
    throw error
  } finally {
    connection.release()
  }
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
  const result = await executeQuery(query, values)
  return result[0]
}

// =======================================
// ============== UPDATE VIEWED USERS ====
// =======================================
const updateViewedUsersFn = async (userId, otherId) => {
  const connection = await client.connect()
  try {
    await connection.query('BEGIN')

    // Check if the user is already viewed
    const { rows } = await connection.query(
      `SELECT * FROM viewed_users WHERE user_id = $1 AND viewed_user_id = $2`,
      [userId, otherId]
    )

    if (rows.length > 0) {
      // If already viewed, update the timestamp
      await connection.query(
        `UPDATE viewed_users SET created_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND viewed_user_id = $2`,
        [userId, otherId]
      )
    } else {
      // Insert the new viewed user
      await connection.query(
        `INSERT INTO viewed_users (user_id, viewed_user_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)`,
        [userId, otherId]
      )
    }

    // Ensure the user has a maximum of 5 viewed users
    await connection.query(
      `DELETE FROM viewed_users 
       WHERE user_id = $1 
       AND viewed_user_id NOT IN (
         SELECT viewed_user_id FROM viewed_users 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5
       )`,
      [userId]
    )

    await connection.query('COMMIT')
    return { message: rows.length > 0 ? 'updated' : 'viewed' }
  } catch (error) {
    await connection.query('ROLLBACK')
    throw error
  } finally {
    connection.release()
  }
}

// =======================================
// ============= DELETE USER ============
// =======================================
const deleteUserFn = async (userId) => {
  const query = 'DELETE FROM users WHERE user_id = $1 RETURNING *'
  const rows = await executeQuery(query, [userId])
  return rows[0]
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
