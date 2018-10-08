const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectVersionNameSchema = new Schema({
    adjective: { type: String, required: true },
    animal:  { type: String, required: true },
    created_at: Date,
    updated_at: Date
});
ProjectVersionNameSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});

module.exports = { ProjectVersionName: mongoose.model('ProjectVersionName', ProjectVersionNameSchema) };
