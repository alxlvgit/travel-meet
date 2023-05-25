const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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

router.get('/:userId/icon', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            profileImageURI: true,
        },
    });
    const params = {
        Bucket: bucketName,
        Key: user.profileImageURI,
    };
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    user.profileImageURI = url;
    res.json(user);
});

//Follow user
router.post('/follow/:userId', async (req, res) => {
    try {
        const userToFollowId = Number(req.params.userId);
        const currentUser = req.user;
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { following: { connect: { id: userToFollowId } } }
        });
        res.status(200).json({ message: "Successfully followed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while trying to follow the user" });
    }
});

//Unfollow user
router.post('/unfollow/:userId', async (req, res) => {
    try {
        const userToUnfollowId = Number(req.params.userId);
        const currentUser = req.user;
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { following: { disconnect: { id: userToUnfollowId } } }
        });
        res.status(200).json({ message: "Successfully unfollowed" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while trying to unfollow the user" });
    }
});

// Check if following user
router.get('/is-following/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const currentUser = req.user;
        const isFollowing = await prisma.user.findFirst({
            where: {
                id: currentUser.id,
                following: {
                    some: {
                        id: userId
                    }
                }
            }
        });
        if (isFollowing) {
            res.status(200).json({ isFollowing: true });
        } else {
            res.status(200).json({ isFollowing: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while checking follow status" });
    }
});




module.exports = router;