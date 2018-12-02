import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { AuthService } from './auth.service';
import { ErrorsService } from './errors.service';
import { ProjectsService } from './projects.service';
import { VersionNameType,
        VersionNamesResultType
} from '../types/version-name-types';


@Injectable()
export class VersionNamesService {
    private versionNames: any = {};

    constructor(private authService: AuthService, private errorsService: ErrorsService, private projectsService: ProjectsService, private http: HttpClient) { }

    fetchVersionNames(projectId: string): Observable<VersionNamesResultType> {
        let versionNamesResult: Observable<any>;

        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        if (!this.versionNames.hasOwnProperty(projectId)) {
            const headers = new HttpHeaders()
                .set('Authorization', 'Bearer ' + this.authService.getUser().token);
            versionNamesResult = this.http.get('api/version-names/' + projectId, {headers: headers})
                .map((response: any) => {
                    response.versionNames = response.versionNames.map(this.mapVersionName);
                    this.versionNames[projectId] = response.versionNames;
                    return response;
                })
                .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
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
        const headers = new HttpHeaders()
            .set('Authorization', 'Bearer ' + this.authService.getUser().token);
        const versionNameResult: Observable<any> = this.http.post('api/version-names/' + projectId, {versionName: versionName}, {headers: headers})
            .map((response: any) => {
                this.projectsService.updateProjectVersionName(projectId, response.versionName.id);
                if (!this.versionNames.hasOwnProperty(projectId)) {
                    this.versionNames[projectId] = [];
                }
                this.versionNames[projectId].push(response.versionName);
                return response;
            })
            .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
        return versionNameResult;
    }

    deleteVersionName(versionNameId: string, projectId: string): Observable<any> {
        if (!this.authService.isLoggedIn()) {
            return Observable.throw(new Error('no-login'));
        }
        const headers = new HttpHeaders()
            .set('Authorization', 'Bearer ' + this.authService.getUser().token);
        return this.http.delete('api/version-names/' + versionNameId + '?project=' + projectId, {headers: headers})
            .catch((err) => this.errorsService.errorWithAuthStatusCheck(err));
    }

    setVersionNames(versionNames: Array<VersionNameType>): void {
        this.versionNames = versionNames;
    }

    mapVersionName(versionName: any): VersionNameType {
        return { id: versionName._id, adjective: versionName.adjective, animal: versionName.animal };
    }

}
