const passport = require('passport');

class PassportConfig {
    constructor(strategies) {
        this.addStrategies(strategies);
    }

    addStrategies(strategies) {
        strategies.forEach(passportStrategy => {
            passport.use(passportStrategy.name, passportStrategy.strategy);
        });
    }
}

module.exports = PassportConfig;