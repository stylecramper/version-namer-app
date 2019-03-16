import { Injectable, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from './auth.service';
import { ErrorsService } from './errors.service';
import { ProjectType,
        ProjectsResultType
} from '../types/project-types';

@Injectable()
export class ProjectsService implements OnInit {
    private projects: Array<ProjectType> = [];

    constructor(private authService: AuthService, private errorsService: ErrorsService, private http: HttpClient) { }

    ngOnInit() {
        this.fetchProjects()
            .subscribe((res) => {
                console.log('#### fetchProjects result', res);
            });
    }
    // TODO: DRY these methods up?
    fetchProjects(): Observable<ProjectsResultType> {
        let projectsResult: Observable<any>;

        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no_login'));
        }
        if (this.projects.length === 0) {
            const headers = new HttpHeaders()
                .set('Authorization', 'Bearer ' + this.authService.getUser().token);
            projectsResult = this.http.get('api/projects', {headers: headers})
                .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
        } else {
            projectsResult = Observable.of({code: 'success', projects: this.projects});
        }
        return projectsResult;
    }

    createProject(project: object): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new HttpHeaders()
            .set('Authorization', 'Bearer ' + this.authService.getUser().token);
        return this.http.post('api/projects', {project: project}, {headers: headers})
            .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
    }

    editProjectName(project: ProjectType): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new HttpHeaders()
            .set('Authorization', 'Bearer ' + this.authService.getUser().token);
        return this.http.put('api/projects/' + project.id, {project: project}, {headers: headers})
            .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
    }

    deleteProject(projectId: string): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new HttpHeaders()
            .set('Authorization', 'Bearer ' + this.authService.getUser().token);
        const projectDeleteResult: Observable<any> = this.http.delete('api/projects/' + projectId, {headers: headers})
            .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
        return projectDeleteResult;
    }

    setProjects(projects: Array<ProjectType>): void {
        this.projects = projects;
    }

    getProjects(): Array<ProjectType> {
        return this.projects;
    }

    addProject(project: ProjectType): void {
        this.projects.push(project);
    }

    getProject(id: string): ProjectType {
        return this.projects.filter((project) => {
            return project.id === id;
        })[0];
    }

    updateProjectVersionName(projectId: string, versionNameId: string): void {
        this.projects.map((project) => {
            if (project.id === projectId) {
                project.current_version_name = versionNameId;
            }
        });
    }

}
