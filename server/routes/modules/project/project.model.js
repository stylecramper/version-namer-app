const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ProjectSchema = new Schema({
    project_name: String,
    project_version_names: [ObjectId],
    current_project_version_name: ObjectId,
    created_at: Date,
    updated_at: Date
});

ProjectSchema.pre('save', function(next) {
    var currentDate = new Date();
    this.updated_at = currentDate;
    if (!this.created_at) {
        this.created_at = currentDate;
    }
    next();
});

module.exports = { Project: mongoose.model('Project', ProjectSchema) };
