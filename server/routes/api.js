/* jslint esversion: 6 */
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mongodb = require('mongodb');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

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

const User = require('../routes/modules/user/user.model').User;

const registerUser = require('./modules/user/user.controller').register;
const loginUser = require('./modules/user/user.controller').login;

const Project = require('../routes/modules/project/project.model').Project;

const getProjects = require('./modules/project/project.controller').getProjects;
const createProject = require('./modules/project/project.controller').createProject;
const deleteProject = require('./modules/project/project.controller').deleteProject;

const getVersionNames = require('./modules/version-name/version-name.controller').getVersionNames;

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
    getProjects(req, res);
});

router.post('/projects', jwtCheck, (req, res) => {
    createProject(req, res);
});

router.delete('/projects/:id', jwtCheck, (req, res) => {
    deleteProject(req, res);
});

/* ----------- ********* ------------
            VERSION NAMES
   ----------- ********* ------------ */

router.get('/version-names/:id', jwtCheck, (req, res) => {
    getVersionNames(req, res);
});

router.post('/version-names/:id', jwtCheck, (req, res) => {
    const projectVersionName = {
        adjective: req.body.versionName.adjective._adjective,
        animal: req.body.versionName.animal._animal,
        created_at: new Date(),
        updated_at: new Date()
    };
    ProjectVersionName.create(projectVersionName)
        .then((pvn) => {console.log('new project version name', pvn);
            Project.findById(req.params.id).then((projectfound) => {
                projectfound.project_version_names = projectfound.project_version_names.concat([pvn._id]);
                projectfound.current_project_version_name = pvn._id;
                projectfound.save((err) => {console.log('### project save error', err);
                    if (err) {
                        res
                        .status(500)
                        .json({ code: 'error', message: 'cannot_save_project' });
                        return;
                    }
                    res
                    .status(200)
                    .json({ code: 'success', versionName: { id: pvn._id, adjective: pvn.adjective, animal: pvn.animal } });
                });
            }, (err) => {
                res
                .status(500)
                .json({ code: 'error', message: 'project_not_found' });
            });
        }, (err) => {
            res
            .status(500)
            .json({ code: 'error', message: 'cannot_create_version_name' });
        });
});

router.delete('/version-names/:id', jwtCheck, (req, res) => {
    console.log('DELETE version-name', req.params.id);
    console.log('FROM project', req.query.project);
    // TODO: improve error responses
    ProjectVersionName.findByIdAndRemove(req.params.id, (err, docs) => {
        if (err) {
            res
                .status(500)
                .json({ code: 'error', message: 'cannot_delete_version_name' });
            return;
        }
        Project.findById(req.query.project).then((projectfound) => {
            projectfound.project_version_names = projectfound.project_version_names.filter((pvn) => {
                return pvn.toString() !== req.params.id;
            });
            if (projectfound.current_project_version_name.toString() === req.params.id) {
                // deleted version name was current version name
                projectfound.current_project_version_name = projectfound.project_version_names[projectfound.project_version_names.length - 1];
            }
            projectfound.save((err) => {
                if (err) {
                    res
                    .status(500)
                    .json({ code: 'error', message: 'cannot_save_project' });
                    return;
                }
                res
                .status(200)
                .json({ code: 'success', versionNameId: req.params.id, versionName: `${docs.adjective} ${docs.animal}` });
            });
        }, (err) => {
            res
            .status(500)
            .json({ code: 'error', message: 'project_not_found' });
        });
    });
});

/* ----------- ********* ------------
                USERS
   ----------- ********* ------------ */

router.post('/users', (req, res) => {
    registerUser(req, res);
});

router.post('/login', (req, res) => {
    loginUser(req, res);
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