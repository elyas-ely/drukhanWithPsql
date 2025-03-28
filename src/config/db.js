import pkg from 'pg'
const { Client } = pkg
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

const connectDb = async () => {
  try {
    // Connect to the database
    await client.connect()
    await client.query('SET search_path TO public')
    logger.info('Connected to the database')
  } catch (err) {
    console.error('Failed to connect to the database:', err)
    process.exit(1)
  }
}

export { client, connectDb }
