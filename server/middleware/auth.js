const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Some secret used to encrypt/decrypt the jsonwebtoken
const secret = process.env.JWT_SECRET || 'Go WildCats! Woof!';

// We want to include the specific 'strategy' we will use to authenticate from 'passport-jwt'
const { Strategy, ExtractJwt } = require('passport-jwt');

const options = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: secret,
};

const User = require('../models/user');

const strategy = new Strategy(opts, function (jwt_payload, done) {
	User.findById(jwt_payload.id)
		.then((user) => done(null, user))
		.catch((err) => done(err));
});

passport.use(strategy);

passport.initialize();

const requireToken = passport.authenticate('jwt', { session: false });

const createUserToken = (req, user) => {
	if (
		!user ||
		!req.body.password ||
		!bcrypt.compareSync(req.body.password, user.password)
	) {
		const err = new Error('The provided email or password is incorrect.');
		err.statusCode = 422;
		throw err;
	}
	return jwt.sign({ id: user._id }, secret, { expiresIn: '24h' });
};

module.exports = {
	requireToken,
	createUserToken,
};
