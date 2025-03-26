# README #

Please stick to a [git flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow.

## fcd-assistant ##

The frontend for the AI interactions subsystem using Angular v19.
The aim will be to integrate this subsystem into the patholens project later on.

### How do I get set up? ###

Install [Node.js](https://nodejs.org/en) v22.12.0 (LTS version).

If you are using a UNIX system, using [nvm](https://github.com/nvm-sh/nvm) is highly recommended to install nodejs, to avoid permission problems.

Install [Angular](https://angular.dev/installation) on your system via `npm install -g @angular/cli`.

Once nodejs and Angular is installed, move into the root folder of the Angular project (`fcd-assistant/`) in the terminal and run `npm install` to install all needed dependencies.

Finally you can start the frontend server with `ng serve`.


# FcdAssistant

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
