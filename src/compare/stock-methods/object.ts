import Compare from '..';

import {
  actualType,
  isKeyedObjectType,
  isIndexedObjectType,
  Value,
} from '../../lib/types';

import {
  type CompareResult,
  type ComparisonStatus,
  type CompareCompositeToken,
  isMinimalCompareOptionObject,
  isCompareOptionToken,
  isCompareFunction,
  CompareFunction,
} from '../types';

// Because object comparison is supported for values of different types,
// we use this method to "gracefully degrade" the comparison method if 
// the two types do not support the same operations.
const distillComparisonType = (left: Value, right: Value, token: CompareCompositeToken): CompareCompositeToken => {
  const leftType = actualType(left);
  const rightType = actualType(right);
  if (leftType === rightType) {
    return token;
  }

  let distilledToken: CompareCompositeToken = token;
  if (!isKeyedObjectType(leftType) || !isKeyedObjectType(rightType)) {
    switch (token) {
      case 'keyValueOrder':
        distilledToken = 'valueOrder';
        break;
      case 'keyValue':
        distilledToken = 'valueOnly';
        break;
      case 'keyOrder':
      case 'keyOnly':
        distilledToken = 'alwaysDifferent';
        break;
    }
  }

  if (!isIndexedObjectType(leftType) || !isIndexedObjectType(rightType)) {
    switch (distilledToken) {
      case 'indexValue':
      case 'valueOrder':
        distilledToken = 'valueOnly';
        break;
      case 'indexOnly':
        distilledToken = 'alwaysDifferent';
        break;
    }
  }
  return distilledToken;
}


const dummyCompare: CompareFunction = () => false;

export const methodMap: Record<CompareCompositeToken, CompareFunction> = {
  keyValueOrder: dummyCompare,
  keyValue: dummyCompare,
  keyOrder: dummyCompare,
  keyOnly: dummyCompare,
  valueOrder: dummyCompare,
  valueOnly: dummyCompare,
  indexValue: dummyCompare,
  indexOnly: dummyCompare,
};

export const compareObject = (
  left: Value,
  right: Value,
  compareInstance: Compare,
  compositeComparisonResult: CompareResult,
): ComparisonStatus => {
  const rawCompareOption = compareInstance.rawOptions.compare;
  if (isMinimalCompareOptionObject(rawCompareOption)) {
    // Because these stock methods are invoked via helper tokens only, this condition check
    // should not be necessary.
    if (isCompareOptionToken(rawCompareOption.compareObject)) {
      const compareToken = distillComparisonType(left, right, rawCompareOption.compareObject);
      return methodMap[compareToken](left, right, compareInstance, compositeComparisonResult);
    } else if (isCompareFunction(rawCompareOption.compareObject)) {
      // Can happen for custom compare functions specific to standard object
      return rawCompareOption.compareObject(left, right, compareInstance, compositeComparisonResult);
    } else {
      throw new Error('Unsupported condition: stock method called without a compare option token');
    }
  } else {
    throw new Error('Unsupported condition: rawCompareOption is not a minimal compare option object');
  }
  return true;
}
