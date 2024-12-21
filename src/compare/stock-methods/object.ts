import Compare from '..';

import {
  type Value,
  type SetObject,
  type MapObject,
  actualType,
  isKeyedObjectType,
  isOrderedObjectType,
  isSetObject,
} from '../../lib/types';

import {
  type CompareResult,
  type ComparisonStatus,
  type CompareFunction,
  isCompareFunction,
} from '../types';

import {
  type CompareCompositeToken,
  isMinimalCompareConfigOptions,
  isCompareConfigToken,
  isCompareMethodConfig,
} from '../types/config';

import * as SetMethods from './set';

import { valueToValueResult } from '../util';

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
      case 'keyOnly':
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

const values = (v: Value): Iterable<Value> => {
  const typeName = actualType(v);
  switch (typeName) {
    case 'ArrayObject':
    case 'StdObject':
      return Object.values(v as Array<Value>);
    case 'MapObject':
      return (v as MapObject).values();
    case 'SetObject':
      return v as SetObject;
    default:
      throw new Error('Unsupported condition: value is not a composite');
  }
}

const valuesOnly: CompareFunction = (left: Value, right: Value, compareInstance: Compare, subResult: CompareResult) => {
  if (isSetObject(left) && isSetObject(right)) {
    return SetMethods.valuesOnly(left, right, compareInstance, subResult);
  }
  // Incomplete
  subResult.left = [...values(left)].map(v => valueToValueResult(v));
  subResult.right = [...values(right)].map(v => valueToValueResult(v));

  return false;
}

const objectTokenToMethodMap: Partial<Record<CompareCompositeToken, CompareFunction>> = {
  keyValueOrder: dummyCompare,
  keyValue: dummyCompare,
  keyOrder: dummyCompare,
  keyOnly: dummyCompare,
  valueOrder: dummyCompare,
  valuesOnly
};

export const compareObject = (
  left: Value,
  right: Value,
  compareInstance: Compare,
  subResult: CompareResult,
): ComparisonStatus => {
  const compareOptions = compareInstance.compareOptions;
  const compareConfig = compareInstance.compareConfig;
  if (isMinimalCompareConfigOptions(compareOptions)) {
    // Because these stock methods are invoked via helper tokens only, this condition check
    // should not be necessary.
    if (isCompareConfigToken(compareOptions.compareObject)) {
      const compareToken = distillComparisonType(left, right, compareOptions.compareObject);
      if (isCompareFunction(objectTokenToMethodMap[compareToken])) {
        return objectTokenToMethodMap[compareToken](left, right, compareInstance, subResult);
      } else {
        throw new Error(`Unsupported condition: no stock method defined for compare option token ${compareToken}`);
      }
    } else if (isCompareMethodConfig(compareConfig)) {
      // Can happen for custom compare functions specific to standard object
      return compareConfig.compareObjectMethod(left, right, compareInstance, subResult);
    } else {
      throw new Error('Unsupported condition: unexpected compare option');
    }
  } else {
    throw new Error('Unsupported condition: compareOption is not a minimal compare option object');
  }
  // Incomplete
  return true;
}
