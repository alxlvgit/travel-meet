const express = require("express");
const { url } = require("inspector");
const passport = require("passport");
const { forwardAuthenticated, ensureAuthenticated } = require("../passport-middleware/check-auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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


const router = express.Router();

// Set Multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/login", forwardAuthenticated, (req, res) => {
    const errorMessages = (req.session).messages;
    if (errorMessages && !req.user) {
        const mostRecentErrorMessage = errorMessages[errorMessages.length - 1];
        res.render("login", { errorMessage: mostRecentErrorMessage });
    } else {
        res.render("login", { errorMessage: null });
    }
})

router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/auth/login",
        failureMessage: true
    }), (req, res) => {
        res.redirect("/");
    }
);

router.get("/logout", ensureAuthenticated, (req, res) => {
    req.logout((err) => {
        if (err) console.log(err);
    });
    console.log("user logged out");
    res.redirect("/auth/login");
});

router.get("/signup", forwardAuthenticated, (req, res) => {
    const errorMessages = req.session.messages;
    if (errorMessages && !req.user) {
        const mostRecentErrorMessage = errorMessages[errorMessages.length - 1];
        req.session.messages = [];
        res.render("signup", { errorMessage: mostRecentErrorMessage });
    } else {
        res.render("signup", { errorMessage: null });
    }
});

router.post("/signup", forwardAuthenticated, upload.single("icon"), async (req, res) => {
    const userData = req.body;
    if (!req.file) {
        req.session.messages = ["No image uploaded. Please upload an image before creating the post."];
        res.redirect("/auth/signup");
        return;
    }
    try {
        const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
        const buffer = await sharp(req.file.buffer)
            .rotate()
            .resize({ width: 800, height: 800, fit: "inside" })
            .toBuffer();
        const params = {
            Bucket: bucketName,
            Key: randomImageName(),
            Body: buffer,
            ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(params);
        await s3.send(command);
        // check if user already exists
        const userExists = await prisma.user.findUnique({
            where: {
                email: userData.email
            }
        });
        if (userExists) {
            req.session.messages = ["User already exists. Please login."];
            res.redirect("/auth/login");
            return;
        }
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                profileImageURI: params.Key,
                profileImageName: userData.name,
                profileImageCaption: userData.name,
            }
        });
        res.redirect("/auth/login");
    }
    catch (error) {
        console.log(error);
        res.redirect("/auth/signup");
    }
});


module.exports = router;