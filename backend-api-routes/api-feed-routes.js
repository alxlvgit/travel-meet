const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/posts', async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
    }
  });
  console.log(posts);
  res.json({ posts: posts });
});

module.exports = router;
