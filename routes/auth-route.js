const express = require("express");
const passport = require("passport");
const { forwardAuthenticated, ensureAuthenticated } = require("../passport-middleware/check-auth");

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
    res.redirect("/auth/login");
});

module.exports = router;