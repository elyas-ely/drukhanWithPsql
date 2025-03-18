import pkg from 'pg'
const { Client } = pkg
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

const connectDb = async () => {
  try {
    await client.connect()
    logger.info('Connected to the database')
  } catch (err) {
    console.error('Failed to connect to the database:', err)
    process.exit(1)
  }
}

export { client, connectDb }
