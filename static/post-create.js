// Purpose: Create a post in the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPost(title, description, location, date, category, image) {
  try {
    const post = await prisma.post.create({
      data: {
        title,
        description,
        location,
        date,
        category,
        image
      }
    });
    console.log(`Created post with ID: ${post.id}`);
    return post;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to create post');
  }
}

module.exports = { createPost };
