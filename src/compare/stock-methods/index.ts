import type Compare from '@compare';
import {
  type Value,
  type ArrayObject,
  type MapObject,
  actualType,
  isScalarType,
} from '@lib/types';

import type {
  CompareFunction,
  ComparisonStatus,
} from '@compare/types';

import type {
  CompareMethodConfig,
  CompareMethodConfigKey,
  StockCompareConfig,
} from '@compare/types/config';

import { compareObject } from './object';
import * as SetMethods from './set';
import * as ArrayMethods from './array';
import * as MapMethods from './map';

const matchTypes = (left: unknown, right: unknown): boolean => actualType(left) === actualType(right);
// Method 'exact' might never be called due to strict equality check in Compare.comparer
const exact = (left: Value, right: Value) => left === right;
const reference = exact;

const abstract = (left: Value, right: Value) => left == right;
const alwaysSame = () => true;
const alwaysDifferent = () => false;
const alwaysUndefined = () => undefined;

export const compareTokenToStockMethodMap: StockCompareConfig = {
  compareScalar: { strict: exact, abstract, typeOnly: matchTypes, alwaysSame, alwaysDifferent, alwaysUndefined },
  compareObject: {
    reference,
    strict: compareObject, // TODO: implement
    keyValueOrder: compareObject, // TODO: implement
    keyValue: compareObject, // TODO: implement
    keyOrder: compareObject, // TODO: implement
    valueOrder: compareObject, // TODO: implement
    keysOnly: compareObject, // TODO: implement
    valuesOnly: compareObject, // TODO: implement
    sizeOnly: compareObject, // TODO: implement
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareMap: {
    reference,
    strict: MapMethods.strict,
    keyValueOrder: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    keyValue: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    keyOrder: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    keysOnly: MapMethods.keysOnly,
    valueOrder: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    valuesOnly: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    sizeOnly: MapMethods.sizeOnly,
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareArray: {
    reference,
    strict: ArrayMethods.strict,
    valueOrder: (left: ArrayObject, right: ArrayObject) => left === right, // TODO: implement
    valuesOnly: (left: ArrayObject, right: ArrayObject) => left === right, // TODO: implement
    sizeOnly: ArrayMethods.sizeOnly,
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareSet: {
    reference,
    strict: SetMethods.strict,
    valuesOnly: SetMethods.valuesOnly,
    sizeOnly: SetMethods.sizeOnly,
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
};

// - We allow any scalar to be compared with any other scalar
// - If the left type is a scalar, we assume the right also is because
//   scalar/composite comparisons are disallowed earlier in processing
// - If not comparing scalar (i.e., comparing composites), we use the specific
//   compare method for that type if types match
// - If types don't match, or no specific compare method for the type exists,
//   we use the default compare method for objects

export const stockComparer = (left: Value, right: Value, instance: Compare): ComparisonStatus => {
  let stockMethod: CompareFunction;
  const config = instance.compareConfig as CompareMethodConfig;
  const leftType = actualType(left);

  if (isScalarType(leftType)) {
    stockMethod = config.compareScalarMethod;
  } else if (leftType === actualType(right)) {
    stockMethod = config[`compare${leftType}Method` as CompareMethodConfigKey];
  } else {
    stockMethod = config.compareObjectMethod;
  }
  
  return stockMethod(left, right, instance);
};
