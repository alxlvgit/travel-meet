const express = require('express');
const router = express.Router();

// Import crypto library
const crypto = require('crypto');
// Import Multer
const multer = require('multer');
// Import sharp(Image resizing)
const sharp = require('sharp');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import s3 bucket
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

// Set Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Generate random image name(Avoid overwriting image of same name)
// Uses crypto to create random bytes and creates random image name
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Get add post page
router.get('/', async (req, res) => {
  // shows post create page(user inputs)
  res.render('add-post-views/post-create')
});

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
  const { title, caption, location, category, authorMessage } = req.body;
  console.log(req.body);
  console.log(req.file);

  // Resize image
  const buffer = await sharp(req.file.buffer).resize({ width: 1080, height: 1920, fit: "contain" }).toBuffer()

  const imageName = randomImageName();
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params)
  await s3.send(command)

  const post = await prisma.post.create({
    data: {
      image: imageName,
      title: title,
      caption: caption,
      location: location,
      category: category,
      authorMessage: authorMessage,
    }
  });
  res.send({ post });
});

// Delete a post
router.delete('/:postId', async (req, res) => {
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
router.put('/:postId', async (req, res) => {
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
