import {
  type Value,
  actualType,
  isScalar,
} from '../../lib/types';

import type {
  CompareFunction,
  ComparisonStatus,
  CompareResult,
} from '../types';

import type {
  CompareConfigOptions,
  CompareMethodConfig
} from '../types/config';

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

export const compareTokenToStockMethodMap: Record<keyof CompareConfigOptions, Record<string, CompareFunction>> = {
  compareScalar: { strict: exact, abstract, typeOnly: matchTypes, alwaysSame, alwaysDifferent, alwaysUndefined },
  compareObject: {
    reference,
    strict: strict(compareObject, 'StdObject'),
    keyValueOrder: compareObject,
    keyValue: compareObject,
    keyOrder: compareObject,
    valueOrder: compareObject,
    keyOnly: compareObject,
    valuesOnly: compareObject,
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
    valuesOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
  compareSet: {
    reference,
    strict: exact, // TODO: implement
    valuesOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly: matchTypes,
    alwaysSame,
    alwaysDifferent,
    alwaysUndefined,
  },
};

// Assume that left and right are supported types and are not a mix of composite and scalar
export const stockComparer = (left: Value, right: Value, compareInst: Compare, result: CompareResult): ComparisonStatus => {
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

  return comparer(left, right, compareInst, result);
};
