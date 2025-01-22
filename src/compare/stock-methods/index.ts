import type Compare from '@compare';
import {
  type Value,
  type ArrayObject,
  type MapObject,
  actualType,
  isScalarType,
} from '@lib/types';

import type {
  ComparisonResult,
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

export type StockSubResultSetter = (result: CompareResult) => void;
export interface StockCompareFunction<T extends Value = Value> {
  (left: T, right: T, instance: Compare, updateSubResult: StockSubResultSetter): ComparisonStatus;
}

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

const selectComparisonMethod = (left: Value, right: Value, config: CompareMethodConfig): StockCompareFunction => {
  const leftType = actualType(left);
  let selectedMethod: CompareFunction | undefined;

  if (isScalarType(leftType)) {
    selectedMethod = config.compareScalarMethod;
  } else if (leftType === actualType(right)) {
    selectedMethod = config[`compare${leftType}Method` as CompareMethodConfigKey];
  } else {
    selectedMethod = config.compareObjectMethod;
  }
  
  return selectedMethod;
};

export const createStockCompareFunction = (updateSubResult: StockSubResultSetter): CompareFunction => 
  (left: Value, right: Value, instance: Compare): ComparisonStatus => {
    const method = selectComparisonMethod(left, right, instance.compareConfig as CompareMethodConfig);
    return method(left, right, instance, updateSubResult);
  };
