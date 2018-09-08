import { Component, OnInit, HostListener } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, ActivatedRoute } from '@angular/router';

import { NamesService } from './../services/names.service';
import { Animal, Adjective } from '../models/names.models';
import { ProjectsService } from './../services/projects.service';
import { ProjectType, VersionNameType } from './../types/project-types';

@Component({
  selector: 'app-version-names',
  templateUrl: './version-names.component.html',
  styleUrls: ['./version-names.component.css'],
  animations: [
    trigger('adjectiveState', [
      state('in', style({
        left: '30px',
        'font-size': '50px',
        top: '20%'
      })),
      transition(':enter', [
        style({left: '-240px', 'font-size': '10px', top: '100%'}),
        animate('1000ms 200ms cubic-bezier(0.075, 0.82, 0.165, 1)')
      ]),
      transition(':leave',
        animate('1000ms 100ms cubic-bezier(0.6, 0.04, 0.98, 0.335)', style({left: '-240px', 'font-size': '10px', top: '100%'}))
      )
    ]),
    trigger('animalState', [
      state('in', style({
        right: '30px',
        'font-size': '50px',
        top: '20%'
      })),
      transition(':enter', [
        style({right: '-240px', 'font-size': '10px', top: '100%'}),
        animate('1000ms 200ms cubic-bezier(0.075, 0.82, 0.165, 1)')
      ]),
      transition(':leave',
        animate('1000ms 100ms cubic-bezier(0.6, 0.04, 0.98, 0.335)', style({right: '-240px', 'font-size': '10px', top: '100%'}))
      )
    ]),
    trigger('buttonState', [
      state('in', style({
        opacity: 1
      })),
      transition(':enter', [
        style({opacity: 0}),
        animate('200ms')
      ]),
      transition(':leave', 
        animate('200ms', style({opacity: 0})))
      ])
  ]
})
export class VersionNamesComponent implements OnInit {
  project: ProjectType;
  versionNames: Array<VersionNameType> = [];
  error = '';
  dashboardOpen = false;
  wordsAreIn = false;
  adjective: Adjective;
  animal: Animal;
  animationState: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private namesService: NamesService,
    private projectsService: ProjectsService
  ) {
    this.animationState = 'inactive';
  }

  ngOnInit() {
    const projectId = this.route.snapshot.params['id'];
    this.project = this.projectsService.getProject(projectId);
    this.projectsService.fetchVersionNames(projectId)
        .subscribe((data) => {console.log('## ngOnInit data', data);
          if (data.code === 'project_id_error') {
            this.error = 'projectId';
          } else if (data.code === 'generic_error') {
            this.error = 'generic';
          } else {
            this.versionNames = data.versionNames;
          }
        });
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeDashboard();
    }
  }

  hasVersionNames(): boolean {
    return this.versionNames.length > 0;
  }

  createVersionName(): void {
    const names = this.namesService.getNames();
    this.adjective = names.adjectives[Math.floor(Math.random() * names.adjectives.length)];
    this.animal = names.animals[Math.floor(Math.random() * names.animals.length)];
  }

  showVersionName(): void {
    this.createVersionName();
    this.dashboardOpen = true;
    this.animationState = 'active';
  }

  closeDashboard(): void {
    this.dashboardOpen = false;
    this.wordsAreIn = false;
  }

  animationDone(event): void {
    if (event.fromState === 'in') {
      this.createVersionName();
      this.animationState = 'active';
      return;
    }
    this.wordsAreIn = true;
  }

  saveNewVersionName(): void {
    const payload = { animal: this.animal, adjective: this.adjective };
    this.projectsService.saveVersionName(this.project.id, payload)
      .subscribe((data) => {console.log('#### saveVersionName data', data);
          if (data.code === 'success') {
            this.project.current_version_name = data.versionName.id;
            this.closeDashboard();
          } else {
            // TODO: error handling
          }
      });
  }

  deleteName(name: VersionNameType): void {
    if (confirm('WAIT! Are you sure you want to delete this version name?')) {

    }
  }

  nextName(): void {
    this.wordsAreIn = false;
    this.animationState = 'inactive';
  }

  isCurrentVersionName(versionName: VersionNameType): boolean {
    return this.project.current_version_name === null || versionName.id === this.project.current_version_name
  }

}
