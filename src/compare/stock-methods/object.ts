import type Compare from '@compare';

import {
  type Value,
  actualType,
  isKeyedObjectType,
  isOrderedObjectType,
} from '@lib/types';

import {
  type ComparisonStatus,
  type CompareFunction,
  isCompareFunction,
} from '@compare/types';

import {
  type CompareCompositeToken,
  isMinimalCompareConfigOptions,
  isCompareConfigToken,
  isCompareMethodConfig,
} from '@compare/types/config';


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
        distilledToken = 'valuesOnly';
        break;
      case 'keyOrder':
      case 'keysOnly':
        distilledToken = 'alwaysDifferent';
        break;
    }
  }

  if (!isOrderedObjectType(leftType) || !isOrderedObjectType(rightType)) {
    switch (distilledToken) {
      case 'keyValueOrder':
        distilledToken = 'keyValue';
        break;
      case 'valueOrder':
        distilledToken = 'valuesOnly';
        break;
    }
  }
  return distilledToken;
}


const dummyCompare: CompareFunction = () => false;


const objectTokenToMethodMap: Partial<Record<CompareCompositeToken, CompareFunction>> = {
  keyValueOrder: dummyCompare,
  keyValue: dummyCompare,
  keyOrder: dummyCompare,
  keysOnly: dummyCompare,
  valueOrder: dummyCompare,
  valuesOnly: dummyCompare,
};

export const compareObject = (
  left: Value,
  right: Value,
  compareInstance: Compare
): ComparisonStatus => {
  const compareOptions = compareInstance.compareOptions;
  const compareConfig = compareInstance.compareConfig;
  if (isMinimalCompareConfigOptions(compareOptions)) {
    // Because these stock methods are invoked via helper tokens only, this condition check
    // should not be necessary.
    if (isCompareConfigToken(compareOptions.compareObject)) {
      const compareToken = distillComparisonType(left, right, compareOptions.compareObject);
      if (isCompareFunction(objectTokenToMethodMap[compareToken])) {
        return objectTokenToMethodMap[compareToken](left, right, compareInstance);
      } else {
        throw new Error(`Unsupported condition: stock method defined incorrectly for compare option token ${compareToken}`);
      }
    } else if (isCompareMethodConfig(compareConfig)) {
      // Can happen for custom compare functions specific to standard object
      return compareConfig.compareObjectMethod(left, right, compareInstance);
    } else {
      throw new Error('Unsupported condition: unexpected compare option');
    }
  } else {
    throw new Error('Unsupported condition: compareOption is not a minimal compare option object');
  }
  // Incomplete
  return true;
}
