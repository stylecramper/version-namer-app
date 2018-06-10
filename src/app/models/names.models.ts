export class Animal {
    private _id: string;
    private _animal: string;

    constructor(id: string, animal: string) {
        this._id = id;
        this._animal = animal;
    }

    get id(): string {
        return this._id;
    }

    set id(theId: string) {
        this._id = theId;
    }

    get animal(): string {
        return this._animal;
    }

    set animal(theAnimal: string) {
        this._animal = theAnimal;
    }
}

export class Adjective {
    private _id: string;
    private _adjective: string;

    constructor(id: string, adjective: string) {
        this._id = id;
        this._adjective = adjective;
    }

    get id(): string {
        return this._id;
    }

    set id(theId: string) {
        this._id = theId;
    }

    get adjective(): string {
        return this._adjective;
    }

    set adjective(theAdjective: string) {
        this._adjective = theAdjective;
    }
}