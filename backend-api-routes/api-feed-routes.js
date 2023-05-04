const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/posts', async (req, res) => {
  const { limit, category } = req.query;
  const where = category ? { category } : {};
  const posts = await prisma.post.findMany({
    take: parseInt(limit),
    where: where,
    include: {
      author: true,
    }
  });
  // console.log(posts);
  res.json({ posts: posts });
});

module.exports = router;
