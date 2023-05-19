const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { url } = require('inspector');
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

// Gets all posts for feed
router.get('/posts', async (req, res) => {
  try {
    const { limit, category } = req.query;
    const where = category ? { category } : {};
    const posts = await prisma.post.findMany({
      take: parseInt(limit),
      where: where,
      include: {
        author: true,
      },
      orderBy: {
        // Orders posts by newest posts first
        createdAt: 'desc'
      }

    });
    for (const post of posts) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: post.image,
      }
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      post.imageUrl = url
    }
    res.json({ posts: posts });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
})

module.exports = router;
