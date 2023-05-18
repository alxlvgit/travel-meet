const passport = require('passport');
const PassportConfig = require('./passport-config');

const localStrategy = require('./local-strategy');

const passportConfig = new PassportConfig([localStrategy]);

const passportMiddleware = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports = passportMiddleware;