const bcrypt = require('bcrypt');

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
            res
                .status(500)
                .json({ code: 'error', message: 'cannot_save_user' });
            return;
        }
        res
            .status(200)
            .json({ code: 'success', user: user._id });
    });
};

module.exports = {
    register: register
};
