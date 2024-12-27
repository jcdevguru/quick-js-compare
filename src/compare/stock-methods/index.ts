import {
  ArrayObject,
  MapObject,
  SetObject,
  type Value,
  actualType,
  isScalar,
} from '../../lib/types';

import type {
  CompareFunction,
  ComparisonStatus
} from '../types';

import type {
  CompareMethodConfig,
  StockCompareConfig
} from '../types/config';

import Compare from '..';

import { compareObject } from './object';

import * as SetMethods from './set';
import * as ArrayMethods from './array';
import * as MapMethods from './map';

const matchTypes = (left: unknown, right: unknown): boolean => actualType(left) === actualType(right);
const compositeStrict = <T extends Value>(compareFunction: CompareFunction<T>, typeName: string ): CompareFunction =>
  (left: Value, right: Value, compareInst) =>   
      actualType(left) === typeName &&
      matchTypes(left, right) &&
      compareFunction(left as T, right as T, compareInst)
    ;

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
    strict: compositeStrict(compareObject, 'StdObject'),
    keyValueOrder: compareObject,
    keyValue: compareObject,
    keyOrder: compareObject,
    valueOrder: compareObject,
    keyOnly: compareObject,
    valuesOnly: compareObject,
    sizeOnly: compareObject,
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareMap: {
    reference,
    strict: compositeStrict(MapMethods.strict, 'MapObject'),
    keyValueOrder: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    keyValue: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    keyOrder: (left: MapObject, right: MapObject) => left === right, // TODO: implement
    keyOnly: (left: MapObject, right: MapObject) => left === right, // TODO: implement
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
    strict: compositeStrict(ArrayMethods.strict, 'ArrayObject'),
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
    strict: compositeStrict<SetObject>(SetMethods.strict, 'SetObject'),
    valuesOnly: SetMethods.valuesOnly,
    sizeOnly: SetMethods.sizeOnly,
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
};

// Assume that left and right are supported types and are not a mix of composite and scalar
export const stockComparer = (left: Value, right: Value, compareInst: Compare): ComparisonStatus => {
  const config = compareInst.compareConfig as CompareMethodConfig;
  
  let comparer: CompareFunction;
  if (isScalar(left)) {
    comparer = config.compareScalarMethod;
  } else {
    const leftType = actualType(left);
    const rightType = actualType(right);
    if (leftType === rightType) {
      switch (leftType) {
        case 'StdObject':
          comparer = config.compareObjectMethod;
          break;
        case 'Map':
          comparer = config.compareMapMethod;
          break;
        case 'Array':
          comparer = config.compareArrayMethod;
          break;
        case 'Set':
          comparer = config.compareSetMethod;
          break;
        default:
          comparer = config.compareObjectMethod;
      }
    } else {
      comparer = config.compareObjectMethod;
    }
  }

  return comparer(left, right, compareInst);
};
