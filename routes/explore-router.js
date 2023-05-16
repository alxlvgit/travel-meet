const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { fetchSingleEvent, filterEventImages, getGroups, totalNumberOfPeopleForEvent } = require('../services/events-services');
const { getPost, getRelatedPosts } = require('../services/posts-services');
const prisma = new PrismaClient();
const { ensureAuthenticated } = require('../passport-middleware/check-auth');

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    res.render('./explore-views/explore', { users: users });

}
);

// Feeds post page
router.get('/feeds/:id', ensureAuthenticated, async (req, res) => {
    try {
        const postId = req.params.id;
        const postData = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });
        res.render('./explore-views/feeds-post', { post: postData });
    } catch (error) {
        console.log(error);
    }
});

// Event page
router.get('/event/:id', ensureAuthenticated, async (req, res) => {
    try {
        const eventData = await fetchSingleEvent(req.params.id);
        const eventImage = await filterEventImages(eventData.images);
        const groups = await getGroups(req.params.id);
        const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
        const eventImageURL = eventImage[0].url;
        res.render('./explore-views/event', {
            event: eventData,
            eventImageURL: eventImageURL,
            eventGroups: groups,
            totalNumberOfPeople: totalNumberOfPeople
        });
    } catch (error) {
        console.log(error);
    }
}
);

// Group page
router.get('/event/:eventId/group/:groupId', ensureAuthenticated, async (req, res) => {
    try {
        const eventData = await fetchSingleEvent(req.params.eventId);
        const eventImage = await filterEventImages(eventData.images);
        const groups = await getGroups(req.params.eventId);
        const totalNumberOfPeople = await totalNumberOfPeopleForEvent(groups);
        const group = await prisma.group.findUnique({
            where: {
                id: Number(req.params.groupId)
            },
            include: {
                creator: true,
                members: true
            }
        });
        res.render('./explore-views/group', {
            group: group,
            event: eventData, eventImageURL: eventImage[0].url,
            totalNumberOfPeople: totalNumberOfPeople,
            user: req.user
        });
    } catch (error) {
        console.log(error);
    }
}
);

// Create group page
router.post('/create-group/:eventId', ensureAuthenticated, async (req, res) => {
    try {
        await prisma.group.create({
            data: {
                name: req.body.groupName,
                creatorId: req.user.id,
                eventId: req.params.eventId,
                creatorMessage: req.body.creatorMessage,
            }
        });
        res.redirect(`/event/${req.params.eventId}`);
    } catch (error) {
        console.log(error);
    }
}
);

// Delete group
router.get('/delete-group/:groupId/:eventId', ensureAuthenticated, async (req, res) => {
    try {
        await prisma.group.delete({
            where: {
                id: Number(req.params.groupId)
            }
        });
        res.redirect(`/event/${req.params.eventId}`);
    } catch (error) {
        console.log(error);
    }
}
);

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

// Feeds post page
router.get('/posts/:id', ensureAuthenticated, async (req, res) => {
  const posts = await prisma.post.findMany({ orderBy: [{ createdAt: 'desc' }] })
  const postId = Number(req.params.id);
  try {
    const postData = await prisma.post.findUnique({
      where: {
        id: postId
      }
    });
    // Add for loop here
        console.log(postData);
    const relatedPosts = await getRelatedPosts(postData.category, postId);
    const getObjectParams = {
      Bucket: bucketName,
      Key: postData.image,
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    postData.imageUrl = url
    res.render('./explore-views/feeds-post', { post: postData, relatedPosts: relatedPosts });
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;