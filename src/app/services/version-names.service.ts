import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from './auth.service';
import { ProjectsService } from './projects.service';
import { VersionNameType,
        VersionNamesResultType
} from '../types/version-name-types';


@Injectable()
export class VersionNamesService {
    private versionNames: any = {};

    constructor(private authService: AuthService, private projectsService: ProjectsService, private http: Http) { }

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
                this.projectsService.updateProjectVersionName(projectId, responseJson.versionName.id);
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

    deleteVersionName(versionNameId: string, projectId: string): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new Headers();
        headers.append('Authorization', 'Bearer ' + this.authService.getUser().token);
        const versionNameDeleteResult: Observable<any> = this.http.delete('api/version-names/' + versionNameId + '?project=' + projectId, {headers: headers})
            .map((response) => {
                return response.json();
            })
            .catch((e) => {
                return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
            });
        return versionNameDeleteResult;
    }

    setVersionNames(versionNames: Array<VersionNameType>): void {
        this.versionNames = versionNames;
    }

    mapVersionName(versionName: any): VersionNameType {
        return { id: versionName._id, adjective: versionName.adjective, animal: versionName.animal };
    }

}
