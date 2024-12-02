# Quick JS Compare

Comparing two values in JavaScript is a common task and simple in description, but issues with circular references, strict vs. abstract comparisons, key ordering, and performance can make the task surprisingly complicated and easy to get wrong.  For example, automated tests will often pass or fail based on inadequate comparison between expected and actual results, with differences rendered as long JSON strings that need to be sorted through manually.

Quick JS Compare is a utility library for performing quick comparisons between any two values in JavaScript or TypeScript. It directly supports comparison of scalar types, objects, Maps, and Sets, but can be tailored to compare any sort of data in any way. Flexibility is provided through an options object that accepts both parameters and callback functions, permitting you to specify comparison in any way that is needed.

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

### Scalars

Quick Object Compare will handle scalar types (i.e., data stores with only one value, such as `number`, `boolean`, or `string`).  A simple use case shows its default behavior (no options):

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

Quick JS Compare accepts an `options` argument to customize the comparison and data rendering behavior (`*` denotes default setting).

```js
{
  compare: <object> | "Exact"* | "General" | "ExactStructure" | "GeneralStructure" | <function>
  render: <object> | "Standard"* | "Verbose" | <function>
}
```

When there is no options argument, the default values for `compare` and `render` are `Exact` and `Standard` (see below).

### `compare` option property

The following settings are supported as values for the `compare` property.  When omitted, the default setting will be `General` (see below).

#### Options as object

The following combinations of properties and values are supported when options for comparison are specified in an object, e.g.,

```js
{
  compareScalar: "strict",
  compareObject: "keyValueOrder",
  ...
}
```

  * `"compareScalar"`: for comparison of scalar values (e.g., `"number"`, `"boolean"`, or `"string"`)
    * `"strict"`*: match only when identical in both value and type, i.e., as with `"==="`
    * `"abstract"`: match when identical or when functionally equivalent, i.e., as with `"=="`
    * `"typeOnly"`: match when identical in type only, without comparing values
    * `"ignore"`: do not compare scalar values
    * *function*: use function to compare (see below)

  * `compareObject`: for comparison of standard objects with named keys, e.g., `{ a: 1, b: 2 }`
    * `"reference"`: match only when identical as references, i.e., when compared objects are references to the same object in memory
    * `"keyValueOrder"`*: match when compared objects have matching key/value pairs in identical order 
    * `"keyValue"`: match when compared objects have matching key/value pairs, regardless of order
    * `"keyOrder"`: match when compared objects have matching keys in the same order, regardless of their values
    * `"valueOrder"`: match when compared objects have matching values in the same order, regardless of their keys 
    * `"keyOnly"`: match when compared objects have matching keys, regardless of their order or their values 
    * `"valueOnly"`: match when compared objects have matching values, regardless of their order or their keys 
    * `"ignore"`: do not compare objects
    * *function*: use function to compare (see below)

  * `compareMap`: for comparison of objects of type `Map`, e.g., created from `new Map([['a', 1],['b', 2]])`
    Same settings as `compareObject`. 

  * `compareArray`: for comparison of array objects, e.g., `[1, 7, 'a', true]`
    * `"reference"`: match only when identical as references, i.e., when compared arrays are references to the same object in memory
    * `"valueOrder"`*: match when compared arrays have matching values in the same order 
    * `"valueOnly"`: match when compared arrays have matching values, regardless of their order
    * `"sizeOnly"`: match when compared arrays have matching number of elements, regardless of their contents
    * `"ignore"`: do not compare objects
    * *function*: use function to compare (see below)

  * `compareSet`: for comparison of objects of type `Set`, e.g., created from `new Set([1, 7, 'a', true])`
    Same settings as `compareArray`, but the default will be `valueOnly`, since elements in a Set have an undefined order.

  * If `compareMap` is omitted, objects of type `Map` will be compared according to settings in `compareObject`
  * If `compareSet` is omitted, objects of type `Set` will be compared according to settings in `compareArray`

  TODO: explain functions

#### Options as strings

String values for the `compare` option behave as shorthand for a style of comparison.  Their function is described by their equivalent representations in the previously described option object.


* `Exact`: (default) compare for identical match in type, value, and structure. True when the two objects can be used interchangeably.
  * `compareScalar`: `"strict"`
  * `compareObject`: `"keyValueOrder"`
  * `compareArray`: `"valueOrder"`
  * `compareMap`: `"keyValueOrder"`
  * `compareSet`: `"valueOnly"`

* `General`: compare for functional equivalence
  * `compareScalar`: `"abstract"`
  * `compareObject`: `"keyValue"`
  * `compareArray`: `"valueOnly"`
  * `compareMap`: `"keyValue"`
  * `compareSet`: `"valueOnly"`

* `Structure`: compare for identical structure by comparing only the types and keys of keyed objects and sizes of collection objects
  * `compareScalar`: `"ignore"`
  * `compareObject`: `"keyOnly"`
  * `compareArray`: `"sizeOnly"`
  * `compareMap`: `"keyOnly"`
  * `compareSet`: `"sizeOnly"`

### Render options

The following properties are supported in an option object passed through the `render` property.

* `render`: 
  * `mapAsObject`: boolean
  * `setAsArray`: boolean
  * `maxDepth`: number
  * `same`: boolean
  * `report`: boolean

(TODO: explain render options.)
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
