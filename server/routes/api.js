const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongodb = require('mongodb');

const ANIMALS_COLLECTION = 'animals';
const ADJECTIVES_COLLECTION = 'adjectives';
const PROJECTS_COLLECTION = 'projects';
const USERS_COLLECTION = 'users';
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

router.get('/projects', jwtCheck, (req, res) => {
    // TODO: deal with user not being found?
    User.findById(req.user.id, 'projects').exec((err, projects) => {
        Project.find({
            '_id': { $in: projects.projects }
        }, (err, userProjects) => {
            let projectsList;

            if (err) {
                console.log('Projects fetching error: ', err);
                res.status(200).send(JSON.stringify({ code: 'error' }));
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
            .send(JSON.stringify({ code: 'success', projects: projectsList }));
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
                        res.status(200).send(JSON.stringify({ code: 'error' }));
                    } else {
                        res.status(200).send(JSON.stringify({ code: 'success', project: { id: proj._id, name: proj.project_name, current_version_name: null } }));
                    }
                });
            });
        });
});

router.delete('/projects/:id', jwtCheck, (req, res) => {
    console.log('DELETE project', req.params.id);
    // TODO: improve error responses
    Project.findById(req.params.id, 'project_version_names').exec((err, docs) => {
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
                                error = {code: 'version_name_deletion_error'};
                            }
                        });
                    });
                    Project.findByIdAndRemove(req.params.id, (err, project) => {
                        if (err) {
                            error = {code: 'project_deletion_error'};
                        }
                    });
                }
            });
        }
        if (error) {
            res
                .status(200)
                .send(JSON.stringify(error));
            return;
        }
        res.status(200).send(JSON.stringify({ code: 'success', projectId: req.params.id }));
    });
});

router.get('/version-names/:id', jwtCheck, (req, res) => {
    Project.findById(req.params.id, 'project_version_names').exec((err, docs) => {
        if (err) {console.log('#### err', err.name + ', ' + err.kind);
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                res
                .status(200)
                .send(JSON.stringify({ code: 'project_id_error' }));
            } else {
                res
                .status(200)
                .send(JSON.stringify({ code: 'generic_error' }));
            }
        } else {
            ProjectVersionName.find({
                '_id': { $in: docs.project_version_names }
            }, (err, docs) => {
                if (err) {
                    res.status(200).send(JSON.stringify({ code: 'error' }));
                } else {
                    res
                    .status(200)
                    .send(JSON.stringify({ code: 'success', versionNames: docs }));
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
                        res.status(200).send(JSON.stringify({ code: 'error' }));
                    } else {
                        res.status(200).send(JSON.stringify({ code: 'success', versionName: { id: pvn._id, adjective: pvn.adjective, animal: pvn.animal } }));
                    }
                })
            });
        });
});

router.delete('/version-names/:id', jwtCheck, (req, res) => {
    console.log('DELETE version-name', req.params.id);
    console.log('FROM project', req.query.project);
    // TODO: improve error responses
    ProjectVersionName.findByIdAndRemove(req.params.id, (err, name) => {
        if (err) {
            res
                .status(200)
                .send(JSON.stringify({code: 'version_name_deletion_error'}));
            return;
        }
        Project.findById(req.query.project).then((projectfound) => {
            projectfound.project_version_names = projectfound.project_version_names.filter((pvn) => {
                return pvn._id !== req.params.id;
            });
            projectfound.save((err) => {
                if (err) {
                    res.status(200).send(JSON.stringify({ code: 'save_project_error' }));
                } else {
                    res.status(200).send(JSON.stringify({ code: 'success', versionNameId: req.params.id }));
                }
            });
        });
    });
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
            res.send(JSON.stringify({ code: 'error' }));
        } else {
            res.send(JSON.stringify({ code: 'success', user: user._id }));
        }
    });
});

router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }, '_id firstname email password salt', (err, user) => {
        if (err) {
            res.send(JSON.stringify({ code: 'generic_error' }));
        } else {
            if (user === null) {
                res.send(JSON.stringify({ code: 'unknown_email' }));
            } else {
                if (bcrypt.hashSync(req.body.password, user.salt) === user.password) {
                    // user is valid, log them in
                    const token = jwt.sign({
                        id: user._id,
                        username: user.username
                    }, SECRET_KEY, {expiresIn: '3 hours'});
                    // save token for user
                    res
                        .status(200)
                        .send({ name: user.firstname, access_token: token });
                } else {
                    res.send(JSON.stringify({ code: 'incorrect_password' }));
                }
            }
        }
    });
});

router.post('/logout', (req, res) => {
    User.findOne({ token: req.body.token }, (err, user) => {
        if (err) {
            res.send(JSON.stringify({ code: 'generic_error' }));
        } else {
            if (user === null) {
                res.send(JSON.stringify({ code: 'generic_error' }));
            } else {
                user.update({ token: null }).exec();
                res
                    .status(200)
                    .send(JSON.stringify({ code: 'success' }));
            }
        }
    });
});

router.get('/*', (req, res) => {
    res.redirect('../');
});

module.exports = router;