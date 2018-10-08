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

module.exports = {
    getVersionNames: getVersionNames
};
