import {
  isComposite,
  actualType,
  type StdObject,
  type Composite,
  type Value,
} from '../lib/types';

import type {
  Comparison,
  StdObjectItem,
  ComparedItem,
  ComparisonResult,
  CompareFunc,
  ComparisonStatus,
} from './types';

import { Option } from '../lib/option';

export const hasDifferences = (result: Partial<Comparison>): boolean =>
  Boolean(result.leftOnly) || Boolean(result.left) || Boolean(result.right) || Boolean(result.rightOnly);

export const valueToComparedItem = (value: Value): ComparedItem => ({ typeName: actualType(value), value});

export const stdObjectEntriesByKey = (obj: StdObject): Record<string, StdObjectItem> => 
  Object.entries(obj).reduce((acc: Record<string, StdObjectItem>, [key, value], index) => {
    acc[key] = { key, index, ...valueToComparedItem(value) };
    return acc;
  }, {});

// incomplete
export const wrapComparer = (comparer: CompareFunc) => (left: Value, right: Value, options: Option): ComparisonResult => {
  const comparisonStatus = comparer(left, right, options);
  const result: ComparisonResult = {};

  switch (comparisonStatus) {
    case true:
      result.leftSame = [];
      result.rightSame = [];
      break;
    case false:
      result.left = [];
      result.right = [];
      break;
  }
  return result;
};


export const statusToResult = (leftItem: ComparedItem, rightItem: ComparedItem, status: ComparisonStatus): ComparisonResult => {
  const result: ComparisonResult = {};

  switch (status) {
    case true:
      result.leftSame = [leftItem];
      result.rightSame = [rightItem];
      break;
    case false:
      result.left = [leftItem];
      result.right = [rightItem];
      break;
  }
  return result;
};