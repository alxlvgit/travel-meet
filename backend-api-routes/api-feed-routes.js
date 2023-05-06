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

// Handle form submission
router
  .route("/post-create")
  .get((req, res) => {
    res.render("add-post-views/post-create")
  })
  .post(async (req, res) => {
    try {
      // Create a new post object with the data from the form
      const newPost = await prisma.post.create({
        data: {
          title: req.body.title,
          description: req.body.description,
          location: req.body.location,
          category: req.body.category,
          image: req.body.image
        }
      });
      // Redirect to the homepage
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.render('error', { error });
    }
  });

module.exports = router;
