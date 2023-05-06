const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new post
router
  .get('/', (req, res) => {
    res.render('add-post-views/post-create');
  })
  .post('/', async (req, res) => {
    const { title, description, location, createdAt, category, image } = req.body;

    try {
      const post = await prisma.post.create({
        data: {
          title,
          description,
          location,
          createdAt,
          category,
          image,
        },
      });
      console.log('Created post:', post);
      res.redirect('/');
    } catch (error) {
      console.error('Failed to create post:', error);
      res.render('error', { error });
    }
  });

module.exports = router;
