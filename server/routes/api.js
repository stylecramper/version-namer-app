/* jslint esversion: 6 */
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mongodb = require('mongodb');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const app = express();
app.use(bodyParser.json());

const globals = require('./config/globals');
const jwtCheck = globals.jwtCheck;

const AnimalSchema = new Schema({
    animal: String
});
const Animal = mongoose.model('Animal', AnimalSchema);

const AdjectiveSchema = new Schema({
    adjective: String
});
const Adjective = mongoose.model('Adjective', AdjectiveSchema);

const userController = require('./modules/user/user.controller');

const projectsController = require('./modules/project/project.controller');

const versionNameController = require('./modules/version-name/version-name.controller');

mongoose.connect('mongodb://localhost/VERSION_NAMES');

mongodb.MongoClient.connect('mongodb://localhost:27017/VERSION_NAMES', function(error, database) {
    if (error) {
        console.log('error:', error);
        process.exit(1);
    }
    db = database;
    console.info('Database connection ready');

});

/* ----------- ********* ------------
                PROJECTS
   ----------- ********* ------------ */

router.get('/projects', jwtCheck, (req, res) => {
    projectsController.getProjects(req, res);
});

router.post('/projects', jwtCheck, (req, res) => {
    projectsController.createProject(req, res);
});

router.delete('/projects/:id', jwtCheck, (req, res) => {
    projectsController.deleteProject(req, res);
});

/* ----------- ********* ------------
            VERSION NAMES
   ----------- ********* ------------ */

router.get('/version-names/:id', jwtCheck, (req, res) => {
    versionNameController.getVersionNames(req, res);
});

router.post('/version-names/:id', jwtCheck, (req, res) => {
    versionNameController.createVersionName(req, res);
});

router.delete('/version-names/:id', jwtCheck, (req, res) => {
    versionNameController.deleteVersionName(req, res);
});

/* ----------- ********* ------------
                USERS
   ----------- ********* ------------ */

router.post('/users', (req, res) => {
    userController.register(req, res);
});

router.post('/login', (req, res) => {
    userController.login(req, res);
});

/* ----------- ********* ------------
                PUBLIC
   ----------- ********* ------------ */

router.get('/animals', (req, res) => {

    Animal.find({}, function(error, animals) {
        res.set('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(animals));
    });
    
});

router.get('/adjectives', (req, res) => {

    Adjective.find({}, function(error, adjectives) {
        res.set('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify(adjectives));
    });
    
});

router.get('/*', (req, res) => {
    res.redirect('../');
});

module.exports = router;