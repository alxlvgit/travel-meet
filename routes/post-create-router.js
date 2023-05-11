
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get add post page
router.get('/', (req, res) => {
  res.render('add-post-views/post-create');
});

// Create a new post
router.post('/', async (req, res) => {
  const { title, caption, location, category, authorMessage } = req.body;
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
