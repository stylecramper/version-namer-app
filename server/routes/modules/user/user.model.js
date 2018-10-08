const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    projects: [ObjectId],
    created_at: Date,
    updated_at: Date
});
UserSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});

module.exports = { User: mongoose.model('User', UserSchema) };
