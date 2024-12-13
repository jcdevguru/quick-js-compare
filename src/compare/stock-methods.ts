import {
  type Value,
  actualType,
  isScalar,
} from '../lib/types';

import type {
  CompareFunction,
  CompareOptionObject,
  ComparisonStatus,
  CompareOptionMethodObject,
  CompareResult,
} from './types';
import CoreCompare from '.';

const exact = (left: Value, right: Value) => left === right;
const reference = exact;
const abstract = (left: Value, right: Value) => left == right;
const typeOnly = (left: unknown, right: unknown): boolean => actualType(left) === actualType(right);
const ignore = () => true;

export const optionTokenToStockMethodMap: Record<keyof CompareOptionObject, Record<string, CompareFunction>> = {
  compareScalar: { strict: exact, abstract, typeOnly, ignore },
  compareObject: {
    reference,
    strict: exact, // TODO: implement
    keyValueOrder: (left, right) => left === right, // TODO: implement
    keyValue: (left, right) => left === right, // TODO: implement
    keyOrder: (left, right) => left === right, // TODO: implement
    valueOrder: (left, right) => left === right, // TODO: implement
    keyOnly: (left, right) => left === right, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareMap: {
    reference,
    strict: exact, // TODO: implement
    keyValueOrder: (left, right) => left === right, // TODO: implement
    keyValue: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareArray: {
    reference,
    strict: exact, // TODO: implement
    indexValue: (left, right) => left === right, // TODO: implement
    valueOrder: (left, right) => left === right, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    indexOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareSet: {
    reference,
    strict: exact, // TODO: implement
    valueOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
};

// Assume that left and right are supported types and are not a mix of composite and scalar
export const stockComparer = (left: Value, right: Value, compareInst: CoreCompare, result: CompareResult): ComparisonStatus => {
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
