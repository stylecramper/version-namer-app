import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/forkJoin';

import { Animal, Adjective, NamesType } from '../models/names.models';

@Injectable()
export class NamesService {
  private names: NamesType;

  constructor(private http: Http) { }

  fetchNames() {

    const animals: Observable<Animal[]> = this.http.get('/api/animals')
      .map(response => response.json())
      .map((objects: Array<any>) => {
        const animalsArray: Array<Animal> = [];
        if (objects) {
          objects.forEach((object) => {
            animalsArray.push(new Animal(object._id, object.animal));
          });
        }
        return animalsArray;
      })
      .catch((e) => {
        return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
      });

    const adjectives: Observable<Adjective[]> = this.http.get('/api/adjectives')
      .map(response => response.json())
      .map((objects: Array<any>) => {
        const adjectivesArray: Array<Adjective> = [];
        if (objects) {
          objects.forEach((object) => {
            adjectivesArray.push(new Adjective(object._id, object.adjective));
          });
        }
        return adjectivesArray;
      })
      .catch((e) => {
        return Observable.throw(new Error(`${ e.status } ${ e.statusText }`));
      });

    return Observable.forkJoin(animals, adjectives);
  }

  setNames(names: NamesType): void {
    this.names = names;
  }

  getNames(): NamesType {
    return this.names;
  }

}
