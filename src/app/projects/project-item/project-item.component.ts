import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ProjectType } from '../../types/project-types';

@Component({
    selector: 'app-project-item',
    templateUrl: './project-item.component.html',
    styleUrls: ['./project-item.component.css']
})
export class ProjectItemComponent {
    private editMode = false;
    @Input() project: ProjectType;
    @Output() openedConfirmDialog = new EventEmitter<ProjectType>();
    @Output() editedVersionNames = new EventEmitter<ProjectType>();
    @Output() renamed = new EventEmitter<ProjectType>();
    @Output() startedEditing = new EventEmitter<ProjectType>();

    openConfirmDialog(project: ProjectType): void {
        this.openedConfirmDialog.emit(project);
    }

    editVersionNames(project: ProjectType): void {
        this.editedVersionNames.emit(project);
    }

    editProjectName(project: ProjectType): void {
        this.renamed.emit(project);
    }

    onKey(event: KeyboardEvent, project: ProjectType): void {
    if (event.key === 'Escape') {
        this.setEditMode(false);
        return;
    }
        if (event.key === 'Enter') {
            this.editProjectName(project);
        }
    }

    public setEditMode(onState: boolean, project?: ProjectType): void {
        this.editMode = onState;
        if (this.editMode) {
            this.startedEditing.emit(project);
        }
    }
}
