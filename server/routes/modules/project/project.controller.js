const Project = require('./project.model').Project;
const User = require('../user/user.model').User;

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

module.exports = {
    getProjects: getProjects
};
