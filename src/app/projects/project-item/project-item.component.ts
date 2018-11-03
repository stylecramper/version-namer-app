import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ProjectType } from '../../types/project-types';

@Component({
    selector: 'app-project-item',
    templateUrl: './project-item.component.html',
    styleUrls: ['./project-item.component.css']
})
export class ProjectItemComponent {
    @Input() project: ProjectType;
    @Output() openedConfirmDialog = new EventEmitter<ProjectType>();
    @Output() edited = new EventEmitter<ProjectType>();

    openConfirmDialog(project: ProjectType): void {
        this.openedConfirmDialog.emit(project);
    }

    editVersionNames(project: ProjectType): void {
        this.edited.emit(project);
    }
}
