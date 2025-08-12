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
// ============== GET ALL REQUESTS =======
// =======================================
export const getAllCarRequestsFn = async (city) => {
  let query = `
    SELECT cr.*, 
           u.username,
           u.profile
      FROM car_requests cr 
      INNER JOIN users u 
        ON cr.user_id = u.user_id
    WHERE cr.status = 'approved'
  `

  const values = []

  if (city) {
    query += ` AND cr.city = $1`
    values.push(city)
  }

  return await executeQuery(query, values)
}

// =======================================
// ============== GET ALL USER REQUESTS ==
// =======================================
export const getAllUserCarRequestsFn = async (userId, status) => {
  // Base query and parameters
  let query = `
    SELECT cr.*, 
           u.username,
           u.profile
      FROM car_requests cr 
      INNER JOIN users u 
        ON cr.user_id = u.user_id
     WHERE cr.user_id = $1
  `

  const values = [userId]

  // Add status filter if status is NOT 'all'
  if (status && status.toLowerCase() !== 'all') {
    query += ` AND cr.status = $2`
    values.push(status)
  }

  return await executeQuery(query, values)
}

// =======================================
// ============== GET  REQUESTS BY ID ====
// =======================================
export const getCarRequestByIdFn = async (id, userId) => {
  const query = `SELECT cr.*, 
    u.username,
    u.profile
    FROM car_requests cr 
    INNER JOIN users u 
    ON cr.user_id = u.user_id
    WHERE cr.id = $1 AND cr.user_id = $2`

  const values = [id, userId]

  return await executeQuery(query, values)
}

export const createCarRequestFn = async (data) => {
  const {
    user_id,
    car_name,
    city,
    phone_number = null,
    whatsapp = null,
    model = null,
    conditions = null,
    fuel_type = null,
    engine = null,
    transmission = null,
    color = null,
    side = null,
    information = null,
  } = data

  const query = `
    INSERT INTO car_requests (
      user_id,
      car_name,
      model,
      conditions,
      fuel_type,
      engine,
      transmission,
      color,
      side,
      city,
      phone_number,
      whatsapp,
      information
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
    )
    RETURNING *;
  `

  const values = [
    user_id,
    car_name,
    model,
    conditions,
    fuel_type,
    engine,
    transmission,
    color,
    side,
    city,
    phone_number,
    whatsapp,
    information,
  ]

  return await executeQuery(query, values)
}

export const updateCarRequestFn = async (id, userId, data) => {
  if (!data || Object.keys(data).length === 0) {
    throw new Error('No fields provided for update')
  }

  // Allowed fields only
  const allowedFields = [
    'car_name',
    'model',
    'conditions',
    'fuel_type',
    'engine',
    'transmission',
    'color',
    'side',
    'city',
    'phone_number',
    'whatsapp',
    'information',
  ]

  const setClauses = []
  const values = []
  let index = 1

  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = $${index}`)
      values.push(value)
      index++
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields provided for update')
  }

  // Add WHERE clause params
  values.push(id, userId)

  const query = `
    UPDATE car_requests
    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index} AND user_id = $${index + 1}
    RETURNING *;
  `

  return await executeQuery(query, values)
}

export const deleteCarRequestFn = async (id, userId) => {
  const query = `DELETE FROM car_requests WHERE id = $1 AND user_id = $2`

  const values = [id, userId]

  return await executeQuery(query, values)
}
