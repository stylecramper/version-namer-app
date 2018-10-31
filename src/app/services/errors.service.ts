import { Injectable } from '@angular/core';

@Injectable()
export class ErrorsService {
    private ERROR_MAP: any;

    constructor() {
        this.ERROR_MAP = {
            'user_not_found':                   'We couldn\'t find that user. Try logging out and back in.',
            'cannot_get_projects':              'An error occurred while retrieving your projects. Please try again later.',
            'project_not_found':                'That project was not found.',
            'cannot_create_project':            'An error occurred while saving this project. Please try again later.',
            'cannot_delete_project':            'An error occurred while attempting to delete this project. Please try again later.',
            'create_project_cannot_save_user':  'Saving your user data failed. You may not see this project in your list.',
            'cannot_save_user':                 'Apologies - we couldn\'t register you. Please try again later.',
            'duplicate_email':                  'That email has already been used. Have you registered before?',
            'unknown_email':                    'We don\'t know that email',
            'incorrect_password':               'That password is incorrect',
            'cannot_get_version_names':         'An error occurred while retrieving your project\'s version names. Please try again later.',
            'cannot_create_version_name':       'An error occurred while saving this version name. Please try again later.',
            'cannot_delete_version_name':       'An error occurred while attempting to delete this version name. Please try again later.',
            'cannot_save_project':              'An error occurred while saving this project. Please try again later.',
            'generic':                          'Sorry, some random weird thing happened. Please try again later.'
        };
    }

    getErrorMessage(type: string): string {
        return (this.ERROR_MAP[type]) ? this.ERROR_MAP[type] : this.ERROR_MAP['generic'];
    }

}
