import { executeQuery } from '../utils/helpingFunctions.js'

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
