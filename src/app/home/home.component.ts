import { Component, OnInit } from '@angular/core';

import { NamesService } from '../services/names.service';
import { NamesType } from '../models/names.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  names: NamesType;

  constructor(private namesService: NamesService) { }

  ngOnInit() {
    this.namesService.fetchNames()
      .subscribe(namesArray => {
        this.names = { animals: namesArray[0], adjectives: namesArray[1] };
        this.namesService.setNames(this.names);
      });
  }

}
