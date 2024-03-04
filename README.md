# Quick JS Compare

Comparing two values in JavaScript is a common task and simple in description, but issues with circular references, strict vs. abstract comparisons, key ordering, and performance can make the task surprisingly complicated and easy to get wrong.  For example, automated tests will often pass or fail based on inadequate comparison between expected and actual results, with differences rendered as long JSON strings that need to be sorted through manually.

Quick JS Compare is a utility library for performing quick comparisons between any two values in JavaScript or TypeScript. It directly supports comparison of primitive types, objects, Maps, and Sets, but can be tailored to compare any sort of data in any way. Flexibility is provided through an options object that accepts both parameters and callback functions, permitting you to specify comparison in any way that is needed.

Most of all, it's quick and lightweight.  Care is taken in the implementation to avoid redundant operations or unnecessary storage.  It also does not use JSON serialization or parsing in any operation.

For now, this is a WIP.  Feel free to give feedback on any topic from this README.

## Usage

- Use Yarn or NPM to install Quick JS Compare.
- In TypeScript or JavaScript, access the base method from the module:

```js
import { compare } from 'quick-js-compare'; // TypeScript, NodeJS
```
or
```js
const { compare } = require('quick-js-compare'); // Other JS
```

The method can be invoked as follows:

```js
const value1 = ....<any value>...;
const value2 = ...<any other value>...;

const comparison = compare(value1, value2);
```

The returned object will contain the following:
- `result`: result array, which by index contains:
  - 0: data in `value1` not matched in `value2`
  - 1: data in `value1` matched in `value2`
  - 2: data in `value2` matched in `value1`
  - 3: data in `value2` not matched in `value1`
- `status`:
  - `true`: if `value1` and `value2` matched
  - `false`: if `value1` and `value2` did not match
  - `undefined`: if result couls not be determined

How the comparisons are computed depends on the options used.

## Examples

### Primitives

Quick Object Compare will handle primitive values, such as `string`, `number`, or `boolean`.  A simple use case shows its default behavior (no options):

```js
const value1 = 'hello';
const value2 = 'world';

const result = compare(value1, value2);
console.log(JSON.stringfy(result, null, 2));
```

will result in:

```js
{
  "result": [
    "hello",
    undefined,
    undefined,
    "world"
  ],
  "status": false
}
```

### Objects (Property/Value)

The default behavior for the comparison of two objects will be to compare keys/value pairs, without respect to order of keys.

```js
const value1 = { a: 1, b: 'abc', x: 5, c: 'def', details: { title: 'Shopping list', cost: 2.14 }};
const value2 = { b: 'abc', a: 2, c: 'def', details: { title: 'Shopping list', cost: 2.9 }}; }

const result = compare(value1, value2);
console.log(JSON.stringfy(result, null, 2));
```

will result in:

```js
{
  "result": [
    {
      "a": 1,
      "x": 5,
      "details": {
        "cost": 2.14
      }
    },
    {
      "b": "abc",
      "c": "def",
      "details": {
        "title": "Shopping list"
      }
    },
    {
      "b": "abc",
      "c": "def",
      "details": {
        "title": "Shopping list"
      }
    },
    {
      "a": 2,
      "details": {
        "cost": 2.9
      }
    }
  ],
  "status": false
}
```

## Options

Quick JS Compare accepts an options structure to customize the comparison behavior and to provide formatting and output choices:

Compare options:

  * `compare`: "`Strict`" | "`General`"* | options | function
  * `compareValue`: "`strict`"* | "`abstract`" | "`ignore`" | function
  * `compareObject`: "`reference`" | "`keyValueOrder`" | "`keyValue`"* | "`keyOrder`" | "`keyOnly`" | "`valueOnly`" | "`ignore`" | function
  * `compareCollection`: "`reference`" | "`valueOrder`" | "`valueOnly`"* | "`sizeOnly`" | "`ignore`" | function


### Explanations

* Strict
  * - compare using `===` for primitives (i.e., type and value)
  * - compare by type, order, values for object
  * - compare by index, value for collection

  * compare
  * `compareValue`: "`strict`"
  * `compareObject`: "`keyValueOrder`"
  * `compareCollection`: "`indexValue`"

* General (default)
  * - compare using `==` for primitives (can compare only in value)
  * - compare by key/value for object (order insignificant)
  * - compare by order, value for collection

  * `compareValue`: "`abstract`"
  * `compareObject`: "`keyValue`"
  * `compareCollection`: "`valueOnly`"

* `Structure`:
  * `compareValue`: "`ignore`"
  * `compareObject`: "`keyOnly`"
  * `compareCollection`: "`sizeOnly`"


* `render`: "`Standard`" | "`Verbose`" | options | function

* `Standard`:
  * `mapAsObject`: true
  * `setAsArray`: true
  * `maxDepth`: 0
  * `same`: false
  * `report`: false

* `Verbose`:
  * `mapAsObject`: true
  * `setAsArray`: true
  * `maxDepth`: 0
  * `same`: true
  * `report`: true


## Examples (TBD)

Here are some examples demonstrating various comparison scenarios:

```javascript
// Add examples here
```

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
