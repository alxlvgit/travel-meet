const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { ensureAuthenticated } = require('../passport-middleware/check-auth');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const prisma = new PrismaClient();
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

// Individual user profile page
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    // console.log(userId);
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        posts: true, // Fetches the posts associated with the user
      },
    });
    const posts = user.posts;
    for (const post of posts) {
      const params = {
        Bucket: bucketName,
        Key: post.image,
      };
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      post.imageUrl = url;
    };
    const currentUser = req.user.id === user.id;
    res.render('./user-profile-views/user-profile', { user: user, currentUser: currentUser, posts: posts });
  } catch (error) {
    console.log(error);
  }
});

// Current user profile page
router.get('/', ensureAuthenticated, async (req, res) => {
  const currentUser = req.user;
  const user = await prisma.user.findUnique({
    where: {
      id: Number(currentUser.id),
    },
    include: {
      posts: true, // Fetches the posts associated with the user
    },
  });
  res.render('./user-profile-views/user-profile', { currentUser: true, user: user, posts: user.posts });
});

module.exports = router;
