# Quick JS Compare

Comparing two values in JavaScript is a common task, but issues with circular references, strict vs conventional comparisons, key ordering, and performance can make the task surprisingly complicated and easy to get wrong.  For example, automated tests will often pass or fail based on inadequate comparison between expected and actual results, with differences rendered as long JSON strings that need to be sorted through manually.

Quick JS Compare is a utility library for performing quick comparisons between two values in JavaScript or TypeScript. It directly supports comparison of primitive types, objects, Maps, and Sets, but can be tailored to compare any sort of data in any way. Flexibility is provided through an options structure that accepts both parameters and callback functions, permitting you to specify comparison in any way that is needed.

Most of all, it's quick and lightweight.  Care is taken in the implementation to avoid redundant operations, excessive object storage, or unnecessary recursion.  It also does not use JSON serialization or parsing in any place.

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

```javascript
const value1 = 'hello';
const value2 = 'world';

const result = compare(value1, value2);
```

The result object will contain the following:

- `left`: data in first parameter not matched by the second
- `right`: data in the second parameter not matched by the first
- `status`: `true` if parameters compared equal, `false` otherwise

If there were no differences, the `left` and `right` values will have the value `null` and `status` will be `true`.

### Primitives

A simple use case shows its default behavior (no options):

```js
const value1 = 'hello';
const value2 = 'world';

const result = compare(value1, value2);
console.log(JSON.stringfy(result, null, 2));
```

will result in:

```js
{
  "left": "hello",
  "right": "world",
  "status": false
}
```

### Objects (Property/Value)

The default behavior for the comparison of two objects will be to compare keys/value pairs, without respect to order of keys.

```js
const value1 = { a: 1, b: 'abc', x: 5, c: 'def' details: { title: 'Shopping list', cost: 2.14 }};
const value2 = { b: 'abc', a: 2, c: 'def', details: { title: 'Shopping list', cost: 2.9 }}; }

const result = compare(value1, value2);
console.log(JSON.stringfy(result, null, 2));
```

will result in:

```js
{
  "left": {
    "a": 1,
    "x": 5,
    "details": {
      "cost": 2.14
    }
  },
  "right": {
    "a": 2,
    "details": {
      "cost": 2.9
    }
  },
  "status": false
}
```

## Options

Quick JS Compare accepts an options structure to customize the comparison behavior. Available options include:

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
