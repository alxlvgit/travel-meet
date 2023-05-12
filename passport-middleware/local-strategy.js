const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const localStrategy = new LocalStrategy(
    {
        usernameField: "email",
        passwordField: "password",
    },
    async (email, password, done) => {
        async function getUserByEmail(email) {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                return user;
            } catch (error) {
                console.log(error);
            }
        }
        const user = await getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: "Incorrect email." });
        }
        if (user.password !== password) {
            return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
    }
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
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
    const user = await getUserById(id);
    done(null, user);
});

const passportLocalStrategy = {
    name: 'local',
    strategy: localStrategy,
};

module.exports = passportLocalStrategy;