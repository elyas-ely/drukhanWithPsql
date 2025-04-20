import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  min: 2,
  idleTimeoutMillis: 10000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
})

// Add event listeners for pool errors
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err)
  process.exit(-1)
})

const connectDb = async () => {
  try {
    // Test the pool with a query
    const client = await pool.connect()
    try {
      await client.query('SELECT NOW()')
      await client.query('SET search_path TO public')
      logger.info('Database pool initialized successfully')
    } finally {
      client.release()
    }
  } catch (err) {
    logger.error('Failed to initialize database pool:', err)
    process.exit(1)
  }
}

export { pool as client, connectDb }
