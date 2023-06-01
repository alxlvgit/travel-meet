const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// This function is used by passport.authenticate to get the user from the database
async function findUserByEmailAndPassword(email, password) {
    const userFoundByEmail = await findUserByEmail(email);
    if (!userFoundByEmail) {
        return null;
    }
    const bcryptPrefix = /^\$2b\$/;
    const passwordIsHashed = bcryptPrefix.test(userFoundByEmail.password);
    // For older test accounts, the password is not hashed, so we need to compare the plain text password
    let passwordVerified = passwordIsHashed ? await bcrypt.compare(password, userFoundByEmail.password) : password === userFoundByEmail.password;
    if (!passwordVerified) {
        return null;
    }
    return userFoundByEmail;
}

// This function is used by findUserByEmailAndPassword to get the user from the database
async function findUserByEmail(email) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            return null;
        }
        return user;
    } catch (error) {
        console.log(error);
    }
}

// This function is used by passport.deserializeUser to get the user from the database
async function getUserById(id) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        return user;
    } catch (error) {
        console.log(error);
    }
}

// Passport local strategy
const localStrategy = new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
    },
    async (email, password, done) => {
        const user = await findUserByEmailAndPassword(email, password);
        if (!user) {
            return done(null, false, { message: "Incorrect email or password." });
        }
        return done(null, user);
    }
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    const user = await getUserById(id);
    done(null, user);
});

const passportLocalStrategy = {
    name: 'local',
    strategy: localStrategy,
};

module.exports = passportLocalStrategy;