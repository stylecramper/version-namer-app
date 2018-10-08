const Project = require('../project/project.model').Project;
const ProjectVersionName = require('./version-name.model').ProjectVersionName;

const getVersionNames = (req, res) => {
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
};

const createVersionName = (req, res) => {
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
};

const deleteVersionName = (req, res) => {
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
};

module.exports = {
    getVersionNames: getVersionNames,
    createVersionName: createVersionName,
    deleteVersionName: deleteVersionName
};
