const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { ensureAuthenticated } = require('../passport-middleware/check-auth');

// Import s3 bucket
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Import dotenv
const dotenv = require('dotenv');
dotenv.config()

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// Import Multer
const multer = require('multer');

// Set Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create middleware to upload image
// Can change to multiple photos later
// Get add post page
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('add-post-views/post-create', {
    user: req.user
  });
});

// Create a new post
router.post('/', ensureAuthenticated, upload.single('image'), async (req, res) => {
  const { title, caption, location, category, authorMessage } = req.body;
  console.log(req.body);
  console.log(req.file);
  req.file.buffer

  const params = {
    Bucket: bucketName,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params)

  await s3.send(command)

  const post = await prisma.post.create({
    data: {
      title: title,
      caption: caption,
      location: location,
      category: category,
      authorMessage: authorMessage,
    }
  });
  res.json(post);
});

// Delete a post
router.delete('/:postId', ensureAuthenticated, async (req, res) => {
  const { postId } = req.params.postId;
  const deletePost = await prisma.post.delete({
    where: {
      id: postId
    }
  });
  res.json(deletePost);
  res.redirect('/');
});

// Update a post
router.put('/:postId', ensureAuthenticated, async (req, res) => {
  const { postId } = req.body;
  const updatePost = await prisma.post.update({
    where: {
      id: postId
    },
    data: {
      title: title,
      caption: caption,
      location: location,
      category: category,
      authorMessage: authorMessage,
    }
  });
  res.json(updatePost);
  res.redirect(`/posts/${post.id}`);
});

module.exports = router;
