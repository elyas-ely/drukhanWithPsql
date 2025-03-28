import express from 'express'
import { connectDb } from './config/db.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import otherRoutes from './routes/otherRoutes.js'
import errorHandler from './middlewares/errorHandler.js'
import dotenv from 'dotenv'
import { logger } from './utils/logger.js'

dotenv.config()

const app = express()

// Connect to database
connectDb()

// Middleware
app.use(express.json())
app.use(express.static('public'))

// Routes
app.use('/users', userRoutes)
app.use('/posts', postRoutes)
app.use('/others', otherRoutes)

// Error handling
app.use(errorHandler)

const port = process.env.PORT || 5000

app.listen(port, 'localhost', () => {
  logger.info(`Server started on port ${port}`)
})

export default app
