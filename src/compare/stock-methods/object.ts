import Compare from '..';

import {
  actualType,
  isKeyedObjectType,
  isOrderedObjectType,
  Value,
  isSetObject,
  SetObject,
  MapObject,
  Composite,
} from '../../lib/types';

import {
  type CompareResult,
  type ComparisonStatus,
  type CompareCompositeToken,
  isMinimalCompareOptionObject,
  isCompareOptionToken,
  isCompareFunction,
  CompareFunction,
  ValueResult,
  isCompareOptionMethodObject,
} from '../types';

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

const values = (v: Value): Composite => {
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

const valuesOnly: CompareFunction = (left: Value, right: Value, compareInstance: Compare, objectComparisonResult: CompareResult) => {
  const leftSame: Array<ValueResult> = objectComparisonResult.leftSame || [];
  const rightSame: Array<ValueResult> = objectComparisonResult.rightSame || [];

  if (isSetObject(left) && isSetObject(right)) {
    // Optimize for sets by weeding out values that compare equal
    const leftSet = new Set<Value>();
    const rightSet = new Set<Value>();
    const sameSet = new Set<Value>();
    for (const leftValue of left) {
      if (right.has(leftValue)) {
        leftSame.push(valueToValueResult(leftValue));
        rightSame.push(valueToValueResult(leftValue));
        sameSet.add(leftValue);
      } else {
        leftSet.add(leftValue);
        rightSet.add(leftValue);
      }
    }

    Array.from(right).filter(v => !leftSet.has(v) && !sameSet.has(v)).forEach(v => rightSet.add(v));

    return valuesOnly(values(leftSet), values(rightSet), compareInstance, objectComparisonResult);
  }

  // Incomplete
  objectComparisonResult.left = [valueToValueResult(left)];
  objectComparisonResult.right = [valueToValueResult(right)];

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
  objectComparisonResult: CompareResult,
): ComparisonStatus => {
  const rawCompareOption = compareInstance.rawOptions.compare;
  const compareOption = compareInstance.options.compare;
  if (isMinimalCompareOptionObject(rawCompareOption)) {
    // Because these stock methods are invoked via helper tokens only, this condition check
    // should not be necessary.
    if (isCompareOptionToken(rawCompareOption.compareObject)) {
      const compareToken = distillComparisonType(left, right, rawCompareOption.compareObject);
      if (isCompareFunction(objectTokenToMethodMap[compareToken])) {
        return objectTokenToMethodMap[compareToken](left, right, compareInstance, objectComparisonResult);
      } else {
        throw new Error(`Unsupported condition: no stock method defined for compare option token ${compareToken}`);
      }
    } else if (isCompareOptionMethodObject(compareOption)) {
      // Can happen for custom compare functions specific to standard object
      return compareOption.compareObjectMethod(left, right, compareInstance, objectComparisonResult);
    } else {
      throw new Error('Unsupported condition: unexpected compare option');
    }
  } else {
    throw new Error('Unsupported condition: rawCompareOption is not a minimal compare option object');
  }
  // Incomplete
  return true;
}
