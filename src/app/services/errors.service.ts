import { Injectable } from '@angular/core';

@Injectable()
export class ErrorsService {
    private ERROR_TYPES: any;
    private ERROR_MESSAGES: any;

    constructor() {
        this.ERROR_TYPES = {
            USER: 'user_not_found',
            PROJECTS_GET: 'cannot_get_projects',
            PROJECT_NOT_FOUND: 'project_not_found',
            CANNOT_DELETE_PROJECT: 'cannot_delete_project',
            CANNOT_SAVE_USER: 'cannot_save_user'
        };
        this.ERROR_MESSAGES = {
            USER: 'We couldn\'t find that user. Try logging out and back in.',
            PROJECTS_GET: 'An error occurred while retrieving your projects. Please try again later.',
            PROJECT_NOT_FOUND: 'That project was not found.',
            CANNOT_DELETE_PROJECT: 'An error occurred while attempting to delete this project. Please try again later.',
            CANNOT_SAVE_USER: 'Saving your user data failed. You may continue to see this project in your list.',
            GENERIC: 'Sorry, some random weird thing happened. Please try again later.'
        };
    }

    getErrorMessage(type: string): string {
        let message;

        for (const messageType in this.ERROR_TYPES) {
            if (this.ERROR_TYPES[messageType] === type) {
                message = this.ERROR_MESSAGES[messageType];
            }
        }
        return (message) ? message: this.ERROR_MESSAGES.GENERIC;
    }

}
