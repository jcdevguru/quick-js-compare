import {
  type Value,
  actualType,
  isScalar,
} from '../../lib/types';

import type {
  CompareFunction,
  CompareOptionObject,
  ComparisonStatus,
  CompareOptionMethodObject,
  CompareResult,
} from '../types';
import Compare from '..';

import { compareObject } from './object';

const matchTypes = (left: unknown, right: unknown): boolean => actualType(left) === actualType(right);
const strict = (compareFunction: CompareFunction, typeName: string): CompareFunction =>
  (left, right, compareInst, result) =>
    actualType(left) === typeName &&
    matchTypes(left, right) &&
    compareFunction(left, right, compareInst, result);

const exact = (left: Value, right: Value) => left === right;
const reference = exact;
const abstract = (left: Value, right: Value) => left == right;
const alwaysSame = () => true;
const alwaysDifferent = () => false;
const alwaysUndefined = () => undefined;

export const optionTokenToStockMethodMap: Record<keyof CompareOptionObject, Record<string, CompareFunction>> = {
  compareScalar: { strict: exact, abstract, typeOnly: matchTypes, alwaysSame, alwaysDifferent, alwaysUndefined },
  compareObject: {
    reference,
    strict: strict(compareObject, 'StdObject'),
    keyValueOrder: compareObject,
    keyValue: compareObject,
    keyOrder: compareObject,
    valueOrder: compareObject,
    keyOnly: compareObject,
    valueOnly: compareObject,
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareMap: {
    reference,
    strict: exact, // TODO: implement
    keyValueOrder: (left, right) => left === right, // TODO: implement
    keyValue: (left, right) => left === right, // TODO: implement
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareArray: {
    reference,
    strict: exact, // TODO: implement
    valueOrder: (left, right) => left === right, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareSet: {
    reference,
    strict: exact, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
};

// Assume that left and right are supported types and are not a mix of composite and scalar
export const stockComparer = (left: Value, right: Value, compareInst: Compare, result: CompareResult): ComparisonStatus => {
  const options = compareInst.compareOptions as CompareOptionMethodObject;
  
  let comparer: CompareFunction;
  if (isScalar(left)) {
    comparer = options.compareScalar;
  } else {
    const leftType = actualType(left);
    const rightType = actualType(right);
    if (leftType === rightType) {
      switch (leftType) {
        case 'StdObject':
          comparer = options.compareObject;
          break;
        case 'Map':
          comparer = options.compareMap;
          break;
        case 'Array':
          comparer = options.compareArray;
          break;
        case 'Set':
          comparer = options.compareSet;
          break;
        default:
          comparer = options.compareObject;
      }
    } else {
      comparer = options.compareObject;
    }
  }

  return comparer(left, right, compareInst, result);
};
