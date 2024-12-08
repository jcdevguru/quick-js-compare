import {
  type Value,
  typeIsSupported,
  typeIsScalar,
  deriveType
} from '../lib/types';

import {
  isCompareOptionToken,
  type CompareFunc,
  type CompareOptionObject,
  type ComparisonStatus,
  type MinimalCompareOptionObject,
} from './types';

export const ExactComparer = (leftValue: Value, rightValue: Value) : ComparisonStatus => {
  if (leftValue === rightValue) {
    return true;
  }

  const leftType = deriveType(leftValue);

  if (typeIsScalar(leftType)) {
    return false;
  } else if (!typeIsSupported(leftType)) {
    return undefined;
  }

  const rightType = deriveType(rightValue);
  if (typeIsSupported(rightType) && leftType !== rightType) {
    return false;
  }

  // incomplete
  return undefined;
};

export const GeneralComparer = (leftValue: Value, rightValue: Value) : ComparisonStatus => {
  // general match
  if (leftValue == rightValue) {
    return true;
  }

  const leftType = deriveType(leftValue); 
  if (typeIsScalar(leftType)) {
    return false;
  } else if (!typeIsSupported(leftType)) {
    return undefined;
  }

  const rightType = deriveType(rightValue);
  if (!typeIsSupported(rightType)) {
    return undefined;
  }

  // incomplete
  return undefined;
};
 
const strict = (left: Value, right: Value) => left === right;
const reference = strict;
const abstract = (left: Value, right: Value) => left == right;
const typeOnly = (left: unknown, right: unknown): boolean => deriveType(left) === deriveType(right);
const ignore = () => true;

const tokenToFunctionMap: Record<keyof CompareOptionObject, Record<string, CompareFunc>> = {
  compareScalar: { strict, abstract, typeOnly, ignore },
  compareObject: {
    reference,
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
    keyValueOrder: (left, right) => left === right, // TODO: implement
    keyValue: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
  compareArray: {
    reference,
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
    valueOnly: (left, right) => left === right, // TODO: implement
    sizeOnly: (left, right) => left === right, // TODO: implement
    typeOnly,
    ignore,
  },
};

const defaultComparisonObject: MinimalCompareOptionObject = {
  compareScalar: 'strict',
  compareObject: 'keyValueOrder',
  compareMap: 'keyValueOrder',
  compareArray: 'valueOrder',
  compareSet: 'valueOnly',
};

// Incomplete
export const normalizeComparisonObject = (comparisonObject: MinimalCompareOptionObject): MinimalCompareOptionObject => {
  const result: MinimalCompareOptionObject = comparisonObject;
  for (const k of Object.keys(tokenToFunctionMap) as (keyof MinimalCompareOptionObject)[]) {
    const spec = comparisonObject[k] ?? defaultComparisonObject[k];
    if (isCompareOptionToken(spec)) {
      result[k] = tokenToFunctionMap[k][spec] as CompareFunc;
    }
  }
  return result;
};
