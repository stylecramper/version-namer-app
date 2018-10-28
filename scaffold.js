'use strict';

const adjectives = require('./src/assets/adjectives');
const animals = require('./src/assets/animals');

const Db = require('mongodb').Db;
const Server = require('mongodb').Server;

var db = new Db('VERSION_NAMES', new Server('localhost', 27017));

db.open((err, db) => {
    if (err) {
        console.log('### database open error', err.message);
        return;
    }
    
    db.createCollection('adjectives', (err, collection) => {
        if (err) {
            console.log('### createCollection error', err.message);
            return;
        }
        adjectives.forEach(newAdjective => collection.insert({ adjective: newAdjective }));
    });
    db.createCollection('animals', (err, collection) => {
        if (err) {
            console.log('### createCollection error', err.message);
            return;
        }
        animals.forEach((newAnimal, idx) => {
            collection.insert({ animal: newAnimal }, (err, result) => {
                if (err) {
                    console.log('### insert error', err.message);
                    return;
                }
                collection.count()
                    .then(countResult => {
                        if (idx === countResult - 1) {
                            console.log('### VERSION_NAMES database created. DONE inserting animals and adjectives.');
                            db.close();
                        }
                    });
            });
        });
    });
});
