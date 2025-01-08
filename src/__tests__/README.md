# Tests

Unit tests use [Jest](https://jestjs.io/) to achieve comprehensive code coverage. Tests prioritize common use cases before addressing more complex configurations.

## Test configuration in this project

Per `jest.config.ts` and `tsconfig.json` at the root of this project:

* test files must be named `*.test.ts` in order for them to be recognized by Jest
* test files may be placed anywhere but are preferred to be placed under the directory that contains this `README.md`
* test files are not packaged or distributed

## Test file naming conventions

In this directory, tests are expected to being with a three-digit sequence and a name that describes its purpose.  Here are the conventions to use so far:

* `000`: Validate Jest configuration
* `001` - `099`: Validate foundational operations (construction, type checking, etc.)
* `101` - `199`: Comparisons with stock configurations
* `201` - `299`: Comparisons with user-configurations
* `301` - `399`: Rendering use cases
* ...
* `901` - `999`: Bug fix validations (if not fitting above)

## Running the tests locally

### Setup

The first time you run these tests, use `npm` or `yarn` to install Jest locally via peer dependencies.

```sh
# npm
npm i --save-dev
# or Yarn
yarn add --dev
```

### Execution

Use `npm` or `yarn` to run the tests and generate a coverage report:

```sh
# npm
npm run test
# or Yarn
yarn test
```

A coverage directory will be created at the root of the project with various reports and artifacts.  You can see a navigable version of the full report in HTML by opening `coverage/lcov-report/index.html` in your browser.

## Note to developers - tests are not optional

Developers are welcome to submit pull requests for bug fixes or suggested changes, but they must include unit tests to cover any and all new functionality.  Pull requests, however straightforward, will not be accepted without them.  

If you just find a bug but do not want to fix the code yourself, it's perfectly fine to submit a PR with only a new unit test that exposes the bug. You will be given credit!
