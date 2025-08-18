import { executeQuery, generateLikes } from '../utils/helpingFunctions.js'

// =======================================
// ============ GET ALL USERS ============
// =======================================
export async function DSgetAllUsersFn(searchTerm, city, limit, offset) {
  let query = `
    SELECT *,
      similarity(unaccent(username), unaccent($1)) AS sim,
      ts_rank_cd(
        setweight(to_tsvector('simple', unaccent(username)), 'A'),
        plainto_tsquery('simple', unaccent($1))
      ) AS rank
    FROM users 
    WHERE
     (
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

export async function DSgetSearchUsersFn(searchTerm, limit = 6) {
  const query = `
    SELECT *,
      similarity(unaccent(username), unaccent($1)) AS sim,
      ts_rank_cd(
        setweight(to_tsvector('simple', unaccent(username)), 'A'),
        plainto_tsquery('simple', unaccent($1))
      ) AS rank
    FROM users 
    WHERE 
      (
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

export async function DSpostToPopularFn(postId) {
  const query = `
    UPDATE posts
    SET popular = NOT popular
    WHERE id = $1
  `
  return await executeQuery(query, [postId])
}

export async function DSuserToSellerFn(userId) {
  const query = `
    UPDATE users
    SET seller = NOT seller
    WHERE user_id = $1
  `
  return await executeQuery(query, [userId])
}

// =======================================
// ============== GET ALL CAR REQUESTS =======
// =======================================
export const DSgetAllCarRequestsFn = async (city) => {
  let query = `
    SELECT cr.*, 
           u.username,
           u.profile
      FROM car_requests cr
      INNER JOIN users u ON cr.user_id = u.user_id
  `
  const values = []

  if (city) {
    query += ` AND cr.city = $1`
    values.push(city)
  }

  // Order by newest requests first
  query += ` ORDER BY cr.created_at DESC`

  try {
    return await executeQuery(query, values)
  } catch (err) {
    throw err
  }
}

// =======================================
// ============== GET REQUEST BY ID ======
// =======================================
export const DSgetCarRequestByIdFn = async (id) => {
  const query = `SELECT cr.*, 
    u.username,
    u.profile
    FROM car_requests cr 
    INNER JOIN users u 
    ON cr.user_id = u.user_id
    WHERE cr.id = $1`

  const values = [id]

  return await executeQuery(query, values)
}
export async function DSchangeCarResquestStatusFn(id, status, rejectionReason) {
  const query = `
    UPDATE car_requests
    SET status = $2, rejection_reason = $3
    WHERE id = $1
    RETURNING *
  `
  return await executeQuery(query, [id, status, rejectionReason])
}

export async function DSgivePostLikesFn(postId, numberOfLikes) {
  try {
    const { values, placeholders } = generateLikes(postId, numberOfLikes)

    const query = `INSERT INTO likes (user_id, post_id) VALUES ${placeholders}`
    return await executeQuery(query, values)
  } catch (error) {
    console.error(error)
  }
}

export async function DSdeleteLikesFn(postId, numberOfLikes) {
  const query = `
    DELETE FROM likes
    WHERE ctid IN (
      SELECT ctid
      FROM likes
      WHERE post_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    )
  `
  return await executeQuery(query, [postId, numberOfLikes])
}
