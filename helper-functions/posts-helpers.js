const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPost = async (postId) => {
  const postData = await prisma.post.findUnique({
      where: {
          id: postId
      },
      include: {
          author: true,
      },
  });
  return postData;
};

// Get related posts
const getRelatedPosts = async (category, postId) => {
    const relatedPosts = await prisma.post.findMany({
        take: 10,
        where: {
            category: category,
            NOT: {
                id: postId
            }
        },
    });
    return relatedPosts;
};

module.exports = { getPost, getRelatedPosts };