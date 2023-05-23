const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require('dotenv');
const { ensureAuthenticated } = require('../passport-middleware/check-auth');
dotenv.config()

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

// Set Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Generate random image name(Avoid overwriting image of same name)
// Uses crypto to create random bytes and creates random image name
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Get add post page
router.get('/', ensureAuthenticated, async (req, res) => {
    const errorMessages = (req.session).messages;
    const user = {
        username: req.user.name,
        email: req.user.email,
        profileImage: req.user.profileImageURI,
    };
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (errorMessages && errorMessages.length > 0) {
        const mostRecentErrorMessage = errorMessages[errorMessages.length - 1];
        if (mostRecentErrorMessage === "No image uploaded. Please upload an image before creating the post.") {
            req.session.messages = [];
            res.render('add-post-views/post-create', { errorMessage: mostRecentErrorMessage, user, GOOGLE_API_KEY });
        } else {
            req.session.messages = [];
            res.render('add-post-views/post-create', { errorMessage: null, user, GOOGLE_API_KEY });
        }
    } else {
        res.render('add-post-views/post-create', { user, GOOGLE_API_KEY, errorMessage: null })
    }
});

// Create a new post
router.post('/', ensureAuthenticated, upload.single('image'), async (req, res) => {
    const { title, caption, category } = req.body;
    const imageName = randomImageName();
    const locationInput = req.body.location;
    const message = "No image uploaded. Please upload an image before creating the post.";
    if (!req.file) {
        console.log(message);
        req.session.messages = [message];
        res.redirect('/post-create');
        return;
    }
    const buffer = await sharp(req.file.buffer).resize({ fit: "contain" }).toBuffer()
    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params)
    await s3.send(command)
    // Access the user's information from req.user
    const user = req.user;
    const post = await prisma.post.create({
        data: {
            image: imageName,
            title: title,
            caption: caption,
            location: locationInput,
            category: category,
            author: {
                connect: {
                    id: user.id
                }
            }
        }
    });
    // console.log(post);
    res.redirect("/");
});

// Delete a post
router.delete('/:postId', ensureAuthenticated, async (req, res) => {
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
router.put('/:postId', ensureAuthenticated, async (req, res) => {
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
        }
    });
    res.json(updatePost);
    res.redirect(`/posts/${post.id}`);
});

module.exports = router;