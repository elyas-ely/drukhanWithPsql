import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // cap concurrent clients
  min: 2, // keep a couple warm
  idleTimeoutMillis: 30000, // close idle after 30s
  connectionTimeoutMillis: 5000, // fail fast if DB unreachable
  keepAlive: true, // prevent idle drops by sending TCP pings
})

// Add event listeners for pool errors
pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err)
})

const connectDb = async (retries = 5) => {
  while (retries) {
    try {
      const client = await pool.connect()
      await client.query('SELECT NOW()')
      await client.query('SET search_path TO public')
      client.release()
      logger.info('Database pool initialized successfully')
      return
    } catch (err) {
      logger.error(`DB connection failed. Retries left: ${retries - 1}`, err)
      retries -= 1
      await new Promise((res) => setTimeout(res, 2000))
    }
  }
  process.exit(1)
}

export { pool as client, connectDb }
