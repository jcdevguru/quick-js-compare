# Quick JS Compare

Comparing two values in JavaScript is a common task and simple in description, but issues with circular references, strict vs. abstract comparisons, key ordering, and performance can make the task surprisingly complicated and easy to get wrong.  For example, automated tests will often pass or fail based on inadequate comparison between expected and actual results, with differences rendered as long JSON strings that need to be sorted through manually.

Quick JS Compare is a utility library for performing quick comparisons between any two values in JavaScript or TypeScript. It directly supports comparison of scalar types, objects, Maps, and Sets, but can be tailored to compare any sort of data in any way. Flexibility is provided through an options object that accepts both parameters and callback functions, permitting you to specify comparison in any way that is needed.

Most of all, it's quick and lightweight.  Care is taken in the implementation to avoid redundant operations or unnecessary storage.  It also does not use JSON serialization or parsing in any operation.

For now, this is a WIP.  Feel free to give feedback on any topic from this README.

## Usage

- Use Yarn or NPM to install Quick JS Compare.
- In TypeScript or JavaScript, access the base method from the module:

```ts
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

### Directly supported types

The broad categories of data supported in this package are ones whose primary use is to hold data.  These types include the native data types defined in the [ES2020+ spec](https://tc39.es/ecma262/2020/) and are categorized as follows:

* **Scalar**: Instances of data that have a single value. Scalar values supported in this package are:
  * `string` - character values, e.g., `"abc"`
  * `number` - [numeric values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) expressed in 64-bit binary format, e.g, `0`, `-2`, `3.1416`
  * `boolean` - `true` or `false`
  * `undefined` - value `undefined`, i.e., no meaningful value
  * `bigint` - [numeric values too large](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) to be represented as 64 bits
  * `Date` - The native `Date` object - i.e., created with the `Date` constructor

* **Composite**: Instances of data that have multiple values. Composite values supported in this package:
  * "Standard" or record objects, i.e., those expressed in object literal notation as `{ <string-property1>: <value1>, <string-property2>: <value2> }`
  * Array objects, i.e., a collection of values indexed by whole numbers, those expressed in object literal notation as `[<value1>, <value2>]`
  * Map objects, i.e., objects created by ECMA's `Map` constructor
  * Set object, i.e., objects created by ECMA's `Set` constructor
  * Function objects, which hold values through specific properties

Because this package provides comparison only and is meant for practical use, types of data are categorized around their behavior in representing data and not around their formal definitions.  For example, data of type `string` or `Date` can be said to hold multiple values, but are compared as scalars, since most JavaScript programming works with these types as single values.  Or, although a function is primarily used for programming, its capacity to hold values as propeties makes it supportable as a composite data type.

The returned object will contain the following.  Values are determined to be exclusive, differing, or the same between the values by the comparison methods that are applied.  In all cases, a `result` object will be returned with the following fields:

* `leftOnly`: (composite values only) data only in `value1`
* `left`: data in `value1` that differs from `value2`.
* `leftSame`: data in `value1` that is the same as `value2`.
* `rightSame`: data in `value2` that is the same as `value1`.
* `right`: data in `value2` that differs from `value1`.
* `rightOnly`: (composite values only) data only in `value2`

Each of these fields are arrays of objects that describe the comparison results that contain at least the type and value of the compared item.  If there is no result, the field is not included.

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
  "left": [
    {
      "typeName": "string",
      "value": "hello"
    }
  ],
  "right": [
    {
      "typeName": "string",
      "value": "world"
    }
  ]
}
```

//TODO - need more

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
    * `"typeOnly"`: match when identical in type only, without comparing values
    * `"ignore"`: do not compare objects
    * *function*: use function to compare (see below)

  * `compareMap`: for comparison of objects of type `Map`, e.g., created from `new Map([['a', 1],['b', 2]])`
    Same settings and default as `compareObject`. 

  * `compareArray`: for comparison of array objects, e.g., `[1, 7, 'a', true]`
    * `"reference"`: match only when identical as references, i.e., when compared arrays are references to the same object in memory
    * `"indexValue"`: match when compared arrays have matching in the same positions (same as `valueOrder` when neither array is sparse)
    * `"valueOrder"`*: match when compared arrays have matching values in the same order 
    * `"valueOnly"`: match when compared arrays have matching values, regardless of their order
    * `"indexOnly"`: match when compared arrays have same indexes (same as `sizeOnly` when neither array is sparse)
    * `"sizeOnly"`: match when compared arrays have matching number of elements, regardless of their contents
    * `"typeOnly"`: match when identical in type only, without comparing values
    * `"ignore"`: do not compare objects
    * *function*: use function to compare (see below)

  * `compareSet`: for comparison of objects of type `Set`, e.g., created from `new Set([1, 7, 'a', true])`
    * `"reference"`: match only when identical as references, i.e., when compared sets are references to the same object in memory
    * `"valueOnly"`*: match when compared sets have matching values
    * `"sizeOnly"`: match when compared arrays have matching number of elements, regardless of their contents
    * `"typeOnly"`: match when identical in type only, without comparing values
    * `"ignore"`: do not compare objects
    * *function*: use function to compare (see below)
  
  * If `compareMap` is omitted, objects of type `Map` will be compared according to settings in `compareObject`
  * If `compareSet` is omitted, objects of type `Set` will be compared according to settings in `compareArray`

In all cases, a comparison operation may be supplied as a function whose job is to compare the two arguments, and return `true` if considered the same, `false` if considered different, or `undefined` if it cannot be determined.  The two arguments may be assumed to be of compatible types when called.  // TODO - pass options to function?  Object??

#### Options as strings

String values for the `compare` option behave as shorthand helpers for a style of comparison.  Their function is described by their equivalent representations in the previously described option object.

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

* `Structure`: compare for identical structure by comparing only the keys of keyed objects and sizes of collection objects
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
