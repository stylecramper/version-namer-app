type ResponseCode = 'success'|'error';
interface UserResponseType {
    code: ResponseCode;
    user: string;
}

export class RegisterResponse implements UserResponseType {
    private _code: ResponseCode;
    private _user: string;

    constructor(code: ResponseCode, user: string) {
        this._code = code;
        this._user = user;
    }

    get user(): string {
        return this._user;
    }

    get code(): ResponseCode {
        return this._code;
    }

    
}
