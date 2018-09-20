/* jslint esversion: 6 */
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongodb = require('mongodb');

const SECRET_KEY = '998cf65a-1f0f-4325-81ea-315b08aec537';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const app = express();
app.use(bodyParser.json());

const jwtCheck = expressjwt({
    secret: SECRET_KEY
});

let db;

const AnimalSchema = new Schema({
    animal: String
});
const Animal = mongoose.model('Animal', AnimalSchema);

const AdjectiveSchema = new Schema({
    adjective: String
});
const Adjective = mongoose.model('Adjective', AdjectiveSchema);

const ProjectVersionNameSchema = new Schema({
    adjective: String,
    animal: String,
    created_at: Date,
    updated_at: Date
});
const ProjectVersionName = mongoose.model('ProjectVersionName', ProjectVersionNameSchema);

const ProjectSchema = new Schema({
    project_name: String,
    project_version_names: [ObjectId],
    current_project_version_name: ObjectId,
    created_at: Date,
    updated_at: Date
});
const Project = mongoose.model('Project', ProjectSchema);

const UserSchema = new Schema({
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    token: String,
    projects: [ObjectId],
    created_at: Date,
    updated_at: Date
});
const User = mongoose.model('User', UserSchema);

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

/* ----------- ********* ------------
                PROJECTS
   ----------- ********* ------------ */

router.get('/projects', jwtCheck, (req, res) => {
    // TODO: deal with user not being found?
    User.findById(req.user.id, 'projects').exec((err, docs) => {
        Project.find({
            '_id': { $in: docs.projects }
        }, (err, userProjects) => {
            let projectsList;

            if (err) {
                console.log('Projects fetching error: ', err);
                res.status(200).json(JSON.stringify({ code: 'error' }));
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
            .json(JSON.stringify({ code: 'success', projects: projectsList }));
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
                        res.status(200).json(JSON.stringify({ code: 'error' }));
                    } else {
                        res.status(200).json(JSON.stringify({ code: 'success', project: { id: proj._id, name: proj.project_name, current_version_name: null } }));
                    }
                });
            });
        });
});

router.delete('/projects/:id', jwtCheck, (req, res) => {
    console.log('DELETE project', req.params.id);
    // TODO: improve error responses
    Project.findById(req.params.id, 'project_name project_version_names').exec((err, docs) => {
        let error;

        if (err) {console.log('#### err', err.name + ', ' + err.kind);
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                error = { code: 'project_id_error' };
            } else {
                error = { code: 'generic_error' };
            }
        } else {
            ProjectVersionName.find({
                '_id': { $in: docs.project_version_names }
            }, (err, docs) => {
                if (err) {
                    error = { code: 'error' };
                } else {
                    docs.map((name) => {console.log('#### deleting name', name._id);
                        ProjectVersionName.findByIdAndRemove(name._id, (err, name) => {
                            if (err) {
                                error = { code: 'version_name_deletion_error' };
                            }
                        });
                    });
                    Project.findByIdAndRemove(req.params.id, (err, project) => {
                        if (err) {
                            error = { code: 'project_deletion_error' };
                        }
                    });
                    User.findById(req.user.id).then((userfound) => {
                        userfound.projects = userfound.projects.filter((project) => {
                            return project.toString() !== req.params.id;
                        });
                        userfound.save((err) => {
                            if (err) {
                                error = { code: 'user_save_error' };
                            }
                        });
                    });
                }
            });
        }
        if (error) {
            res
                .status(200)
                .json(JSON.stringify(error));
            return;
        }
        res.status(200).json(JSON.stringify({ code: 'success', projectId: req.params.id, projectName: docs.project_name }));
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
                .status(200)
                .json(JSON.stringify({ code: 'project_id_error' }));
            } else {
                res
                .status(200)
                .json(JSON.stringify({ code: 'generic_error' }));
            }
        } else {
            ProjectVersionName.find({
                '_id': { $in: docs.project_version_names }
            }, null, { sort: 'created_at' }, (err, docs) => {
                if (err) {
                    res.status(200).json(JSON.stringify({ code: 'error' }));
                } else {
                    res
                    .status(200)
                    .json(JSON.stringify({ code: 'success', versionNames: docs }));
                }
            });
        }
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
                        res.status(200).json(JSON.stringify({ code: 'error' }));
                    } else {
                        res.status(200).json(JSON.stringify({ code: 'success', versionName: { id: pvn._id, adjective: pvn.adjective, animal: pvn.animal } }));
                    }
                })
            });
        });
});

router.delete('/version-names/:id', jwtCheck, (req, res) => {
    console.log('DELETE version-name', req.params.id);
    console.log('FROM project', req.query.project);
    // TODO: improve error responses
    ProjectVersionName.findByIdAndRemove(req.params.id, (err, docs) => {
        if (err) {
            res
                .status(200)
                .json(JSON.stringify({code: 'version_name_deletion_error'}));
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
                    res.status(200).json(JSON.stringify({ code: 'save_project_error' }));
                } else {
                    res.status(200).json(JSON.stringify({ code: 'success', versionNameId: req.params.id, versionName: `${docs.adjective} ${docs.animal}` }));
                }
            });
        });
    });
});

/* ----------- ********* ------------
                USERS
   ----------- ********* ------------ */

router.post('/users', (req, res) => {
    const newSalt = bcrypt.genSaltSync(5);
    const hash = bcrypt.hashSync(req.body.password, newSalt);
    const user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        salt: newSalt,
        token: null,
        projects: [],
        created_at: new Date(),
        updated_at: new Date()
    });
    user.save((err) => {console.log('### err', err);
        if (err) {
            res.json(JSON.stringify({ code: 'error' }));
        } else {
            res.json(JSON.stringify({ code: 'success', user: user._id }));
        }
    });
});

router.post('/login', (req, res) => {
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
            }, SECRET_KEY, {expiresIn: '3 hours'});
            // save token for user
            res
                .status(200)
                .json({ code: 'success', name: user.firstname, access_token: token });
            return;
        }
        res
            .status(401)
            .json({ code: 'error', message: 'incorrect_password' });
    });
});

router.post('/logout', (req, res) => {
    User.findOne({ token: req.body.token }, (err, user) => {
        if (err) {
            res.json(JSON.stringify({ code: 'generic_error' }));
        } else {
            if (user === null) {
                res.json(JSON.stringify({ code: 'generic_error' }));
            } else {
                user.update({ token: null }).exec();
                res
                    .status(200)
                    .json(JSON.stringify({ code: 'success' }));
            }
        }
    });
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