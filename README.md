# Version Name Generator

Do you have one or more software projects? Have you always admired Ubuntu Linux's witty version names (Breezy Badger)? This tool helps you create and track those version names for your projects.

This project was created in 2018 by @stylecramper (Matt Anderson).

## Getting Started

First, install dependencies. You'll need Node and NPM, as well as MongoDB (version 3.6.8 recommended). Instructions for installing those can be found at [Treehouse Installation Guides](https://treehouse.github.io/installation-guides/). Be sure to create the `/data/db` directory.

Run the local MongoDB: in a terminal, type `mongod`. Then to connect to the local MongoDB, open a new tab or window and type `mongo`.

## Seeding the database with fixtures

In your terminal, `cd` to the root folder and install node modules by running `npm install`. Now run `node scaffold` to create the VERSION_NAMES database and insert the provided default set of animal names and adjectives. After the data is inserted into the database, you should see the message `### VERSION_NAMES database created. DONE inserting animals and adjectives.` in the terminal output.

## Build the project

In the root folder, enter `npm run build` to bundle and build the project.

## Start the server

In the root folder, enter `npm run serve` in the terminal to start the server. You can now point your browser to [http://localhost:3000/](http://localhost:3000/) to register, sign in, and start creating projects.

## Demo here:
[https://version-namer-app.herokuapp.com/home](https://version-namer-app.herokuapp.com/home)