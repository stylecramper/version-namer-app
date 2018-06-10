import { Component, OnInit } from '@angular/core';

import { NavigationComponent } from './../navigation/navigation.component';
import { NamesService } from '../services/names.service';
import { Animal, Adjective } from '../models/names.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  names: Array<Animal[] | Adjective[]> = [];

  constructor(private namesService: NamesService) { }

  ngOnInit() {
    this.namesService.getNames()
      .subscribe(names => {
        this.names = names;
      });
  }

}
