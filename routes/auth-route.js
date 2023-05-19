const express = require("express");
const { url } = require("inspector");
const passport = require("passport");
const { forwardAuthenticated, ensureAuthenticated } = require("../passport-middleware/check-auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

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
    const errorMessages = (req.session).messages;
    if (errorMessages && !req.user) {
        const mostRecentErrorMessage = errorMessages[errorMessages.length - 1];
        res.render("signup", { errorMessage: mostRecentErrorMessage });
    } else {
        res.render("signup", { errorMessage: null });
    }
});

router.post("/signup", forwardAuthenticated, async (req, res) => {
    const userData = req.body;
    console.log(userData);
    try {
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                profileImageURI: userData.icon,
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