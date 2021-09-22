const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');
const { createUserToken } = require('../middleware/auth');

router.get('/', (req, res, next) => {
	User.find({})
		.then((user) => res.json(user))
		.catch(next);
});

// Allow users to SIGN UP for the app.
router.post('/signup', async (req, res, next) => {
	try {
		const firstName = req.body.firstName;
		const lastName = req.body.lastName;
		const email = req.body.email;
		const password = await bcrypt.hash(req.body.password, 10);
		const user = await User.create({ firstName, lastName, email, password });
		res.status(201).json(user);
	} catch (error) {
		return next(error);
	}
});

// Allow users to SIGN IN and receive a token for their login to use the app.
router.post('/login', (req, res, next) => {
	let foundUser;
	User.findOne({ email: req.body.email })
		.then((user) => {
			foundUser = user;
			return createUserToken(req, user);
		})
		.then((token) => res.json({ foundUser, token }))
		.catch(next);
});

module.exports = router;
