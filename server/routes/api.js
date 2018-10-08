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

const ProjectVersionNameSchema = new Schema({
    adjective: { type: String, required: true },
    animal:  { type: String, required: true },
    created_at: Date,
    updated_at: Date
});
const ProjectVersionName = mongoose.model('ProjectVersionName', ProjectVersionNameSchema);

[ProjectVersionNameSchema].forEach(function setPreSaveBehaviour(model) {
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

function reflect(promise){
    return promise.then(function(v){ return {value:v, status: 'resolved' }; },
                        function(e){ return {err:e, status: 'rejected' }; });
}

/* ----------- ********* ------------
                PROJECTS
   ----------- ********* ------------ */

router.get('/projects', jwtCheck, (req, res) => {
    // TODO: deal with user not being found?
    User.findById(req.user.id, 'projects').exec((err, docs) => {
        if (err) {
            res
                .status(401)
                .json({ code: 'error', message: 'user_not_found' });
            return;
        }
        Project.find({
            '_id': { $in: docs.projects }
        }, (err, userProjects) => {
            let projectsList;

            if (err) {
                console.log('Projects fetching error: ', err);
                res
                    .status(500)
                    .json({ code: 'error', message: 'cannot_get_projects' });
                return;
            }
            projectsList = userProjects.map((project) => {
                return {
                    id: project._id,
                    name: project.project_name,
                    current_version_name: project.current_project_version_name
                };
            });
            res
                .status(200)
                .json({ code: 'success', projects: projectsList });
        });
    });
});

router.post('/projects', jwtCheck, (req, res) => {
    const project = {
        project_name: req.body.project.projectname,
        project_version_names: [],
        current_project_version_name: null,
        created_at: new Date(),
        updated_at: new Date()
    };
    Project.create(project)
        .then((proj) => {
            User.findById(req.user.id).then((userfound) => {
                userfound.projects = userfound.projects.concat([proj._id]);
                userfound.save((err) => {console.log('### user save error', err);
                    if (err) {
                        res
                            .status(500)
                            .json({ code: 'error', message: 'create_project_cannot_save_user' });
                        return;
                    }
                    res
                        .status(200)
                        .json({ code: 'success', project: { id: proj._id, name: proj.project_name, current_version_name: null } });
                });
            })
            .catch((err) => {
                res
                .status(500)
                .json({ code: 'error', message: 'user_not_found' });
            });
        })
        .catch((err) => {
            res
                .status(500)
                .json({ code: 'error', message: 'cannot_create_project' });
        });
});

router.delete('/projects/:id', jwtCheck, (req, res) => {
    console.log('DELETE project', req.params.id);
    let promises = [];

    Project.findById(req.params.id, 'project_name project_version_names').exec((err, docs) => {
        let error;

        if (err) {console.log('#### err', err.name + ', ' + err.kind);
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                error = { code: 'error', message: 'project_not_found' };
            } else {
                error = { code: 'error', message: 'generic_error' };
            }
            res
                .status(500)
                .json(error);
            return;
        }
        promises.push(ProjectVersionName.find({
            '_id': { $in: docs.project_version_names }
        }).exec((err, docs) => {
            docs.map((name) => {console.log('#### deleting name', name._id);
                ProjectVersionName.findByIdAndRemove(name._id, (err, name) => {
                    // not critical error if project's version names are not deleted
                });
            });
        }));
        promises.push(Project.findByIdAndRemove(req.params.id).exec());
        promises.push(User.findById(req.user.id).exec((err, userfound) => {
            if (!err) {
                userfound.projects = userfound.projects.filter((project) => {
                    return project.toString() !== req.params.id;
                });
                userfound.save();
            }
        }));
        Promise.all(promises.map(reflect)).then(function(results){
            if (results[1].status === 'rejected') {
                console.log('Project.findByIdAndRemove err', results[1].err);
                error = { code: 'error', message: 'cannot_delete_project' };
                res.status(500).json(error);
                return;
            }
            if (results[2].status === 'rejected') {
                console.log('### User.findById err', results[2].err);
                error = { code: 'error', message: 'user_not_found' };
                res.status(500).json(error);
                return;
            }
            res.status(200).json({ code: 'success', projectId: req.params.id, projectName: docs.project_name });
        });
    });
});

/* ----------- ********* ------------
            VERSION NAMES
   ----------- ********* ------------ */

router.get('/version-names/:id', jwtCheck, (req, res) => {
    Project.findById(req.params.id, 'project_version_names').exec((err, docs) => {
        if (err) {console.log('#### err', err.name + ', ' + err.kind);
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                res
                .status(500)
                .json({ code: 'error', message: 'project_not_found' });
                return;
            }
            res
            .status(500)
            .json({ code: 'error', message: 'generic_error' });
            return;
        }
        ProjectVersionName.find({
            '_id': { $in: docs.project_version_names }
        }, null, { sort: 'created_at' }, (err, docs) => {
            if (err) {
                res
                .status(500)
                .json({ code: 'error', message: 'cannot_get_version_names' });
                return;
            }
            res
            .status(200)
            .json({ code: 'success', versionNames: docs });
        });
    });
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