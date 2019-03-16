const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const globals = require('../../config/globals');
const User = require('./user.model').User;

const register = (req, res) => {
    const newSalt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(req.body.password, newSalt);
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        salt: newSalt,
        projects: [],
        created_at: new Date(),
        updated_at: new Date()
    });
    user.save((err) => {console.log('### err', err);
        if (err) {
            if (err.message.includes('duplicate key') && err.message.includes('email')) {
                res
                    .status(500)
                    .json({ code: 'error', message: 'duplicate_email' });
                return;
            }
            res
                .status(500)
                .json({ code: 'error', message: 'cannot_save_user' });
            return;
        }
        res
            .status(201)
            .json({ code: 'success', user: user._id });
    });
};

const login = (req, res) => {
    User.findOne({ email: req.body.email }, '_id firstname email password salt', (err, user) => {
        if (err) {
            res
                .status(500)
                .json({ code: 'error', message: 'generic_error' });
            return;
        }
        if (user === null) {
            res
                .status(401)
                .json({ code: 'error', message: 'unknown_email' });
            return;
        }
        if (bcrypt.hashSync(req.body.password, user.salt) === user.password) {
            // user is valid, log them in
            const token = jwt.sign({
                id: user._id,
                username: user.username
            }, globals.SECRET_KEY, {expiresIn: '3 hours'});
            res
                .status(200)
                .json({ code: 'success', name: user.firstname, access_token: token });
            return;
        }
        res
            .status(401)
            .json({ code: 'error', message: 'incorrect_password' });
    });
};

module.exports = {
    register: register,
    login: login
};
