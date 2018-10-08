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

const createProject = (req, res) => {
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
};

module.exports = {
    getProjects: getProjects,
    createProject: createProject
};
