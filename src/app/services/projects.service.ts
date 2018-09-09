import { Injectable, OnInit } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from './auth.service';
import { ProjectType,
        ProjectsResultType
} from '../types/project-types';

@Injectable()
export class ProjectsService implements OnInit {
    private projects: Array<ProjectType> = [];
    private versionNames: any = {};

    constructor(private authService: AuthService, private http: Http) { }

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
            return Observable.throw(new Error('no-login'));
        }
        if (this.projects.length === 0) {
            const headers = new Headers();
            headers.append('Authorization', 'Bearer ' + this.authService.getUser().token);
            projectsResult = this.http.get('api/projects', {headers: headers})
                .map(response => response.json())
                .catch((e) => {
                    return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
                });
        } else {
            projectsResult = Observable.of({code: 'success', projects: this.projects});
        }
        return projectsResult;
    }

    createProject(project: object): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new Headers();
        headers.append('Authorization', 'Bearer ' + this.authService.getUser().token);
        const projectResult: Observable<any> = this.http.post('api/projects', {project: project}, {headers: headers})
            .map((response) => {
                this.versionNames = [];
                return response.json();
            })
            .catch((e) => {
                return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
            });
        return projectResult;
    }

    deleteProject(projectId: string): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new Headers();
        headers.append('Authorization', 'Bearer ' + this.authService.getUser().token);
        const projectDeleteResult: Observable<any> = this.http.delete('api/projects/' + projectId, {headers: headers})
            .map((response) => {
                return response.json();
            })
            .catch((e) => {
                return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
            });
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
