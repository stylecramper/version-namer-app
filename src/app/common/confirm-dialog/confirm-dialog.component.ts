import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
    private modalTitle = '';

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.modalTitle = data.title;
    }
}
