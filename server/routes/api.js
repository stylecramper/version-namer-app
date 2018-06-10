const express = require('express');
var bodyParser = require('body-parser');
const router = express.Router();
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;

var ANIMALS_COLLECTION = 'animals';
var ADJECTIVES_COLLECTION = 'adjectives';
var PROJECTS_COLLECTION = 'projects';
var USERS_COLLECTION = 'users';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var app = express();
app.use(bodyParser.json());

var db;

var AnimalSchema = new Schema({
    animal: String
});
var Animal = mongoose.model('Animal', AnimalSchema);

var AdjectiveSchema = new Schema({
    adjective: String
});
var Adjective = mongoose.model('Adjective', AdjectiveSchema);

var ProjectVersionNameSchema = new Schema({
    adjective: String,
    animal: String,
    created_at: Date,
    updated_at: Date
});
var ProjectVersionName = mongoose.model('ProjectVersionName', ProjectVersionNameSchema);

var ProjectSchema = new Schema({
    project_name: String,
    project_version_names: [ProjectVersionNameSchema],
    current_project_version_name: ObjectId,
    created_at: Date,
    updated_at: Date
});
var Project = mongoose.model('Project', ProjectSchema);

var UserSchema = new Schema({
    name: String,
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    projects: [ProjectSchema],
    created_at: Date,
    updated_at: Date
});
var User = mongoose.model('User', UserSchema);

[ProjectSchema, ProjectVersionNameSchema, UserSchema].forEach(function setPreSaveBehaviour(model) {
    model.pre('save', function(next) {
        var currentDate = new Date();
        this.updated_at = currentDate;
        if (!this.created_at) {
            this.created_at = currentDate;
        }
        next();
    });
});


mongoose.connect('mongodb://localhost/VERSION_NAMES');

mongodb.MongoClient.connect('mongodb://localhost:27017/VERSION_NAMES', function(error, database) {
    if (error) {
        console.log('error:', error);
        process.exit(1);
    }
    db = database;
    console.info('Database connection ready');

});

router.get('/animals', (req, res) => {
    var animals;

    Animal.find({}, function(error, animals) {
        animals = animals;
        res.send(JSON.stringify(animals));
    });
    
});

router.get('/adjectives', (req, res) => {
    var adjectives;

    Adjective.find({}, function(error, adjectives) {
        adjectives = adjectives;
        res.send(JSON.stringify(adjectives));
    });
    
});

router.get('/*', (req, res) => {
    res.redirect('../');
});

module.exports = router;