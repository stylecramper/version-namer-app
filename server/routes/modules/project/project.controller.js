const sanitizeHtml = require('sanitize-html');
const Project = require('./project.model').Project;
const User = require('../user/user.model').User;
const ProjectVersionName = require('../version-name/version-name.model').ProjectVersionName;

const getProjects = (req, res) => {
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
};

const createProject = (req, res) => {
    const cleanProjectName = sanitizeHtml(req.body.project.projectname, {
        allowedTags: [],
        allowedAttributes: {}
    });
    if (cleanProjectName === '') {
        res
            .status(500)
            .json({ code: 'error', message: 'cannot_create_project' });
        return;
    }
    const project = {
        project_name: cleanProjectName,
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
                        .status(201)
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
};

const renameProject = (req, res) => {
    console.log('RENAME project', req.body.project);
    const cleanProjectName = sanitizeHtml(req.body.project.name, {
        allowedTags: [],
        allowedAttributes: {}
    });
    if (cleanProjectName === '') {
        res
            .status(500)
            .json({ code: 'error', message: 'cannot_rename_project' });
        return;
    }
    Project.findById(req.params.id, 'project_name').exec((err, projectfound) => {
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
        projectfound.project_name = cleanProjectName;
        projectfound.save((err) => {
            if (err) {
                res
                    .status(500)
                    .json({ code: 'error', message: 'cannot_rename_project' });
                return;
            }
            res
                .status(201)
                .json({ code: 'success', project: { id: projectfound._id, name: projectfound.project_name } });
        });
    });
};

const deleteProject = (req, res) => {
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
};

function reflect(promise){
    return promise.then(function(v){ return {value:v, status: 'resolved' }; },
                        function(e){ return {err:e, status: 'rejected' }; });
}

module.exports = {
    getProjects: getProjects,
    createProject: createProject,
    renameProject: renameProject,
    deleteProject: deleteProject
};
