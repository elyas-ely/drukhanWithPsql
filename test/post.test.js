const express = require('express')
const multer = require('multer')
const path = require('path')

const app = express()

// Set storage engine
const storage = multer.diskStorage({
  destination: './test_files/',
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    )
  },
})

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/
    const extName = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimeType = fileTypes.test(file.mimetype)

    if (mimeType && extName) return cb(null, true)
    cb('Error: Images Only!')
  },
})

// Upload route
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded!')
  res.json({ message: 'File uploaded successfully!', file: req.file })
})

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

// Start server
app.listen(3000, () => console.log('Server started on port 3000'))

// New route for testing image upload functionality
app.post('/posts', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded!')
  const postData = {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    userId: req.body.userId,
    image: req.file.path,
  }
  // Save post data to database or perform other operations
  res.status(201).json({ message: 'Post created successfully!', postData })
})

app.put('/posts/:postId', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded!')
  const postId = req.params.postId
  const updateData = {
    title: req.body.title,
    description: req.body.description,
    image: req.file.path,
  }
  // Update post data in database or perform other operations
  res.status(200).json({ message: 'Post updated successfully!', updateData })
})
