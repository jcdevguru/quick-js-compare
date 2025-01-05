# Quick JS Compare

Let's start with a joke.

> A JavaScript developer asked his girlfriend why she was mad at him. She told him it was because she thought he had lied. "I asked you if you had a lot of girlfriends before me, and you answered "one." You've had at least five!"  The JavaScript developer was confused. "That wasn't a lie," he said. "I said it was true!"

If you don't get this joke, you have obviously never had to compare two values in JavaScript. If you do get this joke, continue reading.

## Problem statement: how comparing two JavaScript values can be ... awful

The need to compare two values in JavaScript is a frequent requirement in software engineering and testing, and often seems easy to the point of being trivial. Unfortunately, this is not the case, and for many reasons. Because JavaScript is not a strongly typed language, values can often compare and function equivalently when they actually are different, and a comparison between two values can mislead in either direction. Even when issues around typing are accommodated, more issues can arise that are not easily predicted until code is in production. Sometimes, problems will arise due to undefined ordering of keys or values, or inconsequential values appearing within objects that will flag inequality when they really should be ignored. There are also the questions of circular references, deep vs. shallow comparisons, and performance that can dog how effective or practical a comparison operation can be. Often, the results of comparing two JavaScript values can lead to the problem of "too much or not enough" - significant differences are overlooked when lost in the noise of many other inconsequential differences. For example, automated tests will often fail when comparison between expected and actual results differ in the slightest, even though the software is working perfectly. When tests routinely fail due to such issues, test results stop delivering value and become ignored. If an actual bug comes along, the test will catch it, but no one will pay attention until it is too late.

## Bad comparisons lead to bad software

It is easy to blame developers and test engineers with the claim that comparisons are written lazily and should be corrected, but this is not necessarily practical or true. For example, order of value or keys can matter in some contexts, even if strict JavaScript language specifications say it does not. However, no ones should make a failing test more forgiving without a full understanding of the requirements, and to expect an uninformed developer to make this call is not realistic. An intuitive call that "key order does not matter" might open the door to a bug when a software process downstream requires a certain order.

It is also possible that tests can run perfectly from one software version and report full coverage of the both old and new code, yet still miss on validating essential new requirements. For example, an existing test that confirms that the contents of two objects match exactly would not also verify a new requirement that the two objects match in reference, i.e., point to the same place in memory. The test should fail but will not, and without that feedback, the new requirement will remain unverified indefinitely.

## How to compare two values does not have one answer

There is also the question of how to compare or manage any JavaScript value. Should it be made into JSON, which means we must assume that no circular references exist?  If there are circular references, how do we avoid infinite loops when doing deep comparisons?  Should the whole of two objects be considered when comparing them, or just the "interesting" parts?  And what constitutes a match, anyway? Should we use "truthy" or "falsy" comparison vs. strict comparisons, such as what happens with `==` vs `===`?  Can we specialize these styles of comparison to certain properties only?  How can we do any of this without writing a ton of special-cased code? 

Finally, how do we control the whole operation so that our performance is kept manageable?  Should we stop comparing as soon as we find a difference, or keep going?  How do we keep our result lean enough to be practical instead of emitting a JSON string that takes up 10 lines?  Have we really thought of everything?

## Quick JS Compare will get you through it all

Quick JS Compare is a software utility that will compare two JavaScript-based values in a highly customizable, repeatable fashion with all the various nuances and behaviors spelled out in visible and maintainable configurations that generally will not require any special-case code. It directly supports comparison of scalar types, e.g., numbers, strings, and booleans, as well as objects, maps, arrays, and sets, and can be specialized to exactly the requirements your project might have. It is also maximally extensible. You can perform comparisons in phases and link the operations with a small amount of code. It also will accept your own versions of a comparison method, in case your requirements are exotic. The same flexibility is offered in how results are rendered as well.

Most of all, it's quick, lightweight, and keeps the operations minimal. It automatically protects against breakage and infinite loops that are caused by circular references. It produces results that are only as verbose or sparse as you need, and will only show values as the same or different if such results can be precisely determined.

In short, Quick JS Compare should fit your need for just about any value comparison in JavaScript you will ever need to do, and do so in a straightforward, maintainable, and configurable way. It will spare you the repeated drudgery of dealing with the unpredicted difficulties of discovering changes in your data and boost your confidence that all is well as you release new features and fixes to your customer base.

# Getting started

## Installation

- Use Yarn or NPM to install Quick JS Compare.

## Usage

### Loading

- In TypeScript or JavaScript, access the utility function or class from the module:

```ts
import { compare } from 'quick-js-compare'; // function for TypeScript, ES6+
import { Compare } from 'quick-js-compare'; // class for TypeScript, ES6+
```

or

```js
const { compare } = require('quick-js-compare'); // function for JavaScript
const { Compare } = require('quick-js-compare'); // class for ES6+
```
### Calling the function

The function can be invoked as follows:

```js
const value1 = ....<any value>...;
const value2 = ...<any other value>...;

const comparison = compare(value1, value2);
```

The result will be rendered as an object with properties `left`, `same`, `right`, and `status` which are populated with the results of the comparison. Properties `left` and `right` contain the differences found in the first and second value, respectively, and `same` will hold what matches.

### Directly supported types

The broad categories of data supported in this package are ones whose primary use is to hold data. These types include the native data types defined in the [ES2020+ spec](https://tc39.es/ecma262/2020/) and are categorized as follows:

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

Because this package provides comparison only and is meant for practical use, types of data are categorized around their behavior in representing data and not around their formal definitions. For example, data of type `string` or `Date` can be said to hold multiple values, but are compared as scalars, since most JavaScript programming works with these types as single values. Or, although a function is primarily used for programming, its capacity to hold values as properties makes it supportable as a composite data type.

The returned object will contain the following. Values are determined to be exclusive, differing, or the same between the values by the comparison methods that are applied. In all cases, a `result` object will be returned with the following fields:

* `leftOnly`: (composite values only) data only in `value1`
* `left`: data in `value1` that differs from `value2`.
* `leftSame`: data in `value1` that is the same as `value2`.
* `rightSame`: data in `value2` that is the same as `value1`.
* `right`: data in `value2` that differs from `value1`.
* `rightOnly`: (composite values only) data only in `value2`

Each of these fields are arrays of objects that describe the comparison results that contain at least the type and value of the compared item. If there is no result, the field is not included.

## Examples

### Scalars

Quick JS Compare will handle scalar types (i.e., data stores with only one value, such as `number`, `boolean`, or `string`). A simple use case shows its default behavior (no options):

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
 "left": {
   "a": 1,
   "x": 5,
   "details": {
     "cost": 2.14
   }
 },
 "same": {
   "b": "abc",
   "c": "def",
   "details": {
     "title": "Shopping list"
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

Quick JS Compare accepts an `options` argument to customize the comparison and data rendering behavior (`*` denotes default setting).

```js
{
 compare: <object> | "Exact"* | "General" | "ExactStructure" | "GeneralStructure" | <function>
 render: <object> | "Standard"* | "Verbose" | <function>
}
```

When there is no options argument, the default values for `compare` and `render` are `Exact` and `Standard` (see below).

### `compare` option property

The following settings are supported as values for the `compare` property. When omitted, the default setting will be `General` (see below).

#### Options as object

The following combinations of properties and values are supported when options for comparison are specified in an object:

 * `"compareScalar"`: for comparison of scalar values (e.g., `"number"`, `"boolean"`, or `"string"`)
   * `"strict"`*: match only when identical in both value and type, i.e., as with `"==="`
   * `"abstract"`: match when identical or when semantically equivalent, i.e., as with `"=="` (a "truthy" or "falsy" match condition)
   * `"typeOnly"`: match when identical in type only, without comparing values
   * `"alwaysSame"`: compared scalars always match, regardless of value or type
   * `"alwaysDifferent`": compared scalars never match, even if identical
   * `"alwaysUndefined`": never match nor differ (values not included in results)
   * *function*: use function to compare (see below)    * *function*: use function to compare (see below)

 * `compareObject`: for comparison for any object with named keys (JavaScript type `object`, `function`), or any two composite values allowed for comparison

   * `"reference"`: match only when identical as references, i.e., when compared objects are references to the same object in memory
   * `"strict"`*: match when objects have same type and matching key/value pairs in identical order
   * `"keyValueOrder"`: match when compared objects have matching key/value pairs in identical order
   * `"keyValue"`: match when compared objects have matching key/value pairs, regardless of order
   * `"keyOrder"`: match when compared objects have matching keys in the same order, regardless of their values
   * `"valueOrder"`: match when compared objects have matching values in the same order, regardless of their keys
   * `"keysOnly"`: match when compared objects have matching keys, regardless of their order or their values
   * `"valuesOnly"`: match when compared objects have matching values, regardless of their order or their keys
   * `"typeOnly"`: match when identical in type only, without comparing values
   * `"alwaysSame"`: compared objects always match, regardless of value, type, or structure
   * `"alwaysDifferent`": compared objects never match, even if identical
   * `"alwaysUndefined`": never match nor differ (values not included in results)
   * *function*: use function to compare (see below)

 * `compareMap`: for comparison of objects of type `Map` (JavaScript type `Map`)

   * Same settings and default as `compareObject`. If omitted, `compareObject` settings will be used.

 * `compareArray`: for comparison of arrays

   * `"reference"`: match only when identical as references, i.e., when compared arrays are references to the same object in memory
   * `"strict"`*: match when objects have same type and matching values in same positions
   * `"valueOrder"`: match when compared arrays have matching values in the same order
   * `"valuesOnly"`: match when compared arrays have matching values, regardless of their order
   * `"sizeOnly"`: match when compared arrays have matching number of elements, regardless of their contents
   * `"typeOnly"`: match when identical in type only, without comparing values
   * `"alwaysSame"`: compared arrays always match, regardless of value, type, or size
   * `"alwaysDifferent`": compared arrays never match, even if identical
   * `"alwaysUndefined`": never match nor differ (values not included in results)
   * *function*: use function to compare (see below)

 * `compareSet`: for comparison of sets (JavaScript type `Set`)
    * `"reference"`: match only when identical as references, i.e., when compared sets are references to the same object in memory
   * `"strict"`*: match when objects have same type and values in same positions
   * `"valuesOnly"`: match when compared sets have matching values
   * `"sizeOnly"`: match when compared arrays have matching number of elements, regardless of their contents
   * `"typeOnly"`: match when identical in type only, without comparing values
   * `"alwaysSame"`: compared sets always match, regardless of value, type, or size
   * `"alwaysDifferent`": compared sets never match, even if identical
   * `"alwaysUndefined`": never match nor differ (values not included in results)    * *function*: use function to compare (see below)

In all cases, a comparison operation may be supplied as a function whose job is to compare the two arguments, and return `true` if considered the same, `false` if considered different, or `undefined` if it cannot be determined. The two arguments may be assumed to be of compatible types when called. // TODO - pass options to function?  Object??

#### Options as strings

String values for the `compare` option behave as shorthand helpers for a style of comparison. Their function is described by their equivalent representations in the previously described option object.

* `Exact`: (default) compare for identical type, value, and structure. Values considered matching if they can be used interchangeably.

 * `compareScalar`: `"strict"`
 * `compareObject`: `"strict"`
 * `compareMap`: `"strict"`
 * `compareArray`: `"strict"`
 * `compareSet`: `"strict"`

* `Equivalent`: compare for matching content and structure, but not as strictly. Objects will match with objects or with maps if their keys and values match and are in the same orders. Arrays will match other arrays if their values match and are in the same order. Sets will match other sets or arrays if they contain the same values.

 * `compareScalar`: `"strict"`
 * `compareObject`: `"keyValueOrder"`
 * `compareMap`: `"keyValueOrder"`
 * `compareArray`: `"valueOrder"`
 * `compareSet`: `"valuesOnly"`

* `General`: compare for functional equivalence. Scalars will match if they are abstractly equivalent, i.e., if the abstract equality operator `==` evaluates to `true`. Objects will match objects or maps if their key/value pairs match identically by key and value, regardless of order. Arrays will match other arrays and sets if they contain the same values.

 * `compareScalar`: `"abstract"`
 * `compareObject`: `"keyValue"`
 * `compareMap`: `"keyValue"`
 * `compareArray`: `"valuesOnly"`
 * `compareSet`: `"valuesOnly"`

* `Structure`: compare for identical form, not content. Scalars will always be considered matching one another. Objects will match objects or maps if they have the same keys, regardless of their order. Arrays and sets will match if they have the same size, regardless of content or types of elements.

 * `compareScalar`: `"alwaysSame"`
 * `compareObject`: `"keysOnly"`
 * `compareMap`: `"keysOnly"`
 * `compareArray`: `"sizeOnly"`
 * `compareSet`: `"sizeOnly"`

### Render options

(incomplete)

The following properties are supported in an option object passed through the `render` property.

* `keyedAsObject`: (`true`/`false`*) When true, return value of any keyed object as a standard object, i.e., key/value pairs of strings as keys
* `setAsArray`: (`true`/`false`*) When true, return value of sets as an array
* `maxDepth`: (integer >= `0`*) Maximum depth from top level of comparison to show. When set to 0, it is all levels.
* `diffOnly`: (`true`/`false`*) Render differences only
* `verbose`: (`true`/`false`*) Include performance, statistics

#### Options as strings

String values for the `render` option behave as shorthand helpers for a style of rendering. Their function is described by their equivalent representations in the previously described option object.

* `General`:
 * `mapAsObject`: true
 * `setAsArray`: true
 * `maxDepth`: 0
 * `diffOnly`: true
 * `verbose`: false

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

