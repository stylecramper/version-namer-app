import { Injectable, OnInit } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from './auth.service';
import { ProjectType,
        ProjectsResultType,
        VersionNameType,
        VersionNamesResultType
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

    fetchVersionNames(projectId: string): Observable<VersionNamesResultType> {
        let versionNamesResult: Observable<any>;

        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        if (!this.versionNames.hasOwnProperty(projectId)) {
            const headers = new Headers();
            headers.append('Authorization', 'Bearer ' + this.authService.getUser().token);
            versionNamesResult = this.http.get('api/version-names/' + projectId, {headers: headers})
                .map((response) => {console.log('#### fetchVersionNames response', response);
                    const responseJson = response.json();
                    responseJson.versionNames = responseJson.versionNames.map(this.mapVersionName);
                    this.versionNames[projectId] = responseJson.versionNames;
                    return responseJson;
                })
                .catch((e) => {console.log('#### api/version-names/:id error', e);
                    return Observable.of(new Error(`${ e.status } ${ e.statusText }`));
                });
        } else {
            versionNamesResult = Observable.of({code: 'success', versionNames: this.versionNames[projectId]});
        }
        return versionNamesResult;
    }

    // TODO: add types
    saveVersionName(projectId: string, versionName: object): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new Headers();
        headers.append('Authorization', 'Bearer ' + this.authService.getUser().token);
        const versionNameResult: Observable<any> = this.http.post('api/version-names/' + projectId, {versionName: versionName}, {headers: headers})
            .map((response) => {
                const responseJson = response.json();console.log('#### responseJson', responseJson);
                this.updateProjectVersionName(projectId, responseJson.versionName.id);
                if (!this.versionNames.hasOwnProperty(projectId)) {
                    this.versionNames[projectId] = [];
                }
                this.versionNames[projectId].push(responseJson.versionName);
                return responseJson;
            })
            .catch((e) => {console.log('### createVersionName error', e);
                return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
            });
        return versionNameResult;
    }

    mapVersionName(versionName: any): VersionNameType {
        return { id: versionName._id, adjective: versionName.adjective, animal: versionName.animal };
    }

    updateProjectVersionName(projectId: string, versionNameId: string): void {
        this.projects.map((project) => {
            if (project.id === projectId) {
                project.current_version_name = versionNameId;
            }
        });
    }

}
